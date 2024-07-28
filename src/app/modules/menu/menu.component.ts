import {Component, HostListener, OnInit} from '@angular/core';
import {BlockUblockPointeuseService} from '../../shared/services/block-ublock-pointeuse.service';
import {SessionService} from '../../shared/services/session.service';
import {PointeuseRoutingService} from '../../shared/services/PointeuseRoutingService';
import {MacPointeuseService} from '../../shared/services/mac-pointeuse.service';
import {RestaurantService} from '../../shared/services/restaurant.service';
import {AutorisationPointageService} from '../../shared/services/autorisation-pointage.service';
import {Router} from '@angular/router';
import {NotificationService} from '../../shared/services/notification.service';
import {RhisTranslateService} from '../../shared/services/rhis-translate.service';
import {AutorisationService} from '../../shared/services/autorisation.service';
import {RapportStateService} from '../../shared/services/rapport-state.service';
import {GlobalSettingsService} from '../../shared/services/global-settings.service';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {MyrhisIdleSerice} from '../../shared/services/myrhis.idle.serice';
import {ShiftJsStoreService} from '../../shared/services/JsStoreServices/shiftJsStore.service';
import {LanguageStorageService} from '../../shared/services/language-storage.service';
import {RestaurantDataService} from '../../shared/services/restaurant-data.service';
import {DateService} from '../../shared/services/date.service';
import * as moment from 'moment';
import {ConfirmationService} from 'primeng/api';
import {SynchronisationService} from '../../shared/services/synchronisation.service';
import {OnlineService} from '../../health/online.service';
import {MenuStatusService} from "../../shared/services/menu-status.service";
import {ParameterJsStoreService} from "../../shared/services/JsStoreServices/parameter-js-store.service";
import {UserPermissionPipe} from "../../shared/Pipes/user-permission.pipe";
import {DroitPointeuseEnum} from "../../shared/model/enumeration/droit-pointeuse.enum";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public isManagerMenu: boolean;
  showFiller = false;

  public isTechnicienMenu: boolean;
  public canModifie: boolean;
  public canAssociate: boolean;
  public menu: any[];
  public menuState = false;
  public popupSynchronisation = false;
  public popUpStyle = {
    width: 400,
    height: 700
  };
  public dateJournee = this.dateService.getCorrectDateJournee();
  public isPretActive = false;
  private readonly paramPretName = 'PRET_SALARIE';
  public syncForm = new UntypedFormGroup(
    {
      syncPointages: new UntypedFormControl(true),
      dateJournee: new UntypedFormControl(new Date(this.dateService.getCorrectDateJournee().setDate(this.dateService.getCorrectDateJournee().getDate() - 3))),
      syncPret: new UntypedFormControl(true),
      syncEmployes: new UntypedFormControl(true),
      syncPlanning: new UntypedFormControl(true),
      syncParam: new UntypedFormControl(true)
    }
  );
  public syncEnCours = false;
  public value = 0;
  public firstDayAsInteger = 0;
  public calendarFr: any;
  public maxDate = this.dateService.getCorrectDateJournee();
  public scrHeight: any;
  public scrWidth: any;
  public sizeScreenSmall: any;
  private dbname = 'data_base_pointeuse';
  private menuManager = [
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-2.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-2.png',
      title: 'MENU.EMPLOYES',
      id: 'employees',
      routerLink: this.pointeuseRouter.getRoute('EMPLOYES'),
      clicked: false
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-3.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-3.png',
      title: 'MENU.AUTORISATION',
      id: 'Autorisation',
      clicked: false,
      methodName: 'autoriser'
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-4.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-4.png',
      title: 'MENU.RAPPORT',
      id: 'Rapport',
      clicked: false,
      methodName: 'listRapportDisplay'
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-5.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-5.png',
      title: 'MENU.MESSAGE',
      id: 'Message',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('HISOTRIQUE')
    },
    {
      imageClicked: this.sessionService.getPointeuseState() ? 'assets/icons/menu/icon__manager-active-6.png'
        : 'assets/icons/menu/icon__manager-6.png',
      imageNoClicked: this.sessionService.getPointeuseState() ? 'assets/icons/menu/icon__manager-active-6.png'
        : 'assets/icons/menu/icon__manager-6.png',
      title: this.sessionService.getPointeuseState() ? 'MENU.BLOQUER' : 'MENU.DEBLOQUER',
      id: 'verrouillage',
      clicked: !this.sessionService.getPointeuseState(),
      methodName: 'blockUnblock'
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-7.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-7.png',
      title: 'MENU.SYNCHRO',
      id: 'Synchronisation',
      clicked: false,
      methodName: 'showPopupSynchronisation'
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-8.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-active-8.png',
      title: 'MENU.QUITTER',
      id: 'Quitter',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('LIVE'),
      methodName: 'quitPointage'
    }
  ];
  private menuEmployee = [
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-1.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-1.png',
      title: 'MENU.PLANNING',
      id: 'Planning',
      clicked: true,
      routerLink: this.pointeuseRouter.getRoute('PLANNINGS')
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-5.png',
      imageNoClicked: 'assets/icons/menu/icon__employee-2.png',
      title: 'MENU.MESSAGE',
      id: 'Message',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('HISOTRIQUE')
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-8.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-active-8.png',
      title: 'MENU.QUITTER',
      id: 'Quitter',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('LIVE')
    },
  ];
  private menuTech = [
    {
      imageClicked: 'assets/icons/menu/association.png',
      imageNoClicked: 'assets/icons/menu/assoctaionNotClicked.png',
      title: 'MENU.ASSOCIATION',
      id: 'Association',
      clicked: true,
      routerLink: this.pointeuseRouter.getRoute('ASSOCIATION')
    },
    {
      imageClicked: 'assets/icons/menu/setting-technicien-active.png',
      imageNoClicked: 'assets/icons/menu/setting-technicien.png',
      title: 'MENU.CONFIGURATION',
      id: 'Configuration',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('PARAMETRE')
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-8.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-active-8.png',
      title: 'MENU.QUITTER',
      id: 'Quitter',
      clicked: true,
      routerLink: this.pointeuseRouter.getRoute('LIVE')
    },
  ];
  private menuAssociation = [
    {
      imageClicked: 'assets/icons/menu/association.png',
      imageNoClicked: 'assets/icons/menu/assoctaionNotClicked.png',
      title: 'MENU.ASSOCIATION',
      id: 'Association',
      clicked: true,
      routerLink: this.pointeuseRouter.getRoute('ASSOCIATION')
    },
    {
      imageClicked: 'assets/icons/menu/setting-technicien-active.png',
      imageNoClicked: 'assets/icons/menu/setting-technicien.png',
      title: 'MENU.CONFIGURATION',
      id: 'Configuration',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('PARAMETRE')
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-8.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-active-8.png',
      title: 'MENU.QUITTER',
      id: 'Quitter',
      clicked: true,
      routerLink: this.pointeuseRouter.getRoute('LIVE')
    },
  ];
  private menuConfig = [
    {
      imageClicked: 'assets/icons/menu/setting-technicien-active.png',
      imageNoClicked: 'assets/icons/menu/setting-technicien.png',
      title: 'MENU.CONFIGURATION',
      id: 'Configuration',
      clicked: false,
      routerLink: this.pointeuseRouter.getRoute('PARAMETRE')
    },
    {
      imageClicked: 'assets/icons/menu/icon__manager-active-8.png',
      imageNoClicked: 'assets/icons/menu/icon__manager-active-8.png',
      title: 'MENU.QUITTER',
      id: 'Quitter',
      clicked: true,
      routerLink: this.pointeuseRouter.getRoute('LIVE')
    },
  ];
  private readonly menuQuitter = {
    imageClicked: 'assets/icons/menu/icon__manager-active-8.png',
    imageNoClicked: 'assets/icons/menu/icon__manager-active-8.png',
    title: 'MENU.QUITTER',
    id: 'Quitter',
    clicked: false,
    routerLink: this.pointeuseRouter.getRoute('LIVE'),
    methodName: 'quitPointage'
  };
  private readonly menuPlanning = {
    imageClicked: 'assets/icons/menu/icon__manager-active-1.png',
    imageNoClicked: 'assets/icons/menu/icon__manager-1.png',
    title: 'MENU.PLANNING',
    id: 'Planning',
    clicked: true,
    routerLink: this.pointeuseRouter.getRoute('PLANNINGS')
  };
  private readonly menuMessage = {
    imageClicked: 'assets/icons/menu/icon__manager-active-5.png',
    imageNoClicked: 'assets/icons/menu/icon__employee-2.png',
    title: 'MENU.MESSAGE',
    id: 'Message',
    clicked: false,
    routerLink: this.pointeuseRouter.getRoute('HISOTRIQUE')
  };

  constructor(private blockUblockPointeuseService: BlockUblockPointeuseService,
              private sessionService: SessionService,
              private macPointeuseService: MacPointeuseService,
              private restaurantService: RestaurantService,
              private pointeuseRouter: PointeuseRoutingService,
              private autorisationPointageService: AutorisationPointageService,
              private router: Router,
              private notificationService: NotificationService,
              private rhisTranslateService: RhisTranslateService,
              private autorisationService: AutorisationService,
              private rapportStateService: RapportStateService,
              private globalSettings: GlobalSettingsService,
              private myrhisIdleSerice: MyrhisIdleSerice,
              private shiftJsStoreService: ShiftJsStoreService,
              private langueStorageService: LanguageStorageService,
              private restaurantDataService: RestaurantDataService,
              private dateService: DateService,
              private confirmationService: ConfirmationService,
              private synchronisationService: SynchronisationService,
              public onlineService: OnlineService,
              public menuStatusService: MenuStatusService,
              private parameterJsStoreService: ParameterJsStoreService,
              private droitAccesPointeuse: UserPermissionPipe
  ) {
  }

 async ngOnInit() {
    const paramList = await this.parameterJsStoreService.getParamatreByParam(this.paramPretName);
    this.isPretActive = paramList[0].valeur === 'true';
    this.dateJournee.setSeconds(0);
    this.dateJournee.setMilliseconds(0);
    this.dateJournee = new Date(this.dateJournee.setDate(this.dateJournee.getDate() - 1));
    this.isManagerMenu = this.sessionService.getIsManager();
    this.isTechnicienMenu = this.sessionService.getIsTechnicien();
    this.canAssociate = this.sessionService.getDroitAssociation();
    this.canModifie = this.sessionService.getDroitModification();
   this.sessionService.setSyncPointageProgress(null);
   this.sessionService.setSyncCorrectionsProgress(null);
   this.sessionService.setSyncParamProgress(null);
   this.sessionService.setSyncPretsProgress(null);
   this.sessionService.setSyncEmployesProgress(null);
   this.sessionService.setSyncPlanningProgress(null);
    this.setCalendar();
    this.initializeMenu();
    if (!this.isTechnicienMenu && !this.isManagerMenu) {
      this.menu = this.setItemToMenu(this.menuManager);
      this.menu.splice(0,0, this.menuPlanning);
      this.menu.splice(1,0, this.menuMessage);
      this.menu.push(this.menuQuitter);
    } else if (this.isManagerMenu) {
      this.menu.splice(0,0, this.menuPlanning);
    }
    this.getScreenSize();
    this.menuStatusService.menuStateTabletteStatus().subscribe(menuState => {
      this.menuState = menuState;
    });
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.sizeScreenSmall = this.scrWidth <= 991;
  }

  public executeMethode(col: any) {
    if (this[col.methodName]) {
      this[col.methodName]();
    }
  }

  /**
   * permet de changer l'etat du pointeuse entre bloqué/debloqué
   */
  public blockUnblock(): void {
    this.sessionService.getPointeuseState() ?
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('POINTEUSE.BLOCK')) :
      this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('POINTEUSE.UNBLOCK'));
    this.sessionService.setPointeuseState(!this.sessionService.getPointeuseState());

    this.menuManager.forEach((menu: any) => {
      if (menu.methodName === 'blockUnblock') {
        menu.title = this.sessionService.getPointeuseState() ? 'MENU.BLOQUER' : 'MENU.DEBLOQUER';
        menu.imageClicked = this.sessionService.getPointeuseState() ? 'assets/icons/menu/icon__manager-active-6.png'
          : 'assets/icons/menu/icon__manager-6.png';
      }
    });
  }

  /**
   * Add class when item is clicked
   */
  public async clickItem(event, index: number, col): Promise<any> {
    this.menu.forEach((item: any) => {
      item.clicked = false;
    });
    this.menu[index].clicked = true;
    if (col.id.toLowerCase() === DroitPointeuseEnum.QUITTER && this.isManagerMenu || col.id.toLowerCase() === DroitPointeuseEnum.AUTORISATION && (!this.isManagerMenu && !this.isTechnicienMenu) || col.id.toLowerCase() === DroitPointeuseEnum.RAPPORT && this.isTechnicienMenu) {
      await this.quitPointage();
      window.location.reload()
    }
    if (col.id.toLowerCase() === DroitPointeuseEnum.AUTORISATION) {
      await this.autoriser();
      window.location.reload();
    }
    if (col.id.toLowerCase() === DroitPointeuseEnum.RAPPORT ) {
      this.listRapportDisplay();
    }
    if (col.id.toLowerCase() === DroitPointeuseEnum.VERROUILLAGE ) {
      this.blockUnblock();
    }
    if (col.id.toLowerCase() === DroitPointeuseEnum.SYNCHRONISATION ) {
      this.showPopupSynchronisation();
    }
  }

  public quitPointage(): void {
    this.sessionService.setIsTechnicien(false);
    this.sessionService.isConnected = false;
    this.sessionService.setEmploye(0);
    this.sessionService.setIsManager(false);
    this.sessionService.setBadge('0');
    this.sessionService.setEmployeFullName('');
  }

  public autoriser(): void {
    this.autorisationPointageService.setState(true);
    this.sessionService.setAutorisation(true);
    this.autorisationService.setUserAuthorized(true);
    this.router.navigateByUrl('');
    this.quitPointage();
  }

  /**
   * get rapport state and redirect to rapport Link
   */
  public listRapportDisplay(): void {
    this.router.navigateByUrl('rapports');
    this.rapportStateService.setRapportState();
  }

  /**
   * afficher le popup de synchronisation
   * @param anomalie
   */
  public showPopupSynchronisation(): void {
    this.popupSynchronisation = true;
    this.syncForm.setValue({
      syncPointages: new UntypedFormControl(true),
      syncPret: new UntypedFormControl(true),
      syncEmployes: new UntypedFormControl(true),
      syncPlanning: new UntypedFormControl(true),
      syncParam: new UntypedFormControl(true)
    });
  }

  /**
   * fermer le popup de synchronisation
   */
  public closePopup(): void {
    this.popupSynchronisation = false;
    this.syncEnCours = false;
  }

  public async syncAndDeassociate(): Promise<void> {
    await this.synchronisationService.synchroniseRegulary(true, this.sessionService.getDateJournee(), 1);
    await this.restaurantService.deletePointeuseRestaurantAssociation(this.sessionService.getCodeRestaurant()).toPromise();
    localStorage.clear();
    indexedDB.deleteDatabase(this.dbname);
    indexedDB.deleteDatabase('KeyStore');
    this.router.navigateByUrl('/connection-technecien');
  }

  public async synchroniseProceed(): Promise<void> {

    this.myrhisIdleSerice.stopIdle();

    let syncValues = [];
    this.value = 0;
    this.syncEnCours = !!(this.syncForm.value['syncEmployes'] || this.syncForm.value['syncParam'] || this.syncForm.value['syncPointages'] || this.syncForm.value['syncPlanning'] || this.syncForm.value['syncPret']);
    if (this.syncForm.value['syncEmployes']) {
      await this.restaurantDataService.getEmployeeActifAndSaveToLocalBase(+this.sessionService.getIdRestaurant());
    }
    if (this.syncForm.value['syncPlanning']) {
      await this.restaurantDataService.getShiftAndSaveToLocalBase(+this.sessionService.getIdRestaurant());
    }
    if (this.syncForm.value['syncPret'] && this.isPretActive) {
      await this.restaurantDataService.getEmployePreteActifAndShiftAndPointage(+this.sessionService.getIdRestaurant());
    }
    let languageHasChanged = false;
    if (this.syncForm.value['syncParam']) {
      const currentVocalLang = this.langueStorageService.getVocalLanguageSettings().toLowerCase();
      const currentDisplayLang = this.langueStorageService.getDisplayLanguageSettings().toLowerCase();
      await this.restaurantDataService.getParametreList(+this.sessionService.getIdRestaurant());
      if (this.langueStorageService.getDisplayLanguageSettings().toLowerCase() !== currentDisplayLang ||
        this.langueStorageService.getVocalLanguageSettings().toLowerCase() !== currentVocalLang) {
        languageHasChanged = true;
      }
    }


    this.shiftJsStoreService.setSynchronisedListShift(true);

    syncValues.push({
      'syncEnCours': this.syncForm.value['syncEmployes'],
      'syncResult': this.sessionService.getSyncEmployesProgress(),
      'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.EMPLOYE_PROGRESS')
    });
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
    if (this.isPretActive) {
      syncValues.push({
        'syncEnCours': this.syncForm.value['syncPret'],
        'syncResult': this.sessionService.getSyncPretsProgress(),
        'syncText': this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PRET_PROGRESS')
      });
    }


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
          this.sessionService.setSyncEmployesProgress(null);
          this.sessionService.setSyncPretsProgress(null);
          this.sessionService.setSyncPlanningProgress(null);
          await this.myrhisIdleSerice.startIdle();
          // if (languageHasChanged) {
          //   window.location.reload();
          // }
        }
      }, 2000);
    }
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
          await this.synchronisationService.synchroniseRegulary(this.syncForm.value['syncPointages'], this.dateService.dateToShortForm(dateChoisit), 1);
          await this.synchroniseProceed();
          this.dateJournee = new Date(this.dateService.getCorrectDateJournee().setDate(this.dateService.getCorrectDateJournee().getDate() - 1));
          this.sessionService.setLastSync( (new Date()).toLocaleString());
          this.sessionService.setLastSyncType(1);
          },
        reject: () => {
        }
      });
    } else {
      this.sessionService.setLastSync( (new Date()).toLocaleString());
      this.sessionService.setLastSyncType(1);
      await this.synchroniseProceed();
    }
  }

  /**
   * Detect if which menu will be oppened manager menu or employee menu
   */
  private initializeMenu(): void {
    if (this.isTechnicienMenu) {
      this.menu = this.menuTech;
      this.setmenu();
      return;
    }
    if (this.isManagerMenu) {
      this.menu = this.menuManager;
      return;
    } else {
      this.menu = this.menuEmployee;
    }
  }

  private setItemToMenu(menu: any): any {
    return menu.filter(item => this.droitAccesPointeuse.transform(this.sessionService.getpersonalizedAccess(), item.id, this.isManagerMenu));
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

  private setmenu() {
    if (this.canAssociate && this.canModifie) {
      this.menu = this.menuTech;
      this.globalSettings.toggleMenu(true);
    } else if (this.canAssociate) {
      this.menu = this.menuAssociation;
      this.globalSettings.toggleMenu(true);
    } else if (this.canModifie) {
      this.globalSettings.toggleMenu(true);
      this.menu = this.menuConfig;
    }
  }

  menuStateTabletteStatus() {
    this.menuState = !this.menuState;
  }
}
