import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AnomalieJsStoreService} from '../anomalie/service/anomalieJsStore.service';
import {RestaurantDataService} from '../../shared/services/restaurant-data.service';
import {EmployeJsStoreService} from '../employes/service/employeJsStore.service';
import {SynchronisationService} from '../../shared/services/synchronisation.service';
import {SessionService} from '../../shared/services/session.service';
import {DateService} from '../../shared/services/date.service';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {RhisTranslateService} from 'src/app/shared/services/rhis-translate.service';
import {ShiftJsStoreService} from "../../shared/services/JsStoreServices/shiftJsStore.service";
import {MyrhisIdleSerice} from "../../shared/services/myrhis.idle.serice";
import {ConfirmationService} from "primeng/api";
import {OnlineService} from "../../health/online.service";
import {RxStompService} from "@stomp/ng2-stompjs";
import {PointageModel} from "../../shared/model/pointage.model";
import {PointingService} from "../pointage/service/pointing.service";
import {PathService} from "../../shared/services/path.service";
import {PlanningJsStoreService} from "../plannings/services/planningJsStore.service";
import * as moment from 'moment';
import {LanguageStorageService} from '../../shared/services/language-storage.service';
import {ParameterJsStoreService} from '../../shared/services/JsStoreServices/parameter-js-store.service';
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {DroitPointeuseEnum} from "../../shared/model/enumeration/droit-pointeuse.enum";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy: Subject<void> = new Subject<void>();

  public nbAnomalies: number;
  public codeBadge: string;
  public nameRestaurant: string;
  public nameUser: string;
  public isManagerMenu: boolean;
  public personalizedAccess: string;
  public readonly ALERTES = DroitPointeuseEnum.ALERTES;
  public popupSynchronisation = false;
  private paramPretName = 'PRET_SALARIE';
  public popUpStyle = {
    width: 400,
    height: 700
  };
  public calendarFr: any;
  public dateJournee = this.dateService.getCorrectDateJournee();
  public firstDayAsInteger = 0;
  public maxDate = this.dateService.getCorrectDateJournee();
  public syncForm = new UntypedFormGroup(
    {
      syncPointages: new UntypedFormControl(true),
      dateJournee: new UntypedFormControl(),
      syncPret: new UntypedFormControl(true),
      syncCorrections: new UntypedFormControl(true),
      syncEmployes: new UntypedFormControl(true),
      syncPlanning: new UntypedFormControl(true),
      syncParam: new UntypedFormControl(true)
    }
  );
  public value = 0;
  public syncEnCours = false;
  display: boolean;
  istech: any;
  volume: number;
  isOnline = true;

  public isPretActive = false;
  private isMobile: boolean;
  sessionDateJournee = this.sessionService.dateJournee$.value;
  sessionJournee = this.sessionService.journee$.value;

  constructor(public router: Router,
              public anomalieJsStoreService: AnomalieJsStoreService,
              private restaurantDataService: RestaurantDataService,
              private sesionService: SessionService,
              private employeJsStoreService: EmployeJsStoreService,
              private shiftJsStoreService: ShiftJsStoreService,
              private synchronisationService: SynchronisationService,
              private sessionService: SessionService,
              private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private myrhisIdleSerice: MyrhisIdleSerice,
              private confirmationService: ConfirmationService,
              private onlineService: OnlineService,
              private langueStorageService: LanguageStorageService,
              public planningJsStrore: PlanningJsStoreService,
              public synchronisation: SynchronisationService,
              private pointingService: PointingService,
              private parameterJsStoreService: ParameterJsStoreService,
              private rxStompService: RxStompService,
              private pathService: PathService
  ) {
  }

  async ngOnInit() {
    this.dateJournee.setSeconds(0);
    this.dateJournee.setMilliseconds(0);
    this.dateJournee = new Date(this.dateJournee.setDate(this.dateJournee.getDate() - 1));
    this.isManagerMenu = this.sessionService.getIsManager();
    this.personalizedAccess =this.sessionService.getpersonalizedAccess();
    this.sessionService.getBadge() == 'ée' ?  this.codeBadge = '0' : this.codeBadge = this.sessionService.getBadge();
    this.sessionService.getRestaurantName() == 'ée' ?  this.nameRestaurant = ' ' : this.nameRestaurant = this.sessionService.getRestaurantName();
    this.sessionService.getEmployeFullName() == 'ée' ? this.nameUser = '' : this.nameUser = this.sessionService.getEmployeFullName();
    this.sessionService.setSyncPointageProgress(null);
    this.sessionService.setSyncCorrectionsProgress(null);
    this.sessionService.setSyncParamProgress(null);
    this.sessionService.setSyncPretsProgress(null);
    this.sessionService.setSyncEmployesProgress(null);
    this.sessionService.setSyncPlanningProgress(null);
    this.setCalendar();
    this.getAllGuiAnomalieByRestaurant();
    const paramList = await this.parameterJsStoreService.getParamatreByParam(this.paramPretName);
    this.isPretActive = paramList[0].valeur === 'true';
    const details = navigator.userAgent;
    const regexp = /android|iphone|kindle|ipad/i;
    this.isMobile = regexp.test(details);
    this.onlineService.onlineState().pipe(takeUntil(this.destroy))
      .subscribe(isOnline => {
      this.isOnline = isOnline;
    })
    this.sessionService.dateJournee$.pipe(takeUntil(this.destroy)).subscribe(dateJournee => {
      this.sessionDateJournee = dateJournee;
    })
    this.sessionService.journee$.pipe(takeUntil(this.destroy)).subscribe(journee => this.sessionJournee = journee);
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  /**
   * Getting all anomalie by restaurant
   */
  private getAllGuiAnomalieByRestaurant(): any {
    this.anomalieJsStoreService.getCountAnomalie(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee())).then((result: number) => {
      this.nbAnomalies = result;
    });

  }

  /**
   * redirect to anomalie interface
   */
  public goToAnomalie(): void {
    this.router.navigateByUrl('/anomalie');
  }

  public async synchronize(): Promise<void> {
    const dateChoisit: Date = this.dateService.getCorrectDateJournee(this.syncForm.value['dateJournee']);
    if (this.syncForm.value['syncPointages']) {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.SYNCHRONIZE_POINTING_MESSAGE_PART1') + ' ' + this.dateService.dateToLongForm(dateChoisit)
          + ' ' + this.rhisTranslateService.translate('POPUPS.SYNCHRONIZE_POINTING_MESSAGE_PART2'),
        header: this.rhisTranslateService.translate('POPUPS.SYNCHRONIZE_POINTING_TITLE'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.ACCEPT_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.REJECT_LABEL'),
        icon: 'pi pi-info-circle',
        accept: async () => {
          // synchronization with http service
           await this.synchronisationService.synchroniseRegulary(this.syncForm.value['syncPointages'], this.dateService.dateToShortForm(dateChoisit), 1);
          // synchronization with rabitmq
          // await this.synchronisationService.onSendPointing(this.syncForm.value['syncPointages'], this.dateService.dateToShortForm(dateChoisit), 1);
           await this.synchroniseProceed();
        },
        reject: () => {
        }
      });
    } else {
      await this.synchroniseProceed();
    }
  }

  public async synchroniseProceed(): Promise<void> {

    this.myrhisIdleSerice.stopIdle();

    let syncValues = [];
    this.value = 0;

    this.syncEnCours = !!(this.syncForm.value['syncEmployes'] || this.syncForm.value['syncParam'] || this.syncForm.value['syncPointages'] || this.syncForm.value['syncPlanning']  ||  this.syncForm.value['syncPret']);
    if (this.syncForm.value['syncEmployes']) {
      await this.restaurantDataService.getEmployeeActifAndSaveToLocalBase(+this.sesionService.getIdRestaurant());
    }
    if (this.syncForm.value['syncPlanning']) {
      await this.restaurantDataService.getShiftAndSaveToLocalBase(+this.sesionService.getIdRestaurant());
    }
    if (this.syncForm.value['syncPret'] && this.isPretActive) {
      await this.restaurantDataService.getEmployePreteActifAndShiftAndPointage(+this.sesionService.getIdRestaurant());
    }

    let languageHasChanged = false ;
    if (this.syncForm.value['syncParam']) {
      const currentVocalLang = this.langueStorageService.getVocalLanguageSettings().toLowerCase();
      const currentDisplayLang = this.langueStorageService.getDisplayLanguageSettings().toLowerCase();
      await this.restaurantDataService.getParametreList(+this.sesionService.getIdRestaurant());
      if (this.langueStorageService.getDisplayLanguageSettings().toLowerCase() !== currentDisplayLang ||
        this.langueStorageService.getVocalLanguageSettings().toLowerCase() !== currentVocalLang ){
        languageHasChanged = true ;
      }
    }


    this.shiftJsStoreService.setSynchronisedListShift(true);

    syncValues.push({
      'syncEnCours': this.syncForm.value['syncEmployes'],
      'syncResult': this.sessionService.getSyncEmployesProgress(),
      'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.EMPLOYE_PROGRESS')
    });

    if (this.isPretActive) {
      syncValues.push({
        'syncEnCours': this.syncForm.value['syncPret'],
        'syncResult': this.sessionService.getSyncPretsProgress(),
        'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PRET_PROGRESS')
      });
    }

    syncValues.push({
      'syncEnCours': this.syncForm.value['syncParam'],
      'syncResult': this.sessionService.getSyncParamProgress(),
      'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PARAM_PROGRESS')
    });
    syncValues.push({
      'syncEnCours': this.syncForm.value['syncPointages'],
      'syncResult': this.sessionService.getSyncPointageProgress(),
      'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.POINTAGE_PROGRESS')
    });
    syncValues.push({
      'syncEnCours': this.syncForm.value['syncPlanning'],
      'syncResult': this.sessionService.getSyncPlanningProgress(),
      'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PLANNING_PROGRESS')
    });

    syncValues = syncValues.filter((syncValue: any) => syncValue.syncEnCours);
    if (this.syncEnCours) {
      let i = 0;
      let interval = setInterval(async () => {
        const element: Element = document.querySelectorAll('div.ui-progressbar-label.ng-star-inserted')[0];
        const element2: Element = document.querySelectorAll('div.ui-progressbar-value')[0];

        if (i < syncValues.length && syncValues[i].syncEnCours) {
          if (syncValues[i].syncResult === null) {
            (element as HTMLElement).innerHTML = syncValues[i].syncText;
          } else if (syncValues[i].syncResult) {
            this.value = this.value + Math.floor((100 / syncValues.length));
            (element as HTMLElement).innerHTML = syncValues[i].syncText;
            (element2 as HTMLElement).style.background = 'rgb(45, 199, 109)';
            i++;
          } else {
            if (this.sessionService.getSyncPointageProgress() === false) {
              (element as HTMLElement).innerHTML = this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.ECHECK_SYNC_POINTAGE');
              (element2 as HTMLElement).style.background = '#dc3545';
              this.value = this.value + Math.floor((100 / syncValues.length));
              i++;
            } else if (syncValues[i].syncText !== this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.POINTAGE_PROGRESS')) {
              (element as HTMLElement).innerHTML = syncValues[i].syncText;
              (element2 as HTMLElement).style.background = '#dc3545';
              this.value = this.value + Math.floor((100 / syncValues.length));
              i++;
            }

          }
        } else {
          i++;
        }
        if (i > syncValues.length) {
          this.value = 100;
          (element as HTMLElement).innerHTML = '';
          if (syncValues.find((syncValue: any) => !syncValue.syncResult)) {
            (element2 as HTMLElement).style.background = '#dc3545';
          } else {
            (element2 as HTMLElement).style.background = 'rgb(45, 199, 109)';
            (element as HTMLElement).innerHTML = '100%';
          }
          this.popupSynchronisation = false;
          clearInterval(interval);
          this.sessionService.setSyncPointageProgress(null);
          this.sessionService.setSyncCorrectionsProgress(null);
          this.sessionService.setSyncParamProgress(null);
          this.sessionService.setSyncPretsProgress(null);
          this.sessionService.setSyncEmployesProgress(null);
          this.sessionService.setSyncPlanningProgress(null);
          await this.myrhisIdleSerice.startIdle();
          if (languageHasChanged) {
            window.location.reload();
          }
        }
      }, 2000);

    }
  }

  /**
   * afficher le popup de synchronisation
   * @param anomalie
   */
  public showPopupSynchronisation(): void {
    this.popupSynchronisation = true;
    this.syncForm.setValue({
      syncPointages: true,
      syncPret: true,
      dateJournee: new Date(this.dateJournee),
      syncCorrections: true,
      syncEmployes: true,
      syncPlanning: true,
      syncParam: true
    });
  }

  /**
   * fermer le popup de synchronisation
   */
  public closePopup(): void {
    this.popupSynchronisation = false;
    this.syncEnCours = false;
  }

  private setCalendar(): void {
    this.firstDayAsInteger = 1;
    this.calendarFr = {
      closeText: 'Fermer',
      prevText: 'Précédent',
      nextText: 'Suivant',
      currentText: 'Aujourd\'hui',
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
        'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      dayNamesShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
      dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      weekHeader: '', // Sem.
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: this.firstDayAsInteger,
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ''
    };
  }


  public  volumeControl(event) {
    this.sessionService.setVolume(event.value);
    console.log(event.value);

  }
}
