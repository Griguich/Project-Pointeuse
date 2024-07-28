import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {PointingComponent} from "../../shared-live-planning/pointing/pointing.component";
import {PointageModel} from "../../../shared/model/pointage.model";
import {ShiftModel} from "../../../shared/model/shift.model";
import {EmployeeModel} from "../../../shared/model/employee.model";
import {TypePointageModel} from "../../../shared/model/type-pointage.model";
import {Subject} from "rxjs";
import Keyboard from "simple-keyboard";
import {PaginationArgs} from "../../../shared/model/pagination.args";
import {PlanningJsStoreService} from "../../plannings/services/planningJsStore.service";
import {ShiftJsStoreService} from "../../../shared/services/JsStoreServices/shiftJsStore.service";
import {DecoupageHoraireJsStoreService} from "../../../shared/services/JsStoreServices/decoupageHoraireJsStore.service";
import {DateService} from "../../../shared/services/date.service";
import {EmployeJsStoreService} from "../../employes/service/employeJsStore.service";
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import {NotificationService} from "../../../shared/services/notification.service";
import {RestaurantDataService} from "../../../shared/services/restaurant-data.service";
import {BadgingService} from "../../../shared/services/badging.service";
import {PointingService} from "../../pointage/service/pointing.service";
import {Router} from "@angular/router";
import {SessionService} from "../../../shared/services/session.service";
import {RestaurantService} from "../../../shared/services/restaurant.service";
import {InfoRestaurantJsStoreService} from "../../../shared/services/JsStoreServices/infoRestaurantJsStore.service";
import {MacPointeuseService} from "../../../shared/services/mac-pointeuse.service";
import {UserActionDetectorService} from "../../../shared/services/user-action-detector.service";
import {ParameterJsStoreService} from "../../parametre-globaux/services/parameter-js-store.service";
import {MyrhisIdleSerice} from "../../../shared/services/myrhis.idle.serice";
import {AutorisationService} from "../../../shared/services/autorisation.service";
import {takeUntil} from "rxjs/operators";
import {SortEvent} from "primeng/api";
import {DateInterval} from "../../../shared/model/gui/date-interval";
import {JourSemaine} from "../../../shared/enumration/jour.semaine";
import {SynchronisationService} from "../../../shared/services/synchronisation.service";
import {OnlineService} from "../../../health/online.service";
import {AchevalService} from "../../../shared/services/acheval.service";
import {RestaurantDePretEnumeration} from "../../../shared/model/enumeration/RestaurantPret.enum";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'rhis-list-employee-page',
  templateUrl: './list-employee-page.component.html',
  styleUrls: ['./list-employee-page.component.scss']
})
export class ListEmployeePageComponent extends PointingComponent implements OnInit, AfterViewInit, OnDestroy {
  // the width of a minute
  public widthOfMinute = 1;
  protected startTime: string;
  protected startTimeIsNight: boolean;
  protected endTime: string;
  protected endTimeIsNight: boolean;
  // list pointage recuperée du IDB
  public pointages: PointageModel[] = [];
  // list shift recuperée du IDB
  public shifts: ShiftModel[] = [];
  // list of displayed employees
  public listEmployees: EmployeeModel[];
  // filter state between pointed or all employees
  // list employes to display avec pointage et planning
  public currentDateJournee: Date;
  public dateJournee: string;
  public header = [];
  public leftReal = 0;
  public hourWidth: number = 60 * this.widthOfMinute;
  public employeeBlockWidth: number = 170;
  public verificationResult: any[];
  public employeeCoordiantions = {} as {
    selectedEmployee: any,
    employeeIndex: number
  };
  public showEmptyMessage = false;
  public typePointages: TypePointageModel[] = [];
  public isEntryPointing: number;
  private readonly codeTech = '0';
  private isScrollActive = true;
  private orderSort = 0;
  @ViewChild('realTime', { read: ViewContainerRef }) realTime: ViewContainerRef
  @ViewChild('realTimeTemplate', { read: TemplateRef }) realTimeTemplate: TemplateRef<null>;
  @ViewChild('keyboardInput') badgeKeyboardInput: ElementRef;
  @ViewChildren('tableRow', {read: ElementRef}) rows: QueryList<ElementRef>;
  @ViewChildren('employeeHeader', {read: ElementRef}) firstColulmnsEmployees: QueryList<ElementRef>;

  timedOut = false;
  public authorizationLabel: string = this.rhisTranslateService.translate('POINTAGE.AUTHORIZATION');
  public authorizationIdle: number = 0;
  public heureCourant: number;
  public hiddenLineRealTime: boolean;
  private destroy: Subject<void> = new Subject<void>();
  private timeInPlanningComponent = 0;
  public maxWidthPlanning: number;
  public displayBadgeKeyboard = false;
  private scrollToRealTimeHandler;
  private scrollTableHandler;
  private scrollableTable;
  private keyBoard: Keyboard;

  // Pagination attributes
  private paginationArgs: PaginationArgs = {pageNumber: 0, pageSize: 5};
  private allPointedEmployees = [];
  public heightInterface: any;
  public nameRestaurant: string;
  public passerVotreBadge: string;
  public alreadyRun = false;


  constructor(
    private planningsJsStoreService: PlanningJsStoreService,
    private shiftJsStoreService: ShiftJsStoreService,
    private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService,
    public dateService: DateService,
    private employeJsStoreService: EmployeJsStoreService,
    public rhisTranslateService: RhisTranslateService,
    public notificationService: NotificationService,
    public badgingService: BadgingService,
    public pointingService: PointingService,
    public router: Router,
    public sessionService: SessionService,
    public restaurantService: RestaurantService,
    public restaurantDataService: RestaurantDataService,
    public infoRestaurantJsStoreService: InfoRestaurantJsStoreService,
    public macPointeuse: MacPointeuseService,
    public userActionService: UserActionDetectorService,
    public parameterJsStoreParameter: ParameterJsStoreService,
    private myRhisIdle: MyrhisIdleSerice,
    private autorisationService: AutorisationService,
    private renderer: Renderer2,
    private self: ElementRef,
    private synchronisationService: SynchronisationService,
    public onlineService: OnlineService,
    public achevalService: AchevalService,
    private datePipe: DatePipe
  ) {
    super(pointingService, router, sessionService, restaurantService, restaurantDataService,
      infoRestaurantJsStoreService, macPointeuse, badgingService, userActionService, notificationService, parameterJsStoreParameter);
    this.sessionService.setIsManager(false);
    this.sessionService.isConnected = false;
    this.heureCourant = Date.now();
    this.scrollToRealTimeHandler = () => this.scrollToRealTime();
    window.addEventListener('scroll', this.scrollToRealTimeHandler, true);
    this.checkParametersChanges();
  }

  private checkParametersChanges(): void {
    this.synchronisationService.currentState.pipe(takeUntil(this.destroy)).subscribe(async _ => {
      this.header = [];
      await this.ngOnInit();
      await this.ngAfterViewInit();
    });

  }

  public async ngOnInit() {
    this.sessionService.dateJournee$.pipe(takeUntil(this.destroy))
      .subscribe(dateJournee => {
      this.dateJournee = dateJournee;
    })
    this.nameRestaurant = this.sessionService.getRestaurantName();
    // for redirection if the pointeuse is not associated
    if (btoa(this.sessionService.getIdRestaurant()) === 'null') {
      this.passBadgeManually(this.codeTech)
    }
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

      if (this.sessionService.getForceReload()) {
        this.sessionService.setTimeToReload(0);
        this.sessionService.setForceReload(false);
        this.reload();
      }
      if (this.restaurantDataService.isCanReload()) {
        this.sessionService.setTimeToReload(0);
        this.sessionService.setForceReload(false);
        this.reload();
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

    this.dateJournee = await this.sessionService.getDateJournee();
    this.currentDateJournee = new Date(this.dateJournee);
    this.badgingService.pointingstate.pipe(takeUntil(this.destroy)).subscribe((state: number) => this.isEntryPointing = state);
    await this.getData();
    this.pointingService.currentMessage.pipe(takeUntil(this.destroy)).subscribe((message: string) => {
      message.length > 1 ? this.notificationService.showErrorMessage(message, 'PLANNING_PAGE_PRINCIPALE.INVALID_CONSTRAINT') : null;
      this.constraintsMessage = message;
    });
    this.passerVotreBadge = this.isMobile === true ? this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.CLOCK_PAGE.PASS_YOUR_CODE') : this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.CLOCK_PAGE.PASS_YOUR_BADGE');
    this.setPositionPlanning();
  }

  public async passBadgeManually(codeBadge: string): Promise<void> {
    if (codeBadge === this.codeTech) {
      this.sessionService.setIsTechnicien(true);
      this.sessionService.setBadge(this.codeTech);
      this.sessionService.setEmployeFullName('Admin');
      this.sessionService.setIsManager(false);
      this.router.navigate(['administrateur']);
      this.pointingService.updateMessage('');
    } else {
      this.sessionService.setIsTechnicien(false);
      this.sessionService.setIsTimePointerEntreeSortie(this.heureCourant);
      const pointageEntreeSortie = new Date(this.sessionService.getIsTimePointerEntreeSortie());
      pointageEntreeSortie.setMilliseconds(0);
      pointageEntreeSortie.setSeconds(0);
      this.sessionService.setIsTimePointerEntreeSortie(pointageEntreeSortie.getTime());
      const employee = await this.badgingService.verifyBadgeExist(codeBadge);
      if (employee  && employee.prete && employee.restaurantDePret === RestaurantDePretEnumeration.RestaurantA) {
        this.notificationService.showErrorMessage('PLANNING_PAGE_PRINCIPALE.INVALID_BADGE_PRET');
      } else {
      if (employee) {
        this.setSeesionData(employee);
        this.showPointingButtons = true;
        [this.lastPointing, this.isEnterPointing] = await this.badgingService.getBadgingState(employee.idEmployee, true);
        this.badgingService.changePointingState(this.isEnterPointing ? 1 : 0);
        await this.checkPointing(codeBadge);
      } else {
        this.badgeCode = '';
        this.badge = '';
        this.card = '';
        this.notificationService.showErrorMessage('PLANNING_PAGE_PRINCIPALE.INVALID_BADGE');
      }
    }}
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

  /**
   *  Display the red vertical line on real time
   */
  public async scrollToRealTime(event = null): Promise<void> {
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
        this.leftReal = this.realTime.element.nativeElement.left = diffHours * this.hourWidth + this.employeeBlockWidth + 35 + (minuteActuel * this.widthOfMinute) - table.scrollLeft;
    }
    this.displayLineRealTime();
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


  /***
   * Get  list shift, list employees and list pointage from IDB
   */
  public async getData(): Promise<void> {
    this.realTime.clear();
    this.paginationArgs.pageNumber = 0;
    this.listEmployees = [];
    const employees = (await this.employeJsStoreService.getEmployesList()).map((emp: EmployeeModel) => this.getMinFormatForEmployee(emp));
    const pointages = await this.planningsJsStoreService.getPointagesByDateJournee(this.dateJournee);
  // recupération des pointage de j-1
    const lastDayPointages = await this.achevalService.getYesterdayPoitnings();
    // ajouter les pointages d'hier dans la liste
    pointages.push.apply(pointages, lastDayPointages.filter((pointage: PointageModel) => pointage.heureFin == null || pointage.isAcheval === true));
    this.shifts = (await this.shiftJsStoreService.getShiftList()).map((shift: ShiftModel) => {
      shift.employee = {idEmployee: shift.employee ? shift.employee.idEmployee : null} as EmployeeModel;
      return shift;
    });
    this.allPointedEmployees = this.structureDataToDisplay(pointages, employees).filter((employee: EmployeeModel) => employee['shifts'] && employee['shifts'].length);
    this.listEmployees = this.allPointedEmployees.splice(0, this.paginationArgs.pageSize);
    this.showEmptyMessage = (!this.listEmployees) || (this.listEmployees.length === 0);
    this.setUpLazyLoading();
    const timer = setTimeout(_ => {
      this.scrollToCorrectPosition();
      this.scrollToRealTime();
      clearTimeout(timer);
    }, 200);
    if (this.listEmployees.length) {
      this.realTime.createEmbeddedView(this.realTimeTemplate);
    }
  }

  private getMinFormatForEmployee(employee: EmployeeModel): EmployeeModel {
    return {
      prenom: employee.prenom,
      nom: employee.nom,
      badge: employee.badge,
      idEmployee: employee.idEmployee
    } as EmployeeModel;
  }

// ------------------------- GET PAGINATED DATA -------------------------------------

  private async loadMore(): Promise<void> {
    this.paginationArgs.pageNumber += 1;
    if (this.allPointedEmployees.length) {
      this.listEmployees = this.listEmployees.concat(this.allPointedEmployees.splice(0, this.paginationArgs.pageSize));
    }
  }

  // ---------------------- END GET PAGINATED DATA ----------------------------------

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

  async ngAfterViewInit(): Promise<void> {
    await this.createDayHourlyTable();
    this.scrollToCorrectPosition();
    this.initializeEmployeeColumnHeight(100);
    this.scrollToRealTime();
    this.setPositionPlanning();
  }

  private setUpLazyLoading(): void {
    this.desableLazyLoading();
    const timeout = setTimeout(_ => {
      this.scrollableTable = document.getElementsByClassName('ui-table-scrollable-body')[1];
      if (this.scrollableTable) {
        this.scrollableTable.scrollTop = 0;
        this.scrollTableHandler = () => this.updateTableData();
        this.scrollableTable.addEventListener('scroll', this.scrollTableHandler, true);
      }
      clearTimeout(timeout);
    }, 500);
  }

  private async updateTableData(event = null): Promise<void> {
    if ((10 + this.scrollableTable.clientHeight + this.scrollableTable.scrollTop >= this.scrollableTable.scrollHeight) && this.isScrollActive) {
      this.isScrollActive = false;
      this.loadMore();
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
    await this.getOpenAndCloseHours();
    const startTimeNb = this.converteStringToHour(this.startTime, this.startTimeIsNight);
    const toTimeNb = this.converteStringToHour(this.endTime, this.endTimeIsNight);
    this.createColumn(startTimeNb, toTimeNb, +this.endTime.substring(3, 5));
  }

  /**
   * Get open and close hours for the selected date
   */
  private async getOpenAndCloseHours(): Promise<void> {
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
    this.endTimeIsNight = finJourneesPhases['valeur' + key + 'IsNight'];
  }

  /**
   * Get the last hour to display in the table based on the close hour of the day
   */
  public getEndHourIfShouldBeDisplayed(): string {
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

  // si 06h et night egale à true, dans ce cas là, il faut ajouter 24 heures
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

  private desableLazyLoading(): void {
    if (this.scrollableTable) {
      this.scrollableTable.removeEventListener('scroll', this.scrollTableHandler, true);
    }
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

  // handle the key press event adding badge
  public onKeyPress = (button: string, event: { preventDefault: () => void; }) => {
    const position = this.badgeKeyboardInput.nativeElement.selectionEnd;
    if (button === '{bksp}') {
      this.badgeKeyboardInput.nativeElement.value = this.badgeKeyboardInput.nativeElement.value.slice(0,
          (this.badgeKeyboardInput.nativeElement.selectionEnd - 1) || 0)
        + this.badgeKeyboardInput.nativeElement.value.slice(this.badgeKeyboardInput.nativeElement.selectionEnd);
      this.setCaretPosition(this.badgeKeyboardInput.nativeElement, ((position - 1) || 0));
    } else if (button === '{entre}') {
      this.passBadgeManually(this.badgeKeyboardInput.nativeElement.value);
       event.preventDefault();
    } else {
      this.badgeKeyboardInput.nativeElement.value =
        (this.badgeKeyboardInput.nativeElement.value + button).split('').length > 15 ?
          this.badgeKeyboardInput.nativeElement.value : (
            this.badgeKeyboardInput.nativeElement.value.slice(0, position) +
            button + this.badgeKeyboardInput.nativeElement.value.slice(position)
          );
      this.setCaretPosition(this.badgeKeyboardInput.nativeElement, (position + 1));
    }
  }

  // Instantiate a number keyboard for Number Badge
  public async instantiateKeybord(className: string, keyPressMethod: string): Promise<void> {
      if (!this.alreadyRun) {
        // code to run only once
        if (await this.badgingService.verifyShowKeyBoardParameter()) {
          if (!this.displayBadgeKeyboard) {
            this.displayBadgeKeyboard = true;
          }
          if (this.displayBadgeKeyboard) {
            const timer = setTimeout(() => {
              this.keyBoard = new Keyboard('.' + className, {
                onKeyPress: button => this[keyPressMethod](button),
                layout: {
                  default: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0 {entre}']
                },
                theme: 'hg-theme-default hg-layout-numeric numeric-theme'
              });
              this.updateBackSpaceIcon();
              this.updateZeroButton();
              this.updateEntreButton();
              clearTimeout(timer);
            }, 50);

          } else {
            return null;
          }
        }
        this.alreadyRun = true
      }

  }
  private updateBackSpaceIcon(): void {
    const backSpaceBtn = document.querySelector('[data-skbtn="{bksp}"]');
    if (backSpaceBtn) {
      backSpaceBtn.innerHTML = '';
      backSpaceBtn.setAttribute('style', 'background-color: #ff9b42');
      const backSpaceIcon = document.createElement('img');
      backSpaceIcon.id = 'divback';
      backSpaceIcon.src = 'assets/icons/pointage/backspace2.svg';
      backSpaceIcon.style.height = '30px';
      backSpaceBtn.appendChild(backSpaceIcon);
    }

  }

  private updateEntreButton(): void {
    const entreBtn = document.querySelector('[data-skbtn="{entre}"]');
    if (entreBtn) {
      entreBtn.innerHTML = '';
      entreBtn.setAttribute('style', 'background-color: #ff9b42');
      const entreBtnIcon = document.createElement('img');
      entreBtnIcon.src = 'assets/icons/pointage/entreBtn.svg';
      entreBtnIcon.style.height = '26px';
      entreBtn.appendChild(entreBtnIcon);
    }

  }

  private updateZeroButton(): void {

    const zero = document.querySelector('[data-skbtn="0"]');
    if (zero) {
      zero.setAttribute('class', 'btn0 hg-button  ');
      const zeroB = document.createElement('span');
      zero.appendChild(zeroB);

    }
  }
  // check badgeKeyboard when clicking outside badge Input
  public badgeKeyboard(): void {
    this.displayBadgeKeyboard = false;
    if (this.keyBoard && this.keyBoard.getInput()) {
      this.keyBoard.destroy();
    }
    this.alreadyRun = false;

  }

  // Set caret position (cursor position) in an input
  private setCaretPosition(elem: any, caretPos: number): void {
    if (elem != null) {
      if (elem.createTextRange) {
        const range = elem.createTextRange();
        range.move('character', caretPos);
        range.select();
      } else {
        if (elem.selectionStart) {
          elem.focus();
          elem.setSelectionRange(caretPos, caretPos);
        } else {
          elem.focus();
        }
      }
    }
  }
  // create a backspace icon for number keyboard
  isMobile: boolean;
  private reload(): void {
    window.location.reload();
  }

  ngOnDestroy() {
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

    if (this.keyBoard && this.keyBoard.getInput()) {
      this.keyBoard.destroy();
    }
    window.removeEventListener('scroll', this.scrollToRealTimeHandler, true);
    this.desableLazyLoading();
    if (this.badgeKeyboardInput) {
      this.renderer.removeChild(this.self.nativeElement, this.badgeKeyboardInput.nativeElement);
    }
    this.allPointedEmployees = null;
    this.listEmployees = null;
    this.shifts = null;
  }

  public getAssociatedShifts(dateService: DateService, pointage: any, shift: any, shifts: any[]): any[] {
    const partitions = [];
    if (shifts && (shift.idShift !== 0)) {
      const realShifts = shifts.filter(s => s.idShift !== 0).sort((firstShift: any, secondShift: any) => dateService.isSameOrBeforeByDayTimeAndIsNight(firstShift, secondShift) ? -1 : 1);
      const intersections = [];
      realShifts.forEach((s: any) => {
        //TODO
        if (s.idShift !== shift.idShift && pointage) {
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
            partition.push(null, {shift: null, interval: [intersection.interval[1], intersections[index + 1].interval[0]]});
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

  getjourner() {
    return this.rhisTranslateService.translate('DAYS.' + this.sessionService.getJournee().toUpperCase()) + ' ';

  }

  getcalendarDate() {
    return new Date();
  }

  getDayName(): string {
    const currentDate = new Date();
    const dayName = this.datePipe.transform(currentDate, 'EEEE');
    return this.rhisTranslateService.translate('DAYS.' + dayName.toUpperCase()) + '  ';
  }

  setPositionPlanning() {
    setTimeout(() => {
      const sectionPlanning: HTMLElement = document.querySelector('.ui-table');
      console.log('sectionPlanning ', sectionPlanning);

      if (sectionPlanning) {
        sectionPlanning.style.margin = "0 auto";
      }
    });
  }
}
