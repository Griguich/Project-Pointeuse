import {Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {PointingComponent} from "../../shared-live-planning/pointing/pointing.component";
import {Subject} from "rxjs";
import Keyboard from "simple-keyboard";
import {DateService} from "../../../shared/services/date.service";
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import {NotificationService} from "../../../shared/services/notification.service";
import {RestaurantDataService} from "../../../shared/services/restaurant-data.service";
import {BadgingService} from "../../../shared/services/badging.service";
import {PointingService} from "../../pointage/service/pointing.service";
import {PointeuseRoutingService} from "../../../shared/services/PointeuseRoutingService";
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
import {OnlineService} from "../../../health/online.service";
import { DatePipe } from '@angular/common';
import {EmployeeModel} from "../../../shared/model/employee.model";
import {RestaurantModel} from "../../../shared/model/restaurant.model";

@Component({
  selector: 'rhis-clock-page',
  templateUrl: './clock-page.component.html',
  styleUrls: ['./clock-page.component.scss']
})
export class ClockPageComponent extends PointingComponent implements OnInit, OnDestroy {

  public dateJournee: string;
  public authorizationLabel: string = this.rhisTranslateService.translate('POINTAGE.AUTHORIZATION');
  public authorizationIdle: number = 0;
  public displayBadgeKeyboard = false;
  public displayBadgeKeyboardTablette = true;
  public heureCourant: number;
  public readonly restaurantName = this.sessionService.getRestaurantName();
  @ViewChild('keyboardInput')
  public badgeKeyboardInput: ElementRef;
  public isMobile: boolean;
  private codeTech = '0';
  private destroy: Subject<void> = new Subject<void>();
  private keyBoard: Keyboard;
  public heightInterface: any;
  public nameRestaurant: string;
  // Declare height and width variables
  public scrHeight: any;
  public scrWidth: any;
  public displayKeybordInstantiate = false;
  public sizeScreenSmall: any;
  public displayKeyboardTablette: any;
  public displayKeyBoardLive = false;
  public passerVotreBadge = '';
  public calendarDate: Date;
  public journer: string;
  public jouract: string;
  public alreadyRun = false;
  public showClockFullScreen = true;

  private displayKeybordBadgeKey: boolean = false;
  private readonly smallScreen = 991;

  constructor(
    private datePipe: DatePipe,
    private dateService: DateService,
    public rhisTranslateService: RhisTranslateService,
    public notificationService: NotificationService,
    public badgingService: BadgingService,
    public pointingService: PointingService,
    public pointeuseRouter: PointeuseRoutingService,
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
    public onlineService: OnlineService) {
    super(pointingService, router, sessionService, restaurantService, restaurantDataService,
      infoRestaurantJsStoreService, macPointeuse, badgingService, userActionService, notificationService, parameterJsStoreParameter);
    this.getScreenSize();
    this.displayKeybordInstantiate = false;
    this.badgingService.verifyShowKeyBoardParameter();
    this.sessionService.setIsManager(false);
    this.sessionService.isConnected = false;
    this.heureCourant = Date.now();
  }

  @HostListener('window:click', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.sizeScreenSmall = this.scrWidth <= this.smallScreen;
    this.displayKeybordInstantiate = true;
  }


  public async ngOnInit() {
    this.journer= this.rhisTranslateService.translate('DAYS.' + this.sessionService.getJournee().toUpperCase())+' ';
    this.calendarDate=new Date();
    this.jouract = this.sessionService.getDateJournee();
    this.nameRestaurant = this.sessionService.getRestaurantName();
    this.dateService.clock.pipe(takeUntil(this.destroy)).subscribe((now: Date) => {
      if (now.getHours() === 10 && now.getMinutes() === 0) {
        this.sessionService.setTimeToReload(0);
      }
      if (now.getHours() >= 10 && now.getHours() < 23) {
        this.sessionService.setTimeToReload(this.sessionService.getTimeToReload() + 1);
      }
      if (now.getHours() === 11 && now.getMinutes() === 50) {
        this.sessionService.setForceReload(true);
      }
      if (now.getHours() === this.sessionService.getDateProchOuverture().getHours() && now.getMinutes() === this.sessionService.getDateProchOuverture().getMinutes() + 30 ) {
        this.reload()
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
    });
    const details = navigator.userAgent;
    const regexp = /android|iphone|kindle|ipad/i;
    this.isMobile = regexp.test(details);
    console.clear();

    this.checkIdleTimeIsOut();

    this.timeOutWarningSubscribe();

    this.autorisationService.getUserAuthorized().pipe(takeUntil(this.destroy)).subscribe(userAuthorized => {
      if (!userAuthorized) {
        this.myRhisIdle.stopIdle();
      }
    });

    this.dateJournee = await this.sessionService.getDateJournee();

    this.pointingService.currentMessage.pipe(takeUntil(this.destroy)).subscribe((message: string) => {
      message.length > 1 ? this.notificationService.showErrorMessage(message, 'PLANNING_PAGE_PRINCIPALE.INVALID_CONSTRAINT') : null;
      this.constraintsMessage = message;
    });

    this.passerVotreBadge = await this.badgingService.verifyShowKeyBoardParameter() ? this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.CLOCK_PAGE.PASS_YOUR_CODE') :
      this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.CLOCK_PAGE.PASS_YOUR_BADGE');

    this.instantiateKeybord('simple-keyboard', 'onKeyPress');
  }

  public getDay() {
    const currentDate = new Date();
    const dayName = this.datePipe.transform(currentDate, 'EEEE');
    return this.rhisTranslateService.translate('DAYS.' + dayName.toUpperCase()) + ' ';
  }
  displayKeyboardLiveBadge() {
    this.displayKeyBoardLive = !this.displayKeyBoardLive;
    this.displayKeybordInstantiate = false;
    setTimeout(() => {
      this.displayKeyBoardLive = false;
      this.displayKeybordInstantiate = true;
    }, 20000);
  }


  public async passBadgeManually(codeBadge: string): Promise<void> {
    if (this.restaurantDataService.isInfoRestaurantIsEmpty()) {
      await this.restaurantDataService.getInfoRestaurant()
    }
    await this.restaurantDataService.checkIfIndexedDBIsDeletedAfterPassBadge();
    if (codeBadge === this.codeTech) {
      this.sessionService.setIsTechnicien(true);
      this.router.navigateByUrl('administrateur');
      this.sessionService.setIsManager(false);
      this.pointingService.updateMessage('');
    } else {
      this.sessionService.setIsTechnicien(false);
      this.sessionService.setIsTimePointerEntreeSortie(this.heureCourant);
      const pointageEntreeSortie = new Date(this.sessionService.getIsTimePointerEntreeSortie());
      pointageEntreeSortie.setMilliseconds(0);
      pointageEntreeSortie.setSeconds(0);
      this.sessionService.setIsTimePointerEntreeSortie(pointageEntreeSortie.getTime());
      const employee = await this.badgingService.verifyBadgeExist(codeBadge);
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
    }
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
  };

  // Instantiate a number keyboard for Number Badge
  public async instantiateKeybord(className: string, keyPressMethod: string): Promise<void> {
      if (await this.badgingService.verifyShowKeyBoardParameter()) {
        if (!this.displayBadgeKeyboard) {
          this.displayBadgeKeyboard = true;
        }
        if (this.displayBadgeKeyboard) {
          const timer = setTimeout(() => {
            this.keyBoard = new Keyboard('.' + className, {
              minLegth : 15,
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
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    if (this.keyBoard && this.keyBoard.getInput()) {
      this.keyBoard.destroy();
    }
    if (this.badgeKeyboardInput) {
      this.renderer.removeChild(this.self.nativeElement, this.badgeKeyboardInput.nativeElement);
    }
  }

  private reload(): void {
    window.location.reload();
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

  /**
   * Set caret position (cursor position) in an input
   * @param: elem
   * @param: caretPos
   */
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

  /**
   * Modify style for the button 'ENTER'
   */
  private updateBackSpaceIcon(): void {
    const backSpaceBtn = document.querySelector('[data-skbtn="{bksp}"]');
    if (backSpaceBtn) {
      backSpaceBtn.innerHTML = '';
      backSpaceBtn.setAttribute('style', 'background-color: #ff9b42');
      const backSpaceIcon = document.createElement('img');
      backSpaceIcon.id = 'divback';
      backSpaceIcon.src = 'assets/icons/pointage/backspace2.svg';
      backSpaceIcon.style.height = '42px';
      backSpaceBtn.appendChild(backSpaceIcon);
    }
  }

  /**
   * Modify style for the button 'ENTER'
   */
  private updateEntreButton(): void {
    const entreBtn = document.querySelector('[data-skbtn="{entre}"]');
    if (entreBtn) {
      entreBtn.innerHTML = '';
      entreBtn.setAttribute('style', 'background-color: #ff9b42');
      const entreBtnIcon = document.createElement('img');
      entreBtnIcon.src = 'assets/icons/pointage/entreBtn.svg';
      entreBtnIcon.style.height = '40px';
      entreBtn.appendChild(entreBtnIcon);
    }
  }

  /**
   * Create the button '0' in badge keyboard in the row 4
   */
  private updateZeroButton(): void {
    const zero = document.querySelector('[data-skbtn="0"]');
    if (zero) {
      zero.setAttribute('class', 'btn0 hg-button');
      const zeroB = document.createElement('span');
      zero.appendChild(zeroB);
    }
  }
  getjournerActivite() {
    return this.rhisTranslateService.translate('DAYS.' + this.sessionService.getJournee().toUpperCase()) + ' ';

  }
  getcalendarDate() {
    return new Date();
  }

}

