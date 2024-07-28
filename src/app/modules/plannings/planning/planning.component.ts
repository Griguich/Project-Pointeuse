import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef, NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {PlanningJsStoreService} from "../services/planningJsStore.service";
import {ShiftJsStoreService} from "../../../shared/services/JsStoreServices/shiftJsStore.service";
import {DecoupageHoraireJsStoreService} from "../../../shared/services/JsStoreServices/decoupageHoraireJsStore.service";
import {DateService} from "../../../shared/services/date.service";
import {EmployeJsStoreService} from "../../employes/service/employeJsStore.service";
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import {SessionService} from "../../../shared/services/session.service";
import {Router} from "@angular/router";
import {PointageModel} from "../../../shared/model/pointage.model";
import {ShiftModel} from "../../../shared/model/shift.model";
import {EmployeeModel} from "../../../shared/model/employee.model";
import {fromEvent, Subject} from "rxjs";
import {JourSemaine} from "../../../shared/enumration/jour.semaine";
import {CorrectionPointageModel} from "../../../shared/model/CorrectionPointage.model";
import {DateInterval} from "../../../shared/model/gui/date-interval";
import {TypePointageJsStoreService} from "../../../shared/services/JsStoreServices/type-pointage-js-store.service";
import {TypePointageModel} from "../../../shared/model/type-pointage.model";
import {RestaurantDataService} from "../../../shared/services/restaurant-data.service";
import {NotificationService} from "../../../shared/services/notification.service";
import {BadgingService} from "../../../shared/services/badging.service";
import {PointingService} from "../../pointage/service/pointing.service";
import {PointeuseRoutingService} from "../../../shared/services/PointeuseRoutingService";
import {PointageTime} from "../../../shared/model/enumeration/pointage-time.enum";
import {EntityAction} from "../../../shared/model/enumeration/entity-action.enum";
import {CorrectionPointageJsStoreService} from "../../correction-pointage/service/correctionPointageJsStore.service";
import {OverlayPanel} from "primeng/overlaypanel";
import {SortEvent} from "primeng/api";
import {NameOfTable} from "../../../shared/model/enumeration/NameOfTable.model";
import {PointingComponent} from "../../shared-live-planning/pointing/pointing.component";
import {RestaurantService} from "../../../shared/services/restaurant.service";
import {InfoRestaurantJsStoreService} from "../../../shared/services/JsStoreServices/infoRestaurantJsStore.service";
import {MacPointeuseService} from "../../../shared/services/mac-pointeuse.service";
import {UserActionDetectorService} from "../../../shared/services/user-action-detector.service";
import {SynchronisationService} from "../../../shared/services/synchronisation.service";
import {ParameterJsStoreService} from "../../parametre-globaux/services/parameter-js-store.service";
import {AutorisationService} from "../../../shared/services/autorisation.service";
import {AutorisationPointageService} from "../../../shared/services/autorisation-pointage.service";
import {PointingJsStoreService} from "../../../shared/services/JsStoreServices/pointing-js-store.service";
import {ContrainteSocialeService} from "../../../shared/services/contrainte-sociale.service";
import {debounceTime, distinctUntilChanged, filter, takeUntil} from 'rxjs/operators';
import {MyrhisIdleSerice} from "../../../shared/services/myrhis.idle.serice";
import Keyboard from 'simple-keyboard';
import {DatePipe} from '@angular/common';
import html2canvas from 'html2canvas';
import {PaginationArgs} from "../../../shared/model/pagination.args";
import {PointingHttpService} from "../../pointage/service/pointing-http.service";
import {AchevalService} from "../../../shared/services/acheval.service";
import {AnomalieJsStoreService} from "../../anomalie/service/anomalieJsStore.service";
import {
  CheckingSocialConstraintsRegularlyService
} from "../../../shared/services/checking-social-constraints-regularly.service";
import {DroitPointeuseEnum} from "../../../shared/model/enumeration/droit-pointeuse.enum";
import {UserPermissionPipe} from "../../../shared/Pipes/user-permission.pipe";

@Component({
  selector: 'rhis-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent extends PointingComponent implements OnInit, AfterViewInit, OnDestroy {
  // the width of a minute
  public widthOfMinute = 1;
  public popUpStyle = {
    width: '800',
    height: '700'
  };
  // list pointage recuperée du IDB
  public pointages: PointageModel[] = [];
  // list shift recuperée du IDB
  public shifts: ShiftModel[] = [];
  // list of displayed employees
  public listEmployees: EmployeeModel[];
  // filter state between pointed or all employees
  public filterState: 'all' | 'pointed' = 'pointed';
  // list employes to display avec pointage et planning
  public currentDateJournee: Date;
  public dateJournee: string;
  public pointageToBeCreated = {error: false, dateJournee: ''};
  public idRestaurant: string;
  public toggle: boolean;
  public header = [];
  public isManager: boolean;
  public leftReal = 0;
  public hourWidth: number = 60 * this.widthOfMinute;
  public employeeBlockWidth: number = 170;
  public verificationResult: any[];
  public employeeCoordiantions = {} as {
    selectedEmployee: any,
    employeeIndex: number
  };
  public personalizedAccess;
  public PLANNING = DroitPointeuseEnum.PLANNING;
  public showEmptyMessage = false;
  public typePointages: TypePointageModel[] = [];
  public manager: EmployeeModel;
  public choosenTypePointage: TypePointageModel;
  public showPopupContrainteSocial;
  public isEntryPointing: number;
  @ViewChild('realTime', { read: ViewContainerRef }) realTime: ViewContainerRef
  @ViewChild('realTimeTemplate', { read: TemplateRef }) realTimeTemplate: TemplateRef<null>;
  @ViewChildren('tableRow', {read: ElementRef}) rows: QueryList<ElementRef>;
  @ViewChildren('employeeHeader', {read: ElementRef}) firstColulmnsEmployees: QueryList<ElementRef>;
  timedOut = false;
  public authorizationLabel: string = this.rhisTranslateService.translate('POINTAGE.AUTHORIZATION');
  public authorizationIdle: number = 0;
  public clicked = false;
  public heureCourant: number;
  public totalPointingHours: string;
  public messagePointeuseBloque = false;
  public hiddenLineRealTime: boolean;
  public leftShiftWithoutPX: string;
  public heightTablePointed: number;
  public maxHeightTablePointed: number;
  public maxWidthPlanning: number;
  public displayBadgeKeyboard = false;
  public limitAbsence: any;
  public printButtonText: string;
  public showVoucherPdf = false;
  public bonContent: string;
  public actualDate: String;
  public actualTime: string;
  public bonTitle: string;
  public selectedEmployee: EmployeeModel;
  public marginLeftValueNew: any;
  public disableScroll = true;
  public isQa = false;
  // si 06h et night egale à true, dans ce cas là, il faut ajouter 24 heures
  protected startTime: string;
  protected startTimeIsNight: boolean;
  protected endTime: string;
  protected endTimeIsNight: boolean;
  private operation: EntityAction;
  private pointageCoordinations = {} as {
    pointageReference: any,
    updatedPointage: any,
    originPointage: any,
    totalPointages: any,
    pointageIndex: number
  };
  private selectedPopOver;
  private isScrollActive = true;
  private orderSort = 0;
  private destroy: Subject<void> = new Subject<void>();
  private timeInPlanningComponent = 0;
  private scrollToRealTimeHandler;
  private scrollTableHandler;
  private scrollableTable;
  private keyBoard: Keyboard;
  private readonly DELAY_TO_SHOW_NOTIFICATION_MESSAGE_AFTER_CLOCK_IN_OR_CLOCK_OUT = 1000;
  // Pagination attributes
  private paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 6};
  private allPointedEmployees = [];
  public heightInterface: any;
  endHour = "";
  onWindowScroll$: Subject<void> = new Subject<void>();
  onScrollableTableScroll$: Subject<void> = new Subject<void>();
  private previousScrollTop: number;
  private previousScrollLeft: number;


  private scrollHandler = this.debounce((event) => {
    const target = event.target as Element;

    if (target instanceof Element) {
      const isScrollingDropdownElement = target.classList.contains("ui-dropdown-items-wrapper");
      if (!isScrollingDropdownElement) {
        const previousScrollLeft = this.previousScrollLeft || 0;

        const scrollLeft = target.scrollLeft || window.scrollX || 0;

        const horizontalScroll = scrollLeft !== previousScrollLeft;

        if (horizontalScroll) {
          this.onWindowScroll$.next();
        }

        this.previousScrollLeft = scrollLeft;
      }
    }
  }, 500);

  constructor(
    private planningsJsStoreService: PlanningJsStoreService,
    private shiftJsStoreService: ShiftJsStoreService,
    private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService,
    public dateService: DateService,
    private employeJsStoreService: EmployeJsStoreService,
    public rhisTranslateService: RhisTranslateService,
    private typePointageJsStoreService: TypePointageJsStoreService,
    private correctionPointageJsStoreService: CorrectionPointageJsStoreService,
    public notificationService: NotificationService,
    private restaurantData: RestaurantDataService,
    public badgingService: BadgingService,
    public pointingService: PointingService,
    public pointeuseRouter: PointeuseRoutingService,
    public router: Router,
    public sessionService: SessionService,
    public restaurantService: RestaurantService,
    public restaurantDataService: RestaurantDataService,
    public infoRestaurantJsStoreService: InfoRestaurantJsStoreService,
    public macPointeuse: MacPointeuseService,
    private synchronisationService: SynchronisationService,
    public userActionService: UserActionDetectorService,
    public parameterJsStoreParameter: ParameterJsStoreService,
    private myRhisIdle: MyrhisIdleSerice,
    private autorisationService: AutorisationService,
    private autorisationPointageService: AutorisationPointageService,
    private pointingJsStoreService: PointingJsStoreService,
    private socialConstraint: ContrainteSocialeService,
    private renderer: Renderer2,
    private self: ElementRef,
    private datePipe: DatePipe,
    private achevalService: AchevalService,
    private anomalieService: AnomalieJsStoreService,
    private checkSocialRegularyService: CheckingSocialConstraintsRegularlyService,
    private pointingHttpService: PointingHttpService,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private droitAccesPointeuse: UserPermissionPipe
  ) {
    super(pointingService, router, sessionService, restaurantService, restaurantDataService,
      infoRestaurantJsStoreService, macPointeuse, badgingService, userActionService, notificationService, parameterJsStoreParameter);
    this.checkParametersChanges();
    this.scrollToRealTimeHandler = () => this.scrollToRealTime();
    // TODO develop onScroll$ logic with debounce to profit from running code out of angular zones

    this.ngZone.runOutsideAngular(() => {
      // window.addEventListener('scroll', this.scrollToRealTimeHandler, true);
      window.addEventListener('scroll', this.scrollHandler, true);

    })

    this.onWindowScroll$.pipe(
      takeUntil(this.destroy),
      debounceTime(1000),
      // distinctUntilChanged()
    ).subscribe(
      () => {
        this.scrollToRealTimeHandler();
        changeDetectorRef.detectChanges();
      })

    // window.addEventListener('scroll', this.scrollToRealTimeHandler, true);

    this.onScrollableTableScroll$.pipe(takeUntil(this.destroy), debounceTime(2000)).subscribe(() => {
      this.updateTableData();
    })
    this.personalizedAccess = sessionService.getpersonalizedAccess();
  }

   debounce(func: Function, wait: number) {
    let timeout: number;
    return function(...args: any) {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  public async ngOnInit() {
    if (location.origin.includes('qa')) {
      this.isQa = true;
    }
    this.filterState = 'pointed';
    this.toggle = false;
    this.btnval = this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.POINTED_BTN');

    this.dateService.clock.pipe(takeUntil(this.destroy)).subscribe((now: Date) => {
      this.timeInPlanningComponent += 1;
      if (now.getHours() === 10 && now.getMinutes() === 0) {
        this.sessionService.setTimeToReload(0);
      }
      if (now.getHours() >= 10 && now.getHours() < 23) {
        this.sessionService.setTimeToReload(this.sessionService.getTimeToReload() + 1);
      }
      if (now.getHours() === 11 && now.getMinutes() === 50) {
        this.sessionService.setForceReload(true);
      }
      this.heureCourant = now.getTime();
      // le changement s'effectue aprés chaque minute
      this.scrollToRealTime();
      this.updateAllEmployeeDataInRealTime();
      // le changement s'effectue aprés chaque 30 minute
      if (this.timeInPlanningComponent === 30) {
        this.timeInPlanningComponent = 0;
        this.scrollToCorrectPosition();
      }
    });
    console.clear();

    this.checkIdleTimeIsOut();

    this.timeOutWarningSubscribe();

    this.autorisationService.getUserAuthorized().pipe(takeUntil(this.destroy)).subscribe(userAuthorized => {
      if (userAuthorized) {
        this.timedOut = false;
      } else {
        this.myRhisIdle.stopIdle();
      }
    });
    // console.log("await 1")
    this.dateJournee = await this.sessionService.getDateJournee();
    this.idRestaurant = await this.sessionService.getIdRestaurant();
    this.currentDateJournee = this.dateService.getCorrectDateJournee();
    this.badgingService.pointingstate.pipe(takeUntil(this.destroy)).subscribe((state: number) => this.isEntryPointing = state);
    this.isManager = await this.sessionService.getIsManager();
    if (this.droitAccesPointeuse.transform(this.sessionService.getpersonalizedAccess(), DroitPointeuseEnum.POINTAGE, this.isManager)) {
      this.manager = (await this.employeJsStoreService.getById(+this.sessionService.getEmploye())).pop();
      // console.log("await 2")
    }
    this.pointageToBeCreated.dateJournee = this.dateJournee;
    await this.getTypePointageRef();
    await this.getData();
    this.getNewShiftsIfSynchronised();

    if (+this.sessionService.getEmploye() === 0) {
      this.router.navigateByUrl('/');
    }
    this.pointingService.currentMessage.pipe(takeUntil(this.destroy)).subscribe((message: string) => {
      message.length > 1 ? this.notificationService.showErrorMessage(message, 'PLANNING_PAGE_PRINCIPALE.INVALID_CONSTRAINT') : null;
      this.constraintsMessage = message;
    });
  }


  public showPopUp($event, popUp, pointage?): void {
    if (this.droitAccesPointeuse.transform(this.sessionService.getpersonalizedAccess(), DroitPointeuseEnum.POINTAGE, this.isManager)) {
      popUp.show($event);
      const time = setTimeout(_ => {
        const arrayShift = Array.from(document.getElementsByClassName('ui-overlaypanel ui-widget ui-widget-content ui-corner-all'));
        const panel = arrayShift[arrayShift.length - 1] as HTMLElement;
        if (pointage) {
          const endPointageHour = this.dateService.getDateFromDateIntervalFor(pointage, 'heureFin');
          const endDecoupage = this.dateService.createDateFromHourAndNightValue(new Date(`${this.dateJournee} ${this.endTime}`), this.endTimeIsNight);
          const differenceInHour = this.dateService.getDiffOn(endDecoupage, endPointageHour, "hours");
          panel.style.marginLeft = '0';
          if (differenceInHour >= 6) {
            panel.style.left = ($event.clientX - 14) + 'px';
            this.renderer.addClass(panel, 'caret_left');
            this.renderer.removeClass(panel, 'caret_right');
          } else {
            panel.style.left = ($event.clientX - 325) + 'px';
            this.renderer.addClass(panel, 'caret_right');
            this.renderer.removeClass(panel, 'caret_left');
          }
          clearTimeout(time);
        }
      }, 0);
    }
  }

  /**
   * Sort list of day view employees list
   * @param: event: holds the field of comparison and the order
   */
  public customSortByEmpl(event: SortEvent): void {
    if (this.orderSort !== event.order) {
      this.orderSort = event.order;
      this.allPointedEmployees = [...this.listEmployees, ...this.allPointedEmployees]
        .sort((firstEmp: any, secondEmp: any) => {
          const value1 = firstEmp[event.field];
          const value2 = secondEmp[event.field];
          let result = null;

          if (value1 == null && value2 != null) {
            result = -1;
          } else if (value1 != null && value2 == null) {
            result = 1;
          } else if (value1 == null && value2 == null) {
            result = 0;
          } else if (typeof value1 === 'string' && typeof value2 === 'string') {
            result = value1.localeCompare(value2);
          } else {
            result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
          }
          return (event.order * result);
        });
      this.listEmployees = this.allPointedEmployees.splice(0, this.paginationArgs.pageSize);
      this.setUpLazyLoading();
    }
  }

  public async pointing(type: boolean): Promise<void> {
    if (!this.sessionService.getPointeuseState()) {
      this.messagePointeuseBloque = true;
    } else if (type) {
      let value = this.sessionService.getNbrTotempPointe();
      value = isNaN(value) ? 1 : Number(value) + 1;
      this.sessionService.setNbrTotempPointe(value);
      const result = await this.pointingService.pointing(this.sessionService.getBadge(), this.choosenTypePointage.libelle)
        if (result){
          const time = setTimeout(async () => {
            await this.setListPointageInLocalStorage();
            await this.quitPointage();
            clearTimeout(time);
          },this.DELAY_TO_SHOW_NOTIFICATION_MESSAGE_AFTER_CLOCK_IN_OR_CLOCK_OUT)
        }else {
          await this.quitPointage();
        }

    } else {
      const result = await this.pointingService.pointing(this.sessionService.getBadge(), '')
        if (result) {
          const time = setTimeout(async () => {
            await this.setListPointageInLocalStorage();
            await this.quitPointage();
            clearTimeout(time);
          }, this.DELAY_TO_SHOW_NOTIFICATION_MESSAGE_AFTER_CLOCK_IN_OR_CLOCK_OUT);
        }else {
          await this.quitPointage();
        }
    }
  }

  private async setListPointageInLocalStorage() {
    const listPointage = await this.getListPointageFromIndexedDbByDateEqualsOrAfterPassedInParameter(this.formattingDateMinusOneMonthToGetDataFromPointageAndCorrectionSavedInIndexedDB());
    await this.sessionService.setAllPointagesInLocalStorage(JSON.stringify(listPointage));
  }
  private async setListCorrectionPointageInLocalStorage() {
    const listCorrectionPointage = await this.getListCorrectionPointageFromIndexedDbByDateEqualsOrAfterPassedInParameter(this.formattingDateMinusOneMonthToGetDataFromPointageAndCorrectionSavedInIndexedDB());
    await this.sessionService.setAllCorrectionPointagesInLocalStorage(JSON.stringify(listCorrectionPointage));
  }

  private formattingDateMinusOneMonthToGetDataFromPointageAndCorrectionSavedInIndexedDB(): string {
    const dateJourneeMinusOneMonth = new Date();
    dateJourneeMinusOneMonth.setMonth(dateJourneeMinusOneMonth.getMonth() - 1);
    return dateJourneeMinusOneMonth.getFullYear() + '-' + (dateJourneeMinusOneMonth.getMonth() + 1).toString().padStart(2, '0') + '-' + dateJourneeMinusOneMonth.getDate().toString().padStart(2, '0');
  }

  private async getListPointageFromIndexedDbByDateEqualsOrAfterPassedInParameter(date: string): Promise<PointageModel[]>  {
    let allPointageList = await this.planningsJsStoreService.getAllPointage();
    const dateMinusOneMonth = new Date(date);
    if (allPointageList.length) {
      allPointageList = allPointageList.filter(pointage =>
        this.dateService.isSameOrAfterWithDate(this.initializeDate(new Date(pointage.dateJournee)), this.initializeDate(dateMinusOneMonth))
      );
    }
    return allPointageList;
  }

  private async getListCorrectionPointageFromIndexedDbByDateEqualsOrAfterPassedInParameter(date: string): Promise<CorrectionPointageModel[]>  {
    let listCorrectionPointage = await this.correctionPointageJsStoreService.getCorrectionList();
    const dateMinusOneMonth = new Date(date);
    if (listCorrectionPointage.length) {
      listCorrectionPointage = listCorrectionPointage.filter(correction =>
        this.dateService.isSameOrAfterWithDate(this.initializeDate(new Date(correction.dayOfActivity)), this.initializeDate(dateMinusOneMonth))
      );
    }
    return listCorrectionPointage;
  }

  initializeDate(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  /**
   *  Display the red vertical line on real time
   */
  public async scrollToRealTime(event = null): Promise<void> {
    // console.log("scroll to real time")
    this.hiddenLineRealTime = true;
    const hourActuel: string = new Date().getHours().toString().padStart(2, '0');
    const minuteActuel = parseInt(new Date().getMinutes().toString().padStart(2, '0'));
    let headerHoursOnly = this.header.filter(value => value.title).map(value => value.title.slice(0, 2));
    const index = headerHoursOnly.findIndex((element: string) => element === hourActuel);
    const firstHourPointing = this.header.filter((value: any) => value.title).map(value => value.title.slice(0, 2))[0];
    if (index !== -1) {
      let diffHours = (+headerHoursOnly[index]) - (+firstHourPointing);
      if (+diffHours < 0) {
        diffHours += 24;
      }
      const table = document.getElementsByClassName('ui-table-scrollable-body')[1];
      if (table)
        this.leftReal= this.realTime.element.nativeElement.left = (diffHours * this.hourWidth + this.employeeBlockWidth + 35 + (minuteActuel * this.widthOfMinute) - table.scrollLeft);
    }
    // console.log("await 5")

    await this.displayLineRealTime();
    this.heightTablePointed = this.listEmployees.length * 72 + 30;
    this.maxHeightTablePointed = +(this.heightInterface.slice(0, -2)) + 20;
  }

  public displayLineRealTime(): any {
    if (this.leftReal <= 140) {
      this.hiddenLineRealTime = false;
    }
  }

  /**
   * Dynamic scroll to the middle of the current time
   */
  public scrollToCorrectPosition(): void {
    const timer = setTimeout(() => {
      const timeActuel: string = new Date().getHours().toString().padStart(2, '0');
      const headerHoursOnly = this.header.filter((value: any) => value.title).map(value => value.title.slice(0, 2));
      const index = headerHoursOnly.findIndex((element: string) => element === timeActuel);
      const firstHourPointing = this.header.filter((value: any) => value.title).map(value => value.title.slice(0, 2))[0];
      if (index !== -1) {
        let diffHours = (+headerHoursOnly[index]) - (+firstHourPointing);
        if (+diffHours < 0) {
          diffHours += 24;
        }
        document.getElementsByClassName('ui-table-scrollable-body')[1].scrollLeft = ((diffHours * this.hourWidth)) - (5 * this.hourWidth);
        this.scrollToRealTime();
        clearTimeout(timer);
      }
    }, 500);
  }

  handleChange() {
    this.toggle = !this.toggle;
    if (!this.toggle) {
      this.filterState = 'pointed';
      this.btnval = this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.POINTED_BTN');
    } else {
  this.filterState = 'all';
  this.btnval = this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.ALL_BTN');}

    this.getData();
  }

  /***
   * Get  list shift, list employees and list pointage from IDB
   */
  public async getData(): Promise<void> {
    this.realTime.clear();
    let pointages: PointageModel[];
    let employees: EmployeeModel[];
    this.paginationArgs.pageNumber = 0;
    this.listEmployees = [];
    if (!this.droitAccesPointeuse.transform(this.sessionService.getpersonalizedAccess(), DroitPointeuseEnum.PLANNING, this.isManager) ) {
      employees = await this.employeJsStoreService.getById(+this.sessionService.getEmploye());
      pointages = await this.planningsJsStoreService.getPointagesByDateJourneeAndIdEmployee(this.dateJournee, [+this.sessionService.getEmploye()]);
      // recupération des pointage de j-1
      const lastDayPointages = await this.achevalService.getYesterdayPoitningsByEmployee();
      // ajouter les pointages d'hier dans la liste
      pointages.push.apply(pointages, lastDayPointages.filter((pointage: PointageModel) => pointage.heureFin == null || pointage.isAcheval === true));

    } else {
      employees = await this.employeJsStoreService.getEmployesList();
      pointages = await this.planningsJsStoreService.getPointagesByDateJournee(this.dateJournee);
      const lastDayPointages = await this.achevalService.getYesterdayPoitnings();
      pointages.push.apply(pointages, lastDayPointages.filter((pointage: PointageModel) => pointage.heureFin == null || pointage.isAcheval === true));
    }
    this.shifts = await this.shiftJsStoreService.getByDateJournee(this.dateJournee);
    employees = this.structureDataToDisplay(pointages, employees);
    if (this.isManager) {
      if (this.filterState === 'pointed') {
        this.allPointedEmployees = employees.filter((employee: EmployeeModel) => employee['shifts'] && employee['shifts'].length);
      } else {
        this.allPointedEmployees = employees;
      }
      this.listEmployees = this.allPointedEmployees.splice(0, this.paginationArgs.pageSize);
    } else {
      this.listEmployees = employees;
    }
    this.getTotalPointedHours();
    this.showEmptyMessage = (!this.listEmployees) || (this.listEmployees.length === 0);
    this.setUpLazyLoading();
    const timer = setTimeout(_ => {
      this.scrollToCorrectPosition();
      this.scrollToRealTime();
      clearTimeout(timer);
    }, 200);
    this.heightTablePointed = this.listEmployees.length * 72 + 30;
    if (this.listEmployees.length) {
      this.realTime.createEmbeddedView(this.realTimeTemplate);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // console.log("await 9")
    this.choosenTypePointage = (await this.typePointageJsStoreService.getOneByLibelle('Terrain')).pop();
    await this.createDayHourlyTable();
    this.scrollToCorrectPosition();
    this.initializeEmployeeColumnHeight(100);
    this.scrollToRealTime();
  }

  /**
   * Get the last hour to display in the table based on the close hour of the day
   */
  private getEndHourIfShouldBeDisplayed(): string {
    const minutePartInEndHour: number = +this.endTime.substring(3, 5);
    const hourPartInEndHour: string = this.endTime.substring(0, 2);
    if (minutePartInEndHour === 0) {
      return hourPartInEndHour + ':00';
    } else if (minutePartInEndHour > 30) {
      const lastHour = +hourPartInEndHour + 1;
      return `${(lastHour !== 24 ? lastHour : 0).toString().padStart(2, '0')}:00`;
    }
    return '';
  }

  public clickedAbsence(event: any, totalShiftInMinute: number, shiftStarHour: string, index: number): void {
    this.limitAbsence = event;
    if (this.limitAbsence) {
      if (this.limitAbsence.heureDebut instanceof Date) {
        this.limitAbsence.heureDebut = this.dateService.getHHmmformatFromDateAndWithSeparator(this.limitAbsence.heureDebut, ':');
      }
      if (this.limitAbsence.heureFin instanceof Date) {
        this.limitAbsence.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(this.limitAbsence.heureFin, ':');
      }
      this.printButtonText = this.rhisTranslateService.translate(this.limitAbsence.libelle === 'Retard' ? 'POINTAGE.BON_RETARD' : 'POINTAGE.BON_DEPART');
      const decaleSize = (index === 0 ? Number(shiftStarHour.substring(3, 5)) : 0) + 11;
      if (this.limitAbsence.libelle === 'Retard') {
        this.marginLeftValueNew = ((this.limitAbsence.arrivee / 2) + decaleSize) + 'px';
      } else {
        if (this.limitAbsence.arrivee < 0) {
          this.marginLeftValueNew = (index === 0 ? (totalShiftInMinute - (this.limitAbsence.totalMinutes / 2)) : this.limitAbsence['totalMinutesPointage'] + (this.limitAbsence.totalMinutes / 2)) + decaleSize + (Math.abs(this.limitAbsence.arrivee)) + 'px';
        } else {
          this.marginLeftValueNew = (index === 0 ? (totalShiftInMinute - (this.limitAbsence.totalMinutes / 2)) : this.limitAbsence['totalMinutesPointage'] + (this.limitAbsence.totalMinutes / 2)) + decaleSize + 'px';
        }
      }
    }

  }

// ------------------------- GET PAGINATED DATA -------------------------------------

  public async printVoucher(employe: EmployeeModel, pointage: PointageModel, popover: any): Promise<void> {
    // console.log("await 10")
    const listPointage = await this.planningsJsStoreService.getPointagesByIdFront(pointage.idFront);
    pointage = listPointage.pop();
    this.selectedEmployee = employe;
    this.showVoucherPdf = true;
    popover.hide();
    this.actualDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    this.actualTime = this.datePipe.transform(new Date(), 'HH:mm');
    this.bonTitle = this.rhisTranslateService.translate(this.limitAbsence.libelle === 'Retard' ? 'POINTAGE.BON_RETARD' : 'POINTAGE.BON_DEPART');
    if (this.limitAbsence.libelle === 'Retard') {
      this.bonTitle = this.rhisTranslateService.translate('POINTAGE.BON_RETARD');
      this.bonContent = this.rhisTranslateService.translate('POINTAGE.TEXT4');
      if (!pointage.voucherPrintState || pointage.voucherPrintState === 2) {
        if (!pointage.voucherPrintState) {
          pointage.voucherPrintState = 1;
        } else if (pointage.voucherPrintState === 2) {
          pointage.voucherPrintState = 3;
        }
        this.planningsJsStoreService.updatePointage(pointage);
      }
    } else {
      this.bonTitle = this.rhisTranslateService.translate('POINTAGE.BON_DEPART');
      this.bonContent = this.rhisTranslateService.translate('POINTAGE.TEXT2');
      if (!pointage.voucherPrintState || pointage.voucherPrintState === 1) {
        if (!pointage.voucherPrintState) {
          pointage.voucherPrintState = 2;
        } else if (pointage.voucherPrintState === 1) {
          pointage.voucherPrintState = 3;
        }
        this.planningsJsStoreService.updatePointage(pointage);
      }
    }
    const timer = setTimeout(() => {
      this.captureScreen();
      clearTimeout(timer);
    }, 1000);
  }

  // ------------------------------------ END GET PAGINATED DATA ------------------------------


  // public filter(filter: 'all' | 'pointed'): void {
  //   this.filterState = filter;
  //   this.getData();
  // }
  btnval: string;

  /**
   * Display Report to Capture
   */
  public async captureScreen(): Promise<void> {
    // console.log("await 11")
    const voucher = document.getElementById('voucher');
    const canvas = await html2canvas(voucher);
    const mywindow = window.open('', '_self', 'toolbar=0,scrollbars=0,status=0');
    mywindow.document.write('<html><head><title></title></head><body style="display: flex; justify-content: center">');
/*    const image = document.createElement('img'); // create an image object
    image.src = canvas.toDataURL();
    image.width = 650;
    image.height = 350;*/
    mywindow.document.body.appendChild(canvas);
/*
    mywindow.document.write('</body></html>');
*/
    mywindow.document.close();
    mywindow.focus();
    this.showVoucherPdf = false;
    mywindow.onload = function (loadEvent) {
      mywindow.onafterprint = function (printEvent) {
        mywindow.close();
        location.reload();
      };
      mywindow.print();
    };
  }


  /**
   * Calculate margin between ``pointages`` associated for the same shift
   * Calculate too the margin left from the nearest hour (minute margin) for single ``pointages``
   * @param: pointages
   * @param: index
   */
  public getMarginLeft(shift, index: number, widthOfMinute: number, employee, dateService: DateService): number {
    if (shift) {
      if (shift.idShift === null) {
        return Number(shift['pointages'][0].heureDebut.substring(3, 5)) * this.widthOfMinute;
      } else {
        const pointage = shift['pointages'][index];
        const phaseFromNearestHour = Number(shift.heureDebut.substring(3, 5));
        if (index === 0) {
          if (pointage.arrives >= 0) {
            const startInnerFirstPointage = dateService.createDateFromHourAndNightValue(new Date(`${pointage.dateJournee} ${pointage.heureDebut}`), pointage.heureDebutIsNight);
            const startShift = dateService.createDateFromHourAndNightValue(new Date(`${shift.dateJournee} ${shift.heureDebut}`), shift.heureDebutIsNight);
            const innerDifference = dateService.getDiffInMinutes(startInnerFirstPointage, startShift);
            const intersections: any[] = [];
            employee.shifts.map(s => s.pointages).forEach((pointages: any[]) => {
              if (pointages && pointages.length) {
                pointages.forEach(p => {
                  const intersection = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(p, shift);
                  if ((intersection[0] != null) && (intersection[1] != null)) {
                    intersections.push(p);
                  }
                });
              }
            });
            if (intersections.length) {
              intersections.sort((firstPointage, secondPointage) => dateService.isSameOrBeforeByDayTimeAndIsNight(firstPointage, secondPointage) ? -1 : 1);
              if (pointage.idFront !== intersections[0].idFront) {
                const intersection = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(intersections[0], shift);
                const outerDifference = dateService.getDiffInMinutes(intersection[1], intersection[0]);
                shift.pointages[0].arrives = innerDifference - outerDifference;
                return ((pointage.arrives <= 0 ? (pointage.arrives + phaseFromNearestHour) : 0) + outerDifference) * widthOfMinute;
              } else {
                shift.pointages[0].arrives = innerDifference;
              }
            }
          }
          return pointage.arrives <= 0 ? (pointage.arrives + phaseFromNearestHour) * this.widthOfMinute : 0;
        }
        const end = this.dateService.createDateFromHourAndNightValue(
          new Date(`${pointage.dateJournee} ${pointage.heureDebut}`), pointage.heureDebutIsNight
        );
        const previousPointage = shift['pointages'][index - 1];
        const start = this.dateService.createDateFromHourAndNightValue(
          new Date(`${previousPointage.dateJournee} ${previousPointage.heureFin}`), previousPointage.heureFinIsNight
        );
        return (this.dateService.getDiffInMinutes(end, start) + (previousPointage.arrives > 0 ? phaseFromNearestHour : 0)) * this.widthOfMinute;
      }
    }
    return 0;
  }

  /**
   * Verify if we should display shift for this column of the talbe
   * @param: shift
   * @param: col (a column infos)
   */
  public getDisplayCondition([shift, col]): boolean {
    return (
        shift.heureDebut && (col.title.substring(0, 2) === shift.heureDebut.substring(0, 2))
        && (shift.heureDebutIsNight === col.isNight)
      ) ||
      (
        (shift.idShift === null) && (col.title.substring(0, 2) === shift.pointages[0].heureDebut.substring(0, 2))
        && (shift.pointages[0].heureDebutIsNight === col.isNight)
      ) || false;
  }

  /******************************************* UPDATE POINTAGE ***********************************************/
  public update(updatedPointage: any, origin: PointageModel, employee: EmployeeModel, employeeIndex: number, popover: OverlayPanel): void {
    this.operation = EntityAction.MODIFICATION;
    const {totalPointages, indexInTotalElement} = this.getPointageCoordination(employee, origin);
    updatedPointage.isAcheval = origin.isAcheval;
    this.updateAndSavePointage(origin, updatedPointage, totalPointages, indexInTotalElement, employee, employeeIndex, popover);
    this.getTotalPointedHours();
  }

  public async updatePointage(): Promise<void> {
    // console.log("await 12")
    this.setCorrectionPointageToPointage();
    await this.planningsJsStoreService.updatePointage(this.pointageCoordinations.pointageReference);

    this.selectedPopOver.hide();
    this.showPopupContrainteSocial = false;
  }

  public async updateFromAnomaliesPopUp() {
    await this.updatePointage();
    this.updateLocalPointages();
  }

  /**
   * Close constraints pop-up
   */
  public closePopup(): void {
    this.showPopupContrainteSocial = false;
    this.getTotalPointedHours();
  }

  /********************************************** DELETE POINTAGE ************************************************/
  public delete(origin: PointageModel, employee: EmployeeModel, indexEmployee: number): void {
    this.operation = EntityAction.DELETION;
    this.pointageCoordinations.originPointage = origin;
    this.employeeCoordiantions.selectedEmployee = employee;

    const {totalPointages, indexInTotalElement} = this.getPointageCoordination(employee, origin);
    this.deletePointage(origin, employee, indexEmployee, totalPointages, indexInTotalElement);
    this.getTotalPointedHours();
  }

  /***************************************** ADD POINTAGE *************************************************/
  public async add(employee, indexOfEmployee: number, updatedEntity, origin, popover): Promise<void> {
    this.operation = EntityAction.CREATION;
    const totalPointages = this.collectEmployeePointages(employee);
    // check inclusion with start/close day hours and get the real values of  ``heures debut/fin isNight``
    const {
      isIncluded,
      heureDebutEntityIsNight,
      heureFinEntityIsNight
    } = this.checkInclusionInStartEndDayHours(updatedEntity);
    if (isIncluded) {
      // check intersection with other pointages
      const noIntersectionWithSiblings = this.checkIntersectionWithSiblings(totalPointages, 0,
        updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight, true);
      if (noIntersectionWithSiblings) {
        origin['creationDate'] = new Date();
        origin['idFront'] = this.restaurantData.makeString();
        origin['isCompleted'] = updatedEntity['heureFinIsModified'];
        this.pointageCoordinations.pointageReference = this.createUpdatedPointage(origin, employee, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight, true);
        this.pointageCoordinations.updatedPointage = updatedEntity;
        this.pointageCoordinations.originPointage = origin;
        this.pointageCoordinations.totalPointages = totalPointages;

        this.selectedPopOver = popover;
        this.employeeCoordiantions.selectedEmployee = employee;
        this.employeeCoordiantions.employeeIndex = indexOfEmployee;
        // console.log("await 13")
        this.verificationResult = await this.planningsJsStoreService.verifySocialConstrainte(this.pointageCoordinations.pointageReference,
          employee, this.pointageCoordinations.updatedPointage.heureDebutIsModified, this.pointageCoordinations.updatedPointage.heureFinIsModified, this.currentDateJournee, false);
        if (this.verificationResult.every(constraint => constraint.isRespected)) {
          // console.log("await 14")
          await this.createPointage();
          this.adjustEmployeeColumnHeight();
        } else {
          this.showPopupContrainteSocial = true;
        }
      } else {
        origin.error = true;
      }
    } else {
      origin.error = true;
    }
    await this.setListPointageInLocalStorage();
    await this.setListCorrectionPointageInLocalStorage();
  }

  public async terminateOperation(): Promise<void> {
    this.checkSocialRegularyService.stopAudio();
    this.checkSocialRegularyService.stopPreAlarme();
    this.anomalieService.deleteAnomalieForEmploye(this.employeeCoordiantions.selectedEmployee);
    // console.log("await 14")
    this.operation === EntityAction.MODIFICATION ? await this.updateFromAnomaliesPopUp() : await this.createPointage();
    this.checkAndCreateValidatedAnomalies();
    this.closePopup();
    this.adjustEmployeeColumnHeight();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollHandler, true);

    this.destroy.next();
    this.destroy.complete();
    if (this.realTime) {
      this.realTime.clear();
    }
    if (this.rows) {
      this.rows.forEach((empColumn: ElementRef) => {
        this.renderer.removeChild(this.self.nativeElement, empColumn.nativeElement);
      });
    }
    if (this.firstColulmnsEmployees) {
      this.firstColulmnsEmployees.forEach((empColumn: ElementRef) => {
        this.renderer.removeChild(this.self.nativeElement, empColumn.nativeElement);
      });
    }

    window.removeEventListener('scroll', this.scrollToRealTimeHandler, true);
    this.desableLazyLoading();
    this.allPointedEmployees = null;
    this.listEmployees = null;
    this.shifts = null;
  }

  public trackHeader(rowIndex, index: number, item): void {
    return item.title + index + rowIndex;
  }

  public trackCol(index: number, item): void {
    return item.title + index;
  }

  public trackItem(index: number, item): void {
    return item.idFront;
  }

  public getNewShiftsIfSynchronised(): void {
    this.shiftJsStoreService.getSynchronisedListShift().pipe(takeUntil(this.destroy)).subscribe(async (synchronised: boolean) => {
      if (synchronised) {
        // console.log("await 15")
        await this.getData();
        await this.ngAfterViewInit();
      }
    });

  }

  public getAssociatedShifts(dateService: DateService, pointage: any, shift: any, shifts: any[]): any[] {
    const partitions = [];
    if (shifts && (shift.idShift !== 0)) {
      const realShifts = shifts.filter(s => s.idShift !== 0).sort((firstShift: any, secondShift: any) => dateService.isSameOrBeforeByDayTimeAndIsNight(firstShift, secondShift) ? -1 : 1);
      const intersections = [];
      realShifts.forEach((s: any) => {
        if (s.idShift && (s.idShift !== shift.idShift) && pointage) {
          const intersection = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(s, pointage);
          if ((intersection[0] != null) && (intersection[1] != null)) {
            intersections.push({shift: s, interval: intersection});
          }
        }
      });
      if (intersections.length) {
        intersections.forEach((intersection, index: number) => {
          const partition = [];
          partition.push(intersection);
          if (intersections[index + 1]) {
            partition.push(null, {
              shift: null,
              interval: [intersection.interval[1], intersections[index + 1].interval[0]]
            });
          } else {
            const endShiftDate = dateService.createDateFromHourAndNightValue(new Date(`${intersection.shift.dateJournee} ${intersection.shift.heureFin}`), intersection.shift.heureFinIsNight);
            const endPointageDate = dateService.createDateFromHourAndNightValue(new Date(`${pointage.dateJournee} ${pointage.heureFin}`), pointage.heureFinIsNight);
            if (dateService.isSameDateOn(endPointageDate, endShiftDate, 'minutes')) {
              partition.push(null, null);
            } else if (dateService.isBefore(endPointageDate, endShiftDate)) {
              if (intersection.shift.pointages && intersection.shift.pointages.length || (!pointage['isCompleted'])) {
                partition.push(null, null);
              } else {
                partition.push({shift: intersection.shift, interval: [intersection.interval[1], endShiftDate]}, null);
              }
            } else if (dateService.isBefore(endShiftDate, endPointageDate)) {
              partition.push(null, {shift: null, interval: [endShiftDate, endPointageDate]});
            }
          }
          partitions.push(partition);
        });
      }
    }
    return partitions;
  }

  public getPointage(pointage, shift, index: number, employee, widthOfMinute: number, dateService: DateService) {
    if (shift && (shift.idShift !== 0) && (index === 0) && pointage && (pointage.arrives > 0)) {
      const startInnerFirstPointage = dateService.createDateFromHourAndNightValue(new Date(`${pointage.dateJournee} ${pointage.heureDebut}`), pointage.heureDebutIsNight);
      const startShift = dateService.createDateFromHourAndNightValue(new Date(`${shift.dateJournee} ${shift.heureDebut}`), shift.heureDebutIsNight);
      const innerDifference = dateService.getDiffInMinutes(startInnerFirstPointage, startShift);
      const intersections: any[] = [];
      employee.shifts.map(s => s.pointages).forEach((pointages: any[]) => {
        if (pointages && pointages.length) {
          pointages.forEach(p => {
            const intersection = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(p, shift);
            if ((intersection[0] != null) && (intersection[1] != null)) {
              intersections.push(p);
            }
          });
        }
      });
      if (intersections.length) {
        intersections.sort((firstPointage: any, secondPointage: any) => dateService.isSameOrBeforeByDayTimeAndIsNight(firstPointage, secondPointage) ? -1 : 1);
        if (pointage.idFront !== intersections[0].idFront) {
          const intersection = dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(intersections[0], shift);
          const outerDifference = dateService.getDiffInMinutes(intersection[1], intersection[0]);
          pointage.arrives = innerDifference - outerDifference;
        } else {
          pointage.arrives = innerDifference;
        }
      }
    }
    return pointage;
  }

  public synchro() {
    this.synchronisationService.synchroniseRegulary(true, this.sessionService.getDateJournee(), 1);
  }

  private checkParametersChanges(): void {
    this.synchronisationService.currentState.pipe(takeUntil(this.destroy)).subscribe(async _ => {
      this.header = [];
      // console.log("await 16")
      await this.ngOnInit();
      await this.ngAfterViewInit();
    });

  }

  private updateAllEmployeeDataInRealTime(): void {
    this.listEmployees.forEach((employee: EmployeeModel) => {
      employee['shifts'].forEach((shift: ShiftModel) => {
        shift['pointages'].forEach((pointage: PointageModel) => {
          if (!pointage['isCompleted']) {
            const date = new Date();
            pointage.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(date, ':');
            pointage.heureFinIsNight = !this.dateService.isSameDateOn(this.currentDateJournee, date, 'days');
            pointage.tempsPointes = this.dateService.getTotalMinutes(<DateInterval>pointage);
          }
        });
        this.calculateDelayedArrivalEarlyDeparture(shift);
      });
    });
    this.listEmployees.forEach((employee, index) => {
      const isThereIncompletePointage = employee['shifts'].some((shift: ShiftModel) => shift['pointages'].some((pointage: PointageModel) => !pointage['isCompleted']));
      if (isThereIncompletePointage) {
        this.listEmployees[index] = JSON.parse(JSON.stringify(employee))
      }
    });
  }

  private quitPointage(): void {
    this.sessionService.isConnected = false;
    this.sessionService.setEmploye(0);
    this.sessionService.setIsManager(false);
    this.sessionService.setBadge('0');
    this.sessionService.setEmployeFullName('');
    this.router.navigateByUrl(this.pointeuseRouter.getRoute('LIVE'));
  }

  private async getTypePointageRef(): Promise<void> {
    // console.log("await 17")
    this.typePointages = await this.typePointageJsStoreService.getAll();
    const listTerrain = this.typePointages.filter(el => el.libelle.toLowerCase().includes('terrain'));
    this.choosenTypePointage = listTerrain[0] ? listTerrain[0] : this.typePointages[0];
  }

  private async loadMore(): Promise<void> {
    this.paginationArgs.pageNumber += 1;
    if (this.allPointedEmployees.length) {
      this.listEmployees = this.listEmployees.concat(this.allPointedEmployees.splice(0, this.paginationArgs.pageSize));
    }
  }

  // ------------------------------------ END GET PAGINATED DATA ------------------------------


  public filter(filter: 'all' | 'pointed'): void {
    this.filterState = filter;
    this.getData();
  }

  public fermeture() {
   // this.restaurantData.updatePointing(new Date(this.sessionService.getDateJournee()), true, this.sessionService.getDateJournee());
  }

  private sortDateIntervals(dateIntervals: DateInterval[]): void {
    dateIntervals.sort((s1, s2) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(s1, s2) ? -1 : 1);
  }

  /***
   * Structure Data from list shift and list pointage to be displayed
   * Each employee has a list of shifts, and each shift has a list of pointings
   */
  private structureDataToDisplay(pointages: PointageModel[], employees: EmployeeModel[]): EmployeeModel[] {
    pointages.forEach((pointage: PointageModel) => this.calculateNotCompletedPointages(pointage));
    employees.forEach((employe: EmployeeModel) => {
      employe['shifts'] = this.shifts.filter((shift: ShiftModel) => shift.employee && (shift.employee.idEmployee === employe.idEmployee));
      this.sortDateIntervals(employe['shifts']);
      const pointagesEmploye = pointages.filter((pointage: PointageModel) => pointage.idEmployee === employe.idEmployee);
      const idsOfAssociatedPointage: string [] = [];
      employe['shifts'].forEach((shift: ShiftModel) => {
        this.setUpEmployeeShift(shift, pointagesEmploye, idsOfAssociatedPointage);
      });
      // pointages not associated with shifts
      this.setUpNotAssociatedPointages(pointagesEmploye, idsOfAssociatedPointage, employe);
      // pointages associated with shifts
      employe['shifts'].forEach((shift: ShiftModel) => shift.idShift != null ? this.calculateDelayedArrivalEarlyDeparture(shift) : false);
    });
    return employees;
  }

  private setUpEmployeeShift(shift: ShiftModel, pointagesEmploye: PointageModel[], idsOfAssociatedPointage: string[]): void {
    shift['pointages'] = pointagesEmploye.filter((pointage: PointageModel) => {
      let isIntersect = false;
      const dateDebutPointage = this.dateService.createDateFromTime(pointage.dateJournee, pointage.heureDebut, pointage.heureDebutIsNight ? 1 : 0);
      const datefinPointage = this.dateService.createDateFromTime(pointage.dateJournee, pointage.heureFin, pointage.heureFinIsNight ? 1 : 0);
      if (!pointage['isCompleted'] && this.dateService.isTheSameDates(dateDebutPointage, datefinPointage)) {
        const dateDebutShift = this.dateService.createDateFromTime(shift.dateJournee, shift.heureDebut, shift.heureDebutIsNight ? 1 : 0);
        const datefinShift = this.dateService.createDateFromTime(shift.dateJournee, shift.heureFin, shift.heureFinIsNight ? 1 : 0);
        if (this.dateService.isSameOrAfter(dateDebutPointage, dateDebutShift) && this.dateService.isBefore(datefinPointage, datefinShift)) {
          isIntersect = !idsOfAssociatedPointage.some((id: string) => id === pointage.idFront);
        }
      } else {
        const intersection = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(shift, <DateInterval>pointage);
        isIntersect = (intersection[0] !== null) && (intersection[1] !== null) && !this.dateService.isTheSameDates(...intersection)
          && (!idsOfAssociatedPointage.some((id: string) => id === pointage.idFront));
      }
      if (isIntersect) {
        idsOfAssociatedPointage.push(pointage.idFront);
      }
      return isIntersect;
    });
  }

  private setUpNotAssociatedPointages(pointagesEmploye: PointageModel[], idsOfAssociatedPointage: string[], employe: EmployeeModel): void {
    const notAssociatedPointings: PointageModel[] = pointagesEmploye.filter((pointage: PointageModel) => !idsOfAssociatedPointage.includes(pointage.idFront));
    notAssociatedPointings.forEach((pointage: PointageModel) => {
      pointage['sortie'] = pointage['arrives'] = 0;
      const emptyShift = {
        idShift: null,
        dateJournee: pointage.dateJournee,
        heureDebut: pointage.heureDebut,
        heureDebutIsNight: pointage.heureDebutIsNight,
        heureFin: pointage.heureFin,
        heureFinIsNight: pointage.heureFinIsNight,
        totalHeure: pointage.tempsPointes,
        pointages: [pointage]
      };
      employe['shifts'].push(emptyShift);
    });
  }

  private calculateNotCompletedPointages(pointage: PointageModel): void {
    if (pointage.heureFin == null) {
      const date = new Date();
      pointage.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(date, ':');
      pointage.heureFinIsNight = !this.dateService.isSameDateOn(this.currentDateJournee, date, 'days');
      pointage.tempsPointes = this.dateService.getTotalMinutes(<DateInterval>pointage);
      pointage['isCompleted'] = false;
    } else {
      pointage['isCompleted'] = true;
    }
  }

  private setUpLazyLoading(): void {
    this.desableLazyLoading();
    const timeout = setTimeout(_ => {
      this.scrollableTable = document.getElementsByClassName('ui-table-scrollable-body')[1];
      if (this.scrollableTable) {
        this.scrollableTable.scrollTop = 0;
        // this.scrollTableHandler = () => this.updateTableData();
        // this.scrollableTable.addEventListener('scroll', this.scrollTableHandler, true);
        // TODO debounce scrollableTable scroll callback execution
        this.ngZone.runOutsideAngular(() => {
          this.scrollableTable.addEventListener('scroll', () => {
            this.onScrollableTableScroll$.next()
          }, true);
        })
      }
      clearTimeout(timeout);
    }, 500);
  }

  private async updateTableData(event = null): Promise<void> {
    // console.log("update table data");
    if ((10 + this.scrollableTable.clientHeight + this.scrollableTable.scrollTop >= this.scrollableTable.scrollHeight) && this.isScrollActive) {
      this.isScrollActive = false;
      this.loadMore();
      // console.log("await 18")
      await this.dateService.delay(100);
      this.isScrollActive = true;
    }
  }

  private initializeEmployeeColumnHeight(waitingTime: number): void {
    const time = setTimeout(_ => {
      const rowsList = this.rows.toArray();
      this.firstColulmnsEmployees.forEach((empColumn: ElementRef, empIndex: number) => {
        empColumn.nativeElement.style.height = `${rowsList[empIndex].nativeElement.offsetHeight}px`;
      });
      clearTimeout(time);
    }, waitingTime);
  }

  /***
   * Chaque colone represente 30 minutes = 60px
   * 1440 égale à 24 heures, si on dépasse 23h on revient vers 00h, 01h, 02h ....
   * on ajoute null à chaque fois pour ne pas afficher les demi heures
   */
  private createColumn(startTime: number, toTime: number, minutePartInEndHour: number): void {
    this.header = [];
    let isNight = false;
    this.header.push({title: '', field: '', isNight: ''});
    for (let t = startTime * 60; t <= 60 * (toTime + 1); t = t + 60) {
      let aux = t;
      if (aux >= 1440) {
        aux = aux - 1440;
        isNight = true;
      }
      this.header.push({title: this.transformHeaderHourTohhmm(aux), field: aux, isNight: isNight});
      this.header.push({title: this.transformHeaderHourTohhmm(null), field: null, isNight: isNight});
    }
    this.header.splice(this.header.length - 1, 1);
    /**
     * Verify the number of columns at the end based on minutes part of closing hour
     */
    if (minutePartInEndHour === 0) {
      this.header.splice(this.header.length - 2);
    } else if (minutePartInEndHour <= 30) {
      this.header.splice(this.header.length - 1);
    }
    // 30 longueur de 30 minute en pixel
    this.maxWidthPlanning = this.header.length * 30 + 92;
  }

  private transformHeaderHourTohhmm(planifiesMinutes: number): string {
    if (planifiesMinutes === null) {
      return '';
    } else {
      let planifieHours: number;
      if (planifiesMinutes < 0) {
        planifieHours = 0;
        planifiesMinutes = 0;
      } else {
        planifieHours = Math.floor(planifiesMinutes / 60);
      }
      planifieHours = Number((planifieHours).toFixed(0));
      return planifieHours.toString().padStart(2, '0') + ':' +
        ((planifiesMinutes - planifieHours * 60).toFixed(0)).toString().padStart(2, '0');
    }

  }

  /**
   * Get start/end hour and create table with the disposal measures
   */
  private async createDayHourlyTable(): Promise<void> {
    // console.log("await 19")
    await this.getOpenAndCloseHours();
    const startTimeNb = this.converteStringToHour(this.startTime, this.startTimeIsNight);
    const toTimeNb = this.converteStringToHour(this.endTime, this.endTimeIsNight);
    this.createColumn(startTimeNb, toTimeNb, +this.endTime.substring(3, 5));
  }

  /**
   * Get open and close hours for the selected date
   */
  private async getOpenAndCloseHours(): Promise<void> {
    // console.log("await 20")
    // fetch open/close hours for all week days
    const debutFinJouneePhases = await this.decoupageHoraireJsStoreService.getListDecoupage();
    const debutJourneesPhases = debutFinJouneePhases.find(value => value.phaseLibelle == 'DJA');
    const finJourneesPhases = debutFinJouneePhases.find(value => value.phaseLibelle == 'FJA');
    // Get the day of the selected date
    const day: JourSemaine = this.dateService.getJourSemaine(this.currentDateJournee);
    const key = day[0] + day.substring(1).toLowerCase();
    // Extract open/close hour based on the created key
    this.startTime = debutJourneesPhases['valeur' + key];
    this.startTimeIsNight = debutJourneesPhases['valeur' + key + 'IsNight'];
    this.endTime = finJourneesPhases['valeur' + key];
    this.endHour = this.getEndHourIfShouldBeDisplayed()
    this.endTimeIsNight = finJourneesPhases['valeur' + key + 'IsNight'];
  }

  private converteStringToHour(time: string, night: boolean): number {
    const arrAux = time.split(':'); // split it at the colons
    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    let hour = 0;
    if (arrAux.length > 0) {
      if (night === true) {
        hour = (+arrAux[0]) + 24;
      } else {
        hour = (+arrAux[0]);
      }
    }
    return hour;
  }

  private checkIntersectionWithSiblings(totalPointages: DateInterval[], indexInTotalElement: number, updatedEntity,
                                        heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean, isNew: boolean = false): boolean {
    const notCompletedPointage = totalPointages.find((pointage: DateInterval) => !pointage['isCompleted']);
    if (notCompletedPointage && (!updatedEntity['heureFinIsModified']) && isNew) {
      return false;
    }

    const isIntersectWithOtherElements = totalPointages.some((pa: DateInterval, index: number) => {
      if (pa.isAcheval && pa.dateJournee === this.dateService.getYesterDay(this.sessionService.getDateJournee())) {
        pa.dateJournee = this.sessionService.getDateJournee();
      }
      const intersectionInterval = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(
        {
          dateJournee: updatedEntity.dateJournee,
          heureDebut: updatedEntity.heureDebut,
          heureFin: updatedEntity.heureFin,
          heureDebutIsNight: heureDebutEntityIsNight,
          heureFinIsNight: heureFinEntityIsNight
        },
        pa
      );
      const intersectionResult = (intersectionInterval[0] !== null) && (intersectionInterval[1] !== null) && !this.dateService.isTheSameDates(...intersectionInterval);
      return isNew ? intersectionResult : intersectionResult && (index !== indexInTotalElement);
    });
    return !isIntersectWithOtherElements;
  }

  private calculateDelayedArrivalEarlyDeparture(shift: ShiftModel): void {
    this.sortDateIntervals(shift['pointages']);
    shift['pointages'].forEach((pointage, index: number) => {
      pointage['sortie'] = pointage['arrives'] = 0;
      if (shift.idShift !== null) {
        if (index === 0) {
          pointage['arrives'] = this.dateService.getDiffInMinutesForStartHours(pointage, shift);
        }
        if ((index === shift['pointages'].length - 1)) {
          pointage['sortie'] = this.dateService.getDiffInMinuteForEndHours(pointage, shift);
          if (!pointage['isCompleted'] && (pointage['sortie'] < 0)) {
            pointage['sortie'] = 0;
          }
        }
      }
    });
  }

  private async updateAndSavePointage(origin, updatedEntity, totalPointages: any[],
                                      indexInTotalElement: number, employee, indexOfEmployee: number, popover): Promise<void> {
    // check inclusion with start/close day hours and get the real values of  ``heures debut/fin isNight``
    const {
      isIncluded,
      heureDebutEntityIsNight,
      heureFinEntityIsNight
    } = this.checkInclusionInStartEndDayHours(updatedEntity);
    if (isIncluded) {
      // check intersection with other pointages
      const noIntersectionWithSiblings = this.checkIntersectionWithSiblings(totalPointages, indexInTotalElement, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      if (noIntersectionWithSiblings) {
        origin['isCompleted'] = updatedEntity['isCompleted'];
        this.pointageCoordinations.pointageReference = this.createUpdatedPointage(origin, employee, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
        updatedEntity.heureDebutIsNight = heureDebutEntityIsNight;
        updatedEntity.heureFinIsNight = heureFinEntityIsNight;
        const shift: ShiftModel = this.getNewAssociatedShift(employee, updatedEntity);
        updatedEntity.idShift = shift ? shift.idShift : null;

        this.pointageCoordinations.updatedPointage = updatedEntity;
        this.pointageCoordinations.originPointage = origin;
        this.pointageCoordinations.totalPointages = totalPointages;
        this.pointageCoordinations.pointageIndex = indexInTotalElement;

        this.selectedPopOver = popover;
        this.employeeCoordiantions.selectedEmployee = employee;
        this.employeeCoordiantions.employeeIndex = indexOfEmployee;
        if (((!this.pointageCoordinations.updatedPointage.heureDebutIsModified) &&
          ((!this.pointageCoordinations.updatedPointage.heureFinIsModified)))) {
          // console.log("await 21")
          await this.postConstraintVerificationOperations();
        } else {
          // console.log("await 22")
          await this.checkSocialConstraints(employee);
        }
      } else {
        origin.error = true;
      }
    } else {
      origin.error = true;
    }
  }

  private async checkSocialConstraints(employee): Promise<void> {
    this.pointageCoordinations.pointageReference.isAcheval = this.pointageCoordinations.updatedPointage.isAcheval;
    const heureFinModified = !this.pointageCoordinations.originPointage['isCompleted'] ? false : this.pointageCoordinations.updatedPointage.heureFinIsModified;
    // console.log("await 23")
    this.verificationResult = await this.planningsJsStoreService.verifySocialConstrainte(this.pointageCoordinations.pointageReference,
      employee, this.pointageCoordinations.updatedPointage.heureDebutIsModified, heureFinModified, this.currentDateJournee, true);
    if (this.verificationResult.every(constraint => constraint.isRespected)) {
      this.checkSocialRegularyService.stopAudio();
      this.checkSocialRegularyService.stopPreAlarme();
      this.anomalieService.deleteAnomalieForEmploye(this.employeeCoordiantions.selectedEmployee);
      // console.log("await 24")
      await this.postConstraintVerificationOperations();
    } else {
      this.showPopupContrainteSocial = true;
    }
  }

  private async postConstraintVerificationOperations() {
    this.getTotalPointedHours();
    // console.log("await 25")
    await this.updatePointage();
    this.updateLocalPointages();
    this.adjustEmployeeColumnHeight();
  }

  private createUpdatedPointage(origin: PointageModel, employee: EmployeeModel, updatedEntity: any, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean, isNew: boolean = false): PointageModel {
    const pointage = {} as PointageModel;
    pointage.idRestaurant = +this.idRestaurant;
    pointage.idFront = origin.idFront;
    pointage.creationDate = origin.creationDate;
    pointage.modified = isNew ? 0 : 1;
    pointage.idEmployee = employee.idEmployee;
    pointage.heureDebut = updatedEntity.heureDebut;
    pointage.heureDebutIsNight = heureDebutEntityIsNight;
    pointage.heureFin = updatedEntity.heureFin;
    pointage.heureFinIsNight = heureFinEntityIsNight;
    pointage.dateJournee = updatedEntity.dateJournee;
    pointage.typePointageRef = updatedEntity.typePointageRef;
    //pointage.tempsPointes = this.socialConstraint.getDiffTimeFromDateForPointingEndHourAndOnForManager(this.dateService.createDatePlusHHmmTime(updatedEntity.isAcheval ? new Date(this.dateService.getYesterDay(updatedEntity.dateJournee)) : new Date(new Date(updatedEntity.dateJournee).setHours(0)), updatedEntity.heureDebut + ''), updatedEntity, 'minutes');
    pointage.tempsPointes = this.socialConstraint.getDiffTimeFromDateForPointingEndHourAndOnForManager(this.dateService.createDatePlusHHmmTime(updatedEntity.isAcheval ? this.dateService.getCorrectDateJournee(this.dateService.getYesterDay(updatedEntity.dateJournee)) :
      this.dateService.getCorrectDateJournee(this.dateService.getCorrectDateJournee(updatedEntity.dateJournee).setHours(0), true), updatedEntity.heureDebut + ''), updatedEntity, 'minutes');

    const shift: ShiftModel = this.getNewAssociatedShift(employee, pointage);
    pointage.idShift = shift ? shift.idShift : null;
    if (!origin['isCompleted']) {
      pointage.heureFin = null;
      pointage.tempsPointes = 0;
    }
    return pointage;
  }

  private getNewAssociatedShift(employee: EmployeeModel, pointage: any): ShiftModel {
    return employee['shifts'].filter(shift => shift.idShift !== null).sort((s1, s2) => this.dateService.isSameOrBeforeByDayTimeAndIsNight(s1, s2) ? -1 : 1).find(shift => {
      const intersection = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(shift, pointage);
      return (intersection[0] !== null) && (intersection[1] !== null);
    });
  }

  private getDurationInMinutes(origin, updatedEntity, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): number {
    return this.dateService.getTotalMinutes({
      dateJournee: origin.dateJournee,
      heureDebut: updatedEntity.heureDebut,
      heureDebutIsNight: heureDebutEntityIsNight,
      heureFin: updatedEntity.heureFin,
      heureFinIsNight: heureFinEntityIsNight
    });
  }

  private checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): boolean {
    return this.dateService.isIncluded(
      {
        dateJournee: updatedEntity.dateJournee,
        heureDebut: updatedEntity.heureDebut,
        heureFin: updatedEntity.heureFin,
        heureDebutIsNight: heureDebutEntityIsNight,
        heureFinIsNight: heureFinEntityIsNight
      },
      {
        dateJournee: updatedEntity.dateJournee,
        heureDebut: this.startTime,
        heureDebutIsNight: this.startTimeIsNight,
        heureFin: this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':'),
        heureFinIsNight: !this.dateService.isSameDateOn(this.currentDateJournee, new Date(), 'days')
      }
    );
  }

  private checkInclusionInStartEndDayHours(updatedEntity): { isIncluded: boolean, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean } {
    let isIncluded = false;
    let heureDebutEntityIsNight = false;
    let heureFinEntityIsNight = false;
    if (updatedEntity.isAcheval) {
      isIncluded = this.dateService.isBefore(this.dateService.createDateFromTime(new Date(), updatedEntity.heureFin), new Date());
      heureDebutEntityIsNight = false;
      heureFinEntityIsNight = false;
    } else {
      if (updatedEntity.hoursInSameDay) {
        isIncluded = this.checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
        if (!isIncluded) {
          heureDebutEntityIsNight = heureFinEntityIsNight = true;
          isIncluded = this.checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
        }
      } else {
        heureDebutEntityIsNight = false;
        heureFinEntityIsNight = true;
        isIncluded = this.checkTimeIntervalIsIncludedInOpenCloseDay(updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight);
      }
    }
    return {isIncluded, heureDebutEntityIsNight, heureFinEntityIsNight};
  }

  private getPointageCoordination(employee: EmployeeModel, origin: PointageModel): { totalPointages: Array<any>, indexInTotalElement: number } {
    const totalPointages = this.collectEmployeePointages(employee);
    const indexInTotalElement = totalPointages.findIndex((element: any) => element.idFront === origin.idFront);
    return {totalPointages: totalPointages, indexInTotalElement};
  }

  /**
   * Put all empmloyee ``pointages`` in a same list
   * @param: employee
   */
  private collectEmployeePointages(employee: EmployeeModel): any[] {
    const totalPointages = [];
    employee['shifts'].map((shift: ShiftModel) => shift['pointages']).forEach((pointages: any[]) => totalPointages.push(...pointages));
    return totalPointages;
  }

  /**
   * ajouter list correction  a pointage
   * @param pointage
   */
  private async setCorrectionPointageToPointage(): Promise<void> {
    const originPointage = this.pointageCoordinations.originPointage;
    if (this.operation === EntityAction.DELETION) {
      this.createCorrectionPointage(originPointage, originPointage, originPointage['isCompleted'] ? PointageTime.ENTER_EXIT : PointageTime.ENTER, EntityAction.DELETION)
    } else {
      const pointage = this.pointageCoordinations.pointageReference;
      const {
        heureDebutIsModified,
        heureFinIsModified,
        typePointageRefIsModified
      } = this.pointageCoordinations.updatedPointage;
      if (this.operation === EntityAction.MODIFICATION) {
        if (heureDebutIsModified) {
          // console.log("await 26")
          await this.createCorrectionPointage(pointage, originPointage, PointageTime.ENTER, EntityAction.MODIFICATION);
        }
        if (heureFinIsModified) {
          // console.log("await 27")
          await this.createCorrectionPointage(pointage, originPointage, PointageTime.EXIT, EntityAction.MODIFICATION);
        }
        if (typePointageRefIsModified) {
          // console.log("await 28")
          await this.createCorrectionPointage(pointage, originPointage, PointageTime.ENTER_EXIT, EntityAction.MODIFICATION);
        }
      } else {
        // console.log("await 29")
        await this.createCorrectionPointage(pointage, pointage, PointageTime.ENTER, EntityAction.CREATION);
        await this.createCorrectionPointage(pointage, pointage, PointageTime.ENTER_EXIT, EntityAction.CREATION);
        if (originPointage['isCompleted']) {
          // console.log("await 30")
          await this.createCorrectionPointage(pointage, pointage, PointageTime.EXIT, EntityAction.CREATION);
        }
      }
    }
  }

  /**
   * ajouter de correction de pointage a chaque modifiaction de pointage
   * @param pointage
   * @param pointageDisplay
   * @param isEntryPoiting
   */
  private async createCorrectionPointage(newPointage: PointageModel, oldPointage: PointageModel, pointageTime: PointageTime, entityAction: EntityAction): Promise<void> {
    const employee = this.employeeCoordiantions.selectedEmployee;
    let correctionPointage = {} as CorrectionPointageModel;
    correctionPointage.pointageTime = PointageTime[pointageTime];
    correctionPointage.entityAction = EntityAction[entityAction];
    correctionPointage.dateModification = new Date();
    correctionPointage.nomEmployee = employee.nom;
    correctionPointage.prenomEmployee = employee.prenom;
    correctionPointage.idEmployee = employee.idEmployee;
    correctionPointage.nomManager = this.manager.nom;
    correctionPointage.prenomManager = this.manager.prenom;
    correctionPointage.idManager = this.manager.idEmployee;
    correctionPointage.idRestaurant = +this.sessionService.getIdRestaurant();
    correctionPointage.idFront = this.restaurantData.makeString();
    if (employee.badge) {
      correctionPointage.employeeCodeBadge = employee.badge.code;
    }
    if (pointageTime == PointageTime.ENTER) {
      // set old hours
      correctionPointage.oldValue = oldPointage.heureDebut;
      correctionPointage.oldValueIsNight = oldPointage.heureDebutIsNight;

      // set updated hours
      correctionPointage.newValue = newPointage.heureDebut;
      correctionPointage.newValueIsNight = newPointage.heureDebutIsNight;
    } else if (pointageTime == PointageTime.EXIT) {
      // set old hours
      correctionPointage.oldValue = oldPointage.heureFin;
      correctionPointage.oldValueIsNight = oldPointage.heureFinIsNight;

      // set updated hours
      correctionPointage.newValue = newPointage.heureFin;
      correctionPointage.newValueIsNight = newPointage.heureFinIsNight;
    } else if (pointageTime == PointageTime.ENTER_EXIT) {
      if (entityAction == EntityAction.DELETION) {
        // set old hours
        correctionPointage.oldValue = oldPointage.heureDebut;
        correctionPointage.oldValueIsNight = oldPointage.heureDebutIsNight;
      } else {
        correctionPointage.oldTypePointage = oldPointage.typePointageRef;
        correctionPointage.newTypePointage = newPointage.typePointageRef;
      }
    }
    correctionPointage.pointageIdFront = oldPointage.idFront;
    correctionPointage.dayOfActivity = this.dateJournee;
    // console.log("await 31")
    await this.correctionPointageJsStoreService.addCorrection(correctionPointage);
  }

  private updateLocalPointages(): void {
    const employee = this.employeeCoordiantions.selectedEmployee;
    const heureDebutEntityIsNight = this.pointageCoordinations.pointageReference.heureDebutIsNight;
    const heureFinEntityIsNight = this.pointageCoordinations.pointageReference.heureFinIsNight;
    const entity = this.pointageCoordinations.updatedPointage;
    const indexInTotalElement = this.pointageCoordinations.pointageIndex;
    const totalPointages = this.pointageCoordinations.totalPointages;
    const originPointage = this.pointageCoordinations.originPointage;
    const employeeIndex = this.employeeCoordiantions.employeeIndex;
    const {
      searchedIndex,
      shiftIndex
    } = this.getTargetPointageAndAssociatedShiftIndexes(employee, totalPointages, indexInTotalElement);
    const searchedPointage = employee.shifts[shiftIndex].pointages[searchedIndex];

    const shift: ShiftModel = this.getNewAssociatedShift(employee, entity);
    entity.idShift = shift ? shift.idShift : null;
    const newPointage = this.createPointageFromExistedPointageAndNightsValue(searchedPointage.idFront, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
    newPointage['isCompleted'] = originPointage['isCompleted'];
    employee.shifts[shiftIndex].pointages.splice(searchedIndex, 1);
    if (!employee.shifts[shiftIndex].idShift) {
      // Delete the encapsulate shift, it's a isolated ``pointage`` (not associated with a shit)
      // this shift is just an encapsulation object
      employee.shifts.splice(shiftIndex, 1);
    } else {
      // Recalculate delay arrival and early departure for the existing shift
      // after retrieving the updated ``pointage``
      this.calculateDelayedArrivalEarlyDeparture(employee.shifts[shiftIndex]);
    }
    this.displayPointageAndCalculateTotalPointing(employee, newPointage);
    this.notificationService.showSuccessMessage('PLANNING_PAGE_PRINCIPALE.UPDATE_POINTAGE_SUCCESS');
    setTimeout(() => {
      this.listEmployees[employeeIndex] = JSON.parse(JSON.stringify(this.listEmployees[employeeIndex]));
    }, 100);

  }

  private createPointageFromExistedPointageAndNightsValue(idFront: string, entity: any, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean, isNew: boolean = false) {
    const newPointage: PointageModel = {} as PointageModel;
    newPointage.idFront = idFront;
    newPointage.typePointageRef = entity.typePointageRef;
    newPointage.idShift = entity.idShift;
    newPointage.isAcheval = entity.isAcheval;
    this.createGuiGdhFromExistedOneWithNightsValue(newPointage, entity, heureDebutEntityIsNight, heureFinEntityIsNight);
    if (entity.isAcheval) {
      newPointage.heureDebutAcheval = entity.heureDebut;
      newPointage.heureDebut = this.dateService.getHHmmformatFromDateAndWithSeparator(this.sessionService.getDebutJournee(), ':');
      newPointage.heureDebutAchevalIsNight = newPointage.heureDebutIsNight;
      newPointage.heureDebutIsNight = false;
    }
    newPointage.modified = isNew ? 0 : 1;
    return newPointage;
  }

  private createGuiGdhFromExistedOneWithNightsValue(newPointage: any, entity: any, heureDebutEntityIsNight: boolean, heureFinEntityIsNight: boolean): PointageModel {
    newPointage.dateJournee = entity.dateJournee;
    newPointage.heureDebut = entity.heureDebut;
    newPointage.heureDebutIsNight = heureDebutEntityIsNight;
    newPointage.heureFin = entity.heureFin;
    newPointage.heureFinIsNight = heureFinEntityIsNight;
    newPointage.tempsPointes = this.dateService.getTotalMinutes(newPointage);
    return newPointage;
  }

  private displayPointageAndCalculateTotalPointing(employee: EmployeeModel, pointage: PointageModel): void {
    const newAssociatedShift = this.getNewAssociatedShift(employee, pointage);
    if (newAssociatedShift) {
      newAssociatedShift['pointages'].push(pointage);
      this.calculateDelayedArrivalEarlyDeparture(newAssociatedShift);
    } else {
      this.createNewIsolatedPointage(pointage, employee);
    }
  }

  private createNewIsolatedPointage(pointage: PointageModel, employee: EmployeeModel): void {
    pointage['arrives'] = pointage['sortie'] = 0;
    const newShift = {} as ShiftModel;
    newShift.idShift = null;
    newShift['pointages'] = [pointage];
    employee['shifts'].push(newShift);
  }

  private getTargetPointageAndAssociatedShiftIndexes(employee, totalPointages: any[], indexInTotalElement: number): { searchedIndex: number, shiftIndex: number } {
    let searchedIndex = 0;
    const shiftIndex = employee.shifts.findIndex((shift) => {
      const searchedpointage = shift.pointages.find((pointage, i: number) => {
        if (pointage.idFront === totalPointages[indexInTotalElement].idFront) {
          searchedIndex = i;
          return true;
        } else {
          return false;
        }
      });
      return searchedpointage !== undefined;
    });
    return {searchedIndex, shiftIndex};
  }

  private async deletePointage(origin: PointageModel, employee: EmployeeModel, indexOfEmployee: number, totalPointages: any[], indexInTotalElement: number): Promise<void> {
    this.setCorrectionPointageToPointage();
    // console.log("await 32")
    await this.planningsJsStoreService.deletePointage(origin.idFront);
    const {
      searchedIndex,
      shiftIndex
    } = this.getTargetPointageAndAssociatedShiftIndexes(employee, totalPointages, indexInTotalElement);
    if (searchedIndex !== -1 && shiftIndex !== -1) {
      employee['shifts'][shiftIndex].pointages.splice(searchedIndex, 1);
      if (employee['shifts'][shiftIndex].idShift === null) {
        employee['shifts'].splice(shiftIndex, 1);
      } else {
        this.calculateDelayedArrivalEarlyDeparture(employee['shifts'][shiftIndex]);
      }
    }
    this.notificationService.showSuccessMessage('PLANNING_PAGE_PRINCIPALE.DELETE_POINTAGE_SUCCESS');
    let value = this.sessionService.getNbrTotempPointe();
    value = isNaN(value) ? 0 : Number(value) - 1;
    this.sessionService.setNbrTotempPointe(value);
    this.listEmployees[indexOfEmployee] = JSON.parse(JSON.stringify(employee));
    if (this.isManager && (this.filterState == 'pointed') && ((this.listEmployees[indexOfEmployee]['shifts'] &&
      (this.listEmployees[indexOfEmployee]['shifts'].length === 0)) || (!this.listEmployees[indexOfEmployee]['shifts']))) {
    //  this.listEmployees.splice(indexInTotalElement, 1);
    //  this.showEmptyMessage = (!this.listEmployees) || (this.listEmployees.length === 0);
    }
  //  this.adjustEmployeeColumnHeight();
    await this.setListPointageInLocalStorage();
    await this.setListCorrectionPointageInLocalStorage();
  }

  private async createPointage(): Promise<void> {
    let value = this.sessionService.getNbrTotempPointe();
    value = isNaN(value) ? 1 : Number(value) + 1;
    this.sessionService.setNbrTotempPointe(value);
    const pointage = this.pointageCoordinations.pointageReference;
    const employee = this.employeeCoordiantions.selectedEmployee;
    const indexOfEmployee = this.employeeCoordiantions.employeeIndex;
    const updatedEntity = this.pointageCoordinations.updatedPointage;
    const heureDebutEntityIsNight = this.pointageCoordinations.pointageReference.heureDebutIsNight;
    const heureFinEntityIsNight = this.pointageCoordinations.pointageReference.heureFinIsNight;
    const popover = this.selectedPopOver;
    this.setCorrectionPointageToPointage();

    if (pointage.idRestaurant !== null || pointage.idRestaurant !== undefined) {
      await this.planningsJsStoreService.addPointage(pointage);
      if (updatedEntity.idShift === undefined) {
        updatedEntity.heureDebutIsNight = heureDebutEntityIsNight;
        updatedEntity.heureFinIsNight = heureFinEntityIsNight;
        const shift: ShiftModel = this.getNewAssociatedShift(employee, updatedEntity);
        updatedEntity.idShift = shift ? shift.idShift : null;
      }
      const newPointage = this.createPointageFromExistedPointageAndNightsValue(pointage.idFront, updatedEntity, heureDebutEntityIsNight, heureFinEntityIsNight, true);
      newPointage['isCompleted'] = this.pointageCoordinations.originPointage['isCompleted'];
      this.displayPointageAndCalculateTotalPointing(employee, newPointage);
      this.notificationService.showSuccessMessage('PLANNING_PAGE_PRINCIPALE.CREATE_POINTAGE_SUCCESS');
      // update employee reference so template can be rendered again and modifications show up
      this.listEmployees[indexOfEmployee] = JSON.parse(JSON.stringify(employee));
      popover.hide();
      this.getTotalPointedHours();
      this.pointageToBeCreated = {error: false, dateJournee: this.dateJournee};
    } else {
      popover.hide();
      this.notificationService.showErrorMessage('POINTAGE.POINTAGE_ERREUR');
    }
  }

  private adjustEmployeeColumnHeight(): void {
    const timer = setTimeout(_ => {
      this.firstColulmnsEmployees.last.nativeElement.style.height = `${this.rows.last.nativeElement.offsetHeight}px`;
      clearTimeout(timer);
    }, 0);
  }

  private async checkAndCreateValidatedAnomalies(): Promise<void> {
    const pointageToUpdate = this.pointageCoordinations.pointageReference;
    const coordiantions = {
      employee: this.employeeCoordiantions.selectedEmployee,
      pointages: [],
      pointageToUpdate: this.pointageCoordinations.pointageReference
    };
    // console.log("await 34")
    coordiantions.pointages = await this.planningsJsStoreService.getByIdEmploye(NameOfTable.POINTAGE, coordiantions.employee.idEmployee);
    const indexPointageToUpdate = coordiantions.pointages.findIndex((pointage: PointageModel) => pointage.idFront === pointageToUpdate.idFront);
    if (indexPointageToUpdate !== -1) {
      coordiantions.pointages.splice(indexPointageToUpdate, 1, pointageToUpdate);
    }
    const updatedEntity = this.pointageCoordinations.updatedPointage;
    if (updatedEntity.heureDebutIsModified && updatedEntity.heureFinIsModified) {
      this.pointingService.verifyAuhorizedInPointingConstraint(coordiantions, true);
      this.pointingService.verifyAuhorizedOutPointingConstraint(coordiantions, true);
    } else if (updatedEntity.heureDebutIsModified) {
      this.pointingService.verifyAuhorizedInPointingConstraint(coordiantions, true);
      this.pointingService.verifyAuhorizedOutPointingConstraint(coordiantions, true);
    } else if (updatedEntity.heureFinIsModified) {
      this.pointingService.verifyAuhorizedInPointingConstraint(coordiantions, true);
      this.pointingService.verifyAuhorizedOutPointingConstraint(coordiantions, true);
    }
  }

  private async getTotalPointedHours(): Promise<void> {
    // console.log("await 35")
    const pointings = await this.pointingJsStoreService.getPointingByDate(this.sessionService.getDateJournee());
    let lastDayPointages = await this.planningsJsStoreService.getPointagesByDateJournee(this.dateService.getYesterDay(this.sessionService.getDateJournee()));
    lastDayPointages = lastDayPointages.filter(pointage => pointage.isAcheval === true);
    pointings.push.apply(pointings, lastDayPointages);
    let totalPointings = 0;
    const isNight = await this.socialConstraint.checkIsNight(new Date(), this.dateService.getCorrectDateJournee());
    for (const pointage of pointings) {
      pointage.heureDebut = this.dateService.createDateFromTime(this.sessionService.getDateJournee(), pointage.heureDebut);
      // si c'est un pointage acheval an calcul la durée du debut journée jusquau heur fin ou bien now
      if (pointage.isAcheval) {
        totalPointings += this.dateService.getDiffOn(pointage.heureFin ? this.dateService.createDateFromTime(this.dateService.getCorrectDateJournee(), pointage.heureFin) : new Date(), new Date(this.sessionService.getDebutJournee().getTime()), 'minutes');
      } else {
        if (!pointage.heureFin) {
          pointage.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':');
          if (!pointage.heureDebutIsNight && isNight) {
            pointage.heureFin = this.dateService.createDateFromTime(new Date(), pointage.heureFin);
            totalPointings += Math.trunc(this.dateService.getDiffOn(pointage.heureFin, pointage.heureDebut, 'minute'));
          } else {
            pointage.heureFin = this.dateService.createDateFromTime(this.sessionService.getDateJournee(), pointage.heureFin);
            totalPointings += this.dateService.getDiffOn(pointage.heureFin, pointage.heureDebut, 'minute');
          }
        } else {
          totalPointings += pointage.tempsPointes;
        }
      }
    }
    this.totalPointingHours = (totalPointings / 60).toFixed(2);
    this.sessionService.setTotalPointe(this.totalPointingHours);
  }

  public get_total_pointage () : void{
    console.log("the total pointe hours :"+this.getTotalPointedHours) }


  private desableLazyLoading(): void {
    if (this.scrollableTable) {
      this.scrollableTable.removeEventListener('scroll', this.scrollTableHandler, true);
    }
  }

  private checkIdleTimeIsOut(): void {
    this.myRhisIdle.isTimedOut().pipe(takeUntil(this.destroy)).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        this.sessionService.setAutorisation(false);
        this.autorisationService.setUserAuthorized(false);
        this.myRhisIdle.stopIdle();
      }
    });
  }

  private timeOutWarningSubscribe(): void {
    this.myRhisIdle.timeOutWarningCountdown().pipe(takeUntil(this.destroy)).subscribe((countdown: number) => {
      if (countdown) {
        this.authorizationIdle = countdown === 1 ? 0 : countdown;
      }
    });
  }
}
