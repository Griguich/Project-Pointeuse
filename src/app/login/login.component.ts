import {AfterViewInit, Component} from '@angular/core';
import {RestaurantService} from '../shared/services/restaurant.service';
import {Router} from '@angular/router';
import {PointingService} from '../modules/pointage/service/pointing.service';
import {SessionService} from '../shared/services/session.service';
import {InfoRestaurantJsStoreService} from '../shared/services/JsStoreServices/infoRestaurantJsStore.service';
import {MessageService} from '../modules/messages/service/message.service';
import {ShiftJsStoreService} from '../shared/services/JsStoreServices/shiftJsStore.service';
import {DecoupageHoraireJsStoreService} from '../shared/services/JsStoreServices/decoupageHoraireJsStore.service';
import {EmployeJsStoreService} from '../modules/employes/service/employeJsStore.service';
import {MessageJsStoreService} from '../modules/messages/service/messageJsStore.service';
import {RestaurantModel} from '../shared/model/restaurant.model';
import {PlanningJsStoreService} from '../modules/plannings/services/planningJsStore.service';
import {PlanningService} from '../modules/plannings/services/planning.service';
import Keyboard from 'simple-keyboard';
import {RhisTranslateService} from '../shared/services/rhis-translate.service';
import {RestaurantDataService} from '../shared/services/restaurant-data.service';
import {MacPointeuseService} from '../shared/services/mac-pointeuse.service';
import {ConfirmationService} from 'primeng/api';
import {NotificationService} from '../shared/services/notification.service';
import {HealthCheckService} from '../health/health-check.service';
import {PathService} from '../shared/services/path.service';
import {AnomalieModel} from '../shared/model/anomalie.model';
import {DateService} from '../shared/services/date.service';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import * as moment from 'moment';
import {MyrhisIdleSerice} from '../shared/services/myrhis.idle.serice';
import {RapportStateService} from '../shared/services/rapport-state.service';
import {GlobalSettingsService} from '../shared/services/global-settings.service';
import {LanguageStorageService} from '../shared/services/language-storage.service';
import {SynchronisationService} from '../shared/services/synchronisation.service';
import {OnlineService} from '../health/online.service';
import {ServiceStatus} from '../shared/model/serviceGUI';
import {HttpClient} from '@angular/common/http';
import {ShiftModel} from '../shared/model/shift.model';
import { WebSocketSubject, webSocket } from 'rxjs/internal-compatibility';
import { Subscription } from 'rxjs';

import { WebSocketService } from './WebSocket.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  private socket$: WebSocketSubject<any>;
  public employees: any[] = [];
  pointages: any[];
  public isAssocieted = false;
  rxStompService: any;
  webSocket: WebSocketSubject<any>;
  constructor(
    private http: HttpClient,
    public restaurantService: RestaurantService,
    public router: Router,
    public pointingService: PointingService,
    public sessionService: SessionService,
    private messageService: MessageService,
    private shiftJsStoreService: ShiftJsStoreService,
    private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService,
    private employeJsStoreService: EmployeJsStoreService,
    private infoRestaurantJsStoreService: InfoRestaurantJsStoreService,
    private messageJsStoreService: MessageJsStoreService,
    private planningJsStoreService: PlanningJsStoreService,
    private planningService: PlanningService,
    private rhisTranslateService: RhisTranslateService,
    private macPointeuse: MacPointeuseService,
    private macPointeuseService: MacPointeuseService,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService,
    private healthCheckService: HealthCheckService,
    private myrhisIdleSerice: MyrhisIdleSerice,
    private rapportStateService: RapportStateService,
    private globalSettings: GlobalSettingsService,
    private langueStorageService: LanguageStorageService,
    private restaurantDataService: RestaurantDataService,
    private dateService: DateService,
    private synchronisationService: SynchronisationService,
    public onlineService: OnlineService,
    public pathService: PathService,
    public webSocketService: WebSocketService,
    
  ) {
    
    
    if (this.sessionService.getIsTechnicien()) {
      this.codeRestaurant = this.sessionService.getCodeRestaurant();
      console.log(this.codeRestaurant)
    }
    this.isFirstTimeAssociation = this.codeRestaurant == 'ée';
    this.sessionService.setIsFirstTime(this.isFirstTimeAssociation);
    this.getlistDroit(this.sessionService.getManagerEmail());
    this.getRestaurentslist(this.sessionService.getManagerEmail());
    if (this.sessionService.getDroitAssociation() && this.sessionService.getDroitModification) {
      return;
    }

    if (this.sessionService.getDroitModification()) {
      this.router.navigateByUrl('/parametres');
    }
    if (this.sessionService.getDroitAssociation()) {
      this.router.navigateByUrl('/association');
    }

    // this.getMac();
    navigator.onLine === true ? this.networkMode = 'online' : this.networkMode = 'offline';
  }
  public popupSynchronisation = false;

  public popUpStyle = {
    width: 400,
    height: 700
  };

  public syncForm = new UntypedFormGroup(
    {
      syncPointages: new UntypedFormControl(true),
      dateJournee: new UntypedFormControl(),
      syncCorrections: new UntypedFormControl(true),
      syncEmployes: new UntypedFormControl(true),
      syncPlanning: new UntypedFormControl(true),
      syncParam: new UntypedFormControl(true)
    }
  );
  showOverlay = false;
  totalPoint: number = 0;
  totalEmpPointed: number = 0;
  totalEMP: number = 0;
  totalDurationPlanned: number = 0;
  public syncEnCours = false;
  public value = 0;
  public dateJournee = this.dateService.getCorrectDateJournee();
  public firstDayAsInteger = 0;
  public calendarFr: any;
  public maxDate = this.dateService.getCorrectDateJournee();
  title = 'myrhis-pointeuse-web';
  networkMode = 'online';
  public codeRestaurant: string;
  public displayClavier = false;
  public textInputValue = '';
  public clicked = false;
  public isMobile: boolean;
  SelectedRestaurant: any;
  public listRestaurant: RestaurantModel[];
  public selectedResto: RestaurantModel;
  public selectedRestaurant: any;
  displaySpinner: any;
  currentRestoLibelle: any;
  public rest: any;
  public isLoading: boolean;
  public permissions = [
    {permission: 1, name: 'afficher'},
    {permission: 2, name: 'detailler'},
    {permission: 4, name: 'ajouter'},
    {permission: 8, name: 'supprimer'},
    {permission: 16, name: 'modifier'},
    {permission: 32, name: 'bloquer/débloquer'}
  ];
  public showParams = false;
  public AssociationPage = false;
  firstassoc: any;
  display = false;
  displayModal: any;
  private idRestaurant: number;
  private keyboard: Keyboard;
  private keyBoardInput: string;
  // variable temporaire pour affecter l'adresse mac
  private mac: string;
  private listDroits: any;
  private modifier = false;
  private associer: boolean;
  public isFirstTimeAssociation: boolean;
  private dbname = 'data_base_pointeuse';
  public getlastSync;
  public volumeDefault = 50;
  public isDropdownOpen = false;
  employeesWithPointages: any[] = [];
  ngOnInit() {
   
      this.webSocketService.connect() ;
      
    this.dateJournee.setSeconds(0);
    this.dateJournee.setMilliseconds(0);
    this.dateJournee = new Date(this.dateJournee.setDate(this.dateJournee.getDate() - 1));
    this.getlastSync = moment(this.sessionService.getLastSync(), 'DD-MM-YYYY HH:mm').toDate();
    this.setCalendar();
   if (!this.sessionService.getVolume()) {
      this.volume = this.volumeDefault;
    } else {
      this.volume = this.sessionService.getVolume();
    }
  }
  getDebutJournee = this.sessionService.getDebutJournee();
  public totalHours: number;

  sendMessage(): void {
    // Get variables from local storage
    const totalPoint = localStorage.getItem('_totalPoint');
    const totalEmpPointed = localStorage.getItem('_totalEmpPointed');
    const totalEMP = localStorage.getItem('_totalEMP');
    const totalDurationPlanned = localStorage.getItem('_totalDurationPlanned');
  
    if (totalPoint && totalEmpPointed && totalEMP && totalDurationPlanned) {
      // Construct JSON payload
      const payload = {
        totalPoint,
        totalEmpPointed,
        totalEMP,
        totalDurationPlanned
      };
  
      // Send JSON payload to WebSocket server
      this.webSocket.next(JSON.stringify(payload));
  
      console.log('Sent variables to server:', payload);
    } else {
      console.error('Variables not found in local storage');
    }
  }
  
  display_data() {
    this.webSocketService.display_data();
  }

  display_corection(){
    this.webSocketService.display_correction_pointage();
  }

  block(){
    this.webSocketService.blockUnblock();
    console.log("block/unblock");
  }
  
  // tslint:disable-next-line:use-lifecycle-interface
  public verifybuttondisabled= true;
  get  imageSource(): string {
    // tslint:disable-next-line:triple-equals
    if (this.volume <= 20) {
      return 'pi pi-volume-off';
    }
    if (this.volume > 20 && this.volume <= 60) {
      return 'pi pi-volume-down';
    }
    if (this.volume > 60) {
      return 'pi pi-volume-up';
    }
    
    
  }
  
  

  currentResto() {
 return  this.sessionService.getRestaurantName() !== undefined ?  '  ' : this.sessionService.getRestaurantName();
  }

  getFinJournee= this.sessionService.getFinJournee()


  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
    });
  }

  public permissionConverter(permission) {
    let n = +parseInt(permission, 10).toString(2);

    const ListPermissions = ([]);
    let decimal = 0;
    let p = 0;
    while ((n !== 0)) {
      {
        // tslint:disable-next-line:no-bitwise
        decimal = (Math.round((n % 10) * Math.pow(2, p)) | 0);

        ListPermissions.push(decimal);
        n = (n / 10 | 0);
        p++;
      }
    }


    return ListPermissions;
  }

  /**
   * display keyboard when input is clicked
   */
  public displayClavierMessage() {
    this.displayClavier = !this.displayClavier;
  }

  /**
   * recuperer restaurant par code restaurant
   */

  public async verifyRestaurant(): Promise<void> {
    this.displaySpinner = true;
    this.isAssocieted = await this.restaurantService.isRestaurantAssocitedToAnotherPointeuse(this.codeRestaurant).toPromise();
    if (this.isAssocieted) {
      this.displaySpinner = false;
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.ASSOCIATE_RESTAURANT'),
        header: this.rhisTranslateService.translate('POPUPS.ASSOCIATE_RESTAURANT_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.COMPRIS_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.ANNULER'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.displaySpinner = false;
        },

      });
    } else {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POP_UP_CONFIRMATION_ASSOCTAION_1') + this.currentRestoLibelle +
          this.rhisTranslateService.translate('POP_UP_CONFIRMATION_ASSOCTAION_2'),
        header: this.rhisTranslateService.translate('POPUPS.ASSOCIATE_RESTAURANT_HEADER'),
        acceptLabel: this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.CONFIRM_BUTTON'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.ANNULER'),
        icon: 'pi pi-info-circle',
        accept: () => {
          this.synchro();
          this.getRestaurantByCodePointeuse();
        },
        reject: () => {
          this.displaySpinner = false;

        }
      });

    }
  }

  public setIsAssociatedToFalse(idRestaurant: number): any {
    this.restaurantService.changeStatusRestaurant(idRestaurant).subscribe(value1 => console.log(value1));
  }

  public synchro() {
    this.synchronisationService.synchroniseRegulary(true, this.sessionService.getDateJournee(), 1);
    this.sessionService.setLastSync( (new Date()).toLocaleString());
    this.sessionService.setLastSyncType(1);
  }

  public async getRestaurantByCodePointeuse(): Promise<void> {
    await this.setIsAssociatedToFalse(+this.sessionService.getIdRestaurant());
    this.displaySpinner = true;
    this.displayModal=false
    this.restaurantService.getRestauratByCodePointeuse(this.codeRestaurant).subscribe(async (restaurant: RestaurantModel) => {
      if (restaurant && restaurant.idRestaurant) {
        restaurant.idFront = this.makeString();
        this.idRestaurant = restaurant.idRestaurant;
        this.infoRestaurantJsStoreService.addRestaurant(restaurant);
        this.pointingService.restaurant = restaurant;
        const dateNow = this.dateService.dateToShortForm(new Date())
        await this.changePointeuse_association_date(dateNow, restaurant.uuid).subscribe();
        await this.restaurantDataService.getInfoToPointeuse(restaurant.idRestaurant);
        this.sessionService.setIdRestaurant(restaurant.idRestaurant);
        this.sessionService.setCodeRestaurant(this.codeRestaurant);
        this.sessionService.setRestaurantName(restaurant.libelle);
        this.sessionService.setPointeuseState(true);
        this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('POINTEUSE.ASSOCIETED'));
        const idTimeout = setTimeout(async () => {
          if (!this.sessionService.getIsTechnicien()) {
            this.displaySpinner = false;
          }
          (await this.ConfirmAssociation(this.codeRestaurant)) ? console.log('confirmed association') : console.log('denied association');
          this.sessionService.setLastSync( (new Date()).toLocaleString());
          this.sessionService.setEmploye(0);
          clearTimeout(idTimeout);
          window.location.href = '/';
        }, 2000);
      }
    }, err => {
      this.notificationService.showErrorMessage(this.rhisTranslateService.translate('POINTEUSE.ASSOCIATION_ERROR'));
      this.clicked = false;
      this.displaySpinner = false;
      console.log(err);
    });

  }

  public async getRestaurentslist(email: string): Promise<any> {
    const restos: any = await this.restaurantService.getRestaurants(email).toPromise();
    this.listRestaurant = restos;
  }

  public async getlistDroit(email: string): Promise<any> {
    const list: number[] = this.permissionConverter(await this.restaurantService.getListDroitForUser(email).toPromise());
    // check if user has modification access
    if (list.indexOf(16) !== -1) {
      this.modifier = true;
      this.showParams = true;
      this.AssociationPage = false;
      console.log('user can modifie');
      this.sessionService.setDroitModification(true);
    } else {
      console.log('user can not  modifie');
      this.sessionService.setDroitModification(false);

    }
    // check if user has associate access
    if (list.indexOf(4) !== -1) {
      this.associer = true;
      this.showParams = false;
      this.AssociationPage = true;
      console.log('user can associate');
      this.sessionService.setDroitAssociation(true);

    } else {
      console.log('user can not  associate');
      this.sessionService.setDroitAssociation(false);
    }
    // check if user has all access
    if (this.modifier && this.associer) {
      this.associer = true;
      this.showParams = true;
      this.AssociationPage = true;
      console.log('user can do it all');
    } else {
      console.log('user can do   nothing');
    }


  }

  setcodeResto() {
    const SelectedRestaurant = this.selectedRestaurant as RestaurantModel;
    this.codeRestaurant = SelectedRestaurant.codePointeuse;
    this.currentRestoLibelle = SelectedRestaurant.libelle;
    this.verifybuttondisabled = false;


  }

  public showPopupSynchronisation(): void {
    this.popupSynchronisation = true;
    this.syncForm.setValue({
      syncPointages: true,
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
    this.displayModal = false;
  }

  public async synchroniseProceed(): Promise<void> {
    this.myrhisIdleSerice.stopIdle();
    let syncValues = [];
    this.value = 0;
    // tslint:disable-next-line:max-line-length
    this.syncEnCours = !!(this.syncForm.value.syncEmployes || this.syncForm.value.syncParam || this.syncForm.value.syncPointages || this.syncForm.value.syncPlanning);
    if (this.syncForm.value.syncEmployes) {
      await this.restaurantDataService.getEmployeeActifAndSaveToLocalBase(+this.sessionService.getIdRestaurant());
    }
    if (this.syncForm.value.syncPlanning) {
      await this.restaurantDataService.getShiftAndSaveToLocalBase(+this.sessionService.getIdRestaurant());
    }
    let languageHasChanged = false;
    if (this.syncForm.value.syncParam) {
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
      syncEnCours: this.syncForm.value.syncEmployes,
      syncResult: this.sessionService.getSyncEmployesProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.EMPLOYE_PROGRESS')
    });
    syncValues.push({
      syncEnCours: this.syncForm.value.syncParam,
      syncResult: this.sessionService.getSyncParamProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PARAM_PROGRESS')
    });
    syncValues.push({
      syncEnCours: this.syncForm.value.syncPointages,
      syncResult: this.sessionService.getSyncPointageProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.POINTAGE_PROGRESS')
    });
    syncValues.push({
      syncEnCours: this.syncForm.value.syncPlanning,
      syncResult: this.sessionService.getSyncPlanningProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PLANNING_PROGRESS')
    });

    syncValues = syncValues.filter((syncValue: any) => syncValue.syncEnCours);
    if (this.syncEnCours) {
      let i = 0;
      const interval = setInterval(async () => {
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
          this.sessionService.setSyncPlanningProgress(null);
          await this.myrhisIdleSerice.startIdle();
          if (languageHasChanged) {
            window.location.reload();
          }
        }
      }, 2000);
    }
  }

  public async synchronize(): Promise<void> {
    const dateChoisit: Date = this.dateService.getCorrectDateJournee(this.syncForm.value.dateJournee);
    if (this.syncForm.value.syncPointages) {
      this.confirmationService.confirm({
        message: this.rhisTranslateService.translate('POPUPS.SYNCHRONIZE_POINTING_MESSAGE_PART1') + ' '
          + this.dateService.dateToLongForm(dateChoisit)
          + ' ' + this.rhisTranslateService.translate('POPUPS.SYNCHRONIZE_POINTING_MESSAGE_PART2'),
        header: this.rhisTranslateService.translate('POPUPS.SYNCHRONIZE_POINTING_TITLE'),
        acceptLabel: this.rhisTranslateService.translate('POPUPS.COMPRIS_LABEL'),
        rejectLabel: this.rhisTranslateService.translate('POPUPS.ANNULER'),
        icon: 'pi pi-info-circle',
        accept: async () => {
          await this.synchronisationService.onSendPointing(this.syncForm.value.syncPointages,
            moment(dateChoisit).format('YYYY-MM-DD'), 1);
          this.sessionService.setLastSyncType(1)
          await this.synchroniseProceed();
        },
        reject: () => {
        }
      });
    } else {
      await this.synchroniseProceed();
    }
  }

  downloadTextFile() {
    const text = this.sessionService.getRestaurantName();
    const data = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', data);
    downloadAnchorNode.setAttribute('download', 'InfoRestaurant.txt');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  downloadFile() {
    this.restaurantService.downloadInstallationFiles().subscribe();
  }


  public async syncAndDeassociate(): Promise<void> {
    const T120 = this.sessionService.getBearerTokenForV2();
    const email = this.sessionService.getManagerEmail();
    this.displaySpinner = true;
    await this.pointingService.deleteAllPointageWithoutHeureFin(this.sessionService.getDateJournee());
    await this.synchronisationService.synchroniseRegulary(true, this.sessionService.getDateJournee(), 1);
    let res=  this.restaurantService.deletePointeuseRestaurantAssociation(this.sessionService.getCodeRestaurant()).subscribe();
    if (res){
      localStorage.clear();
      indexedDB.deleteDatabase(this.dbname);
      indexedDB.deleteDatabase('KeyStore');
      this.displaySpinner = false;
      this.isDeassociated = true;
    }
    this.sessionService.setIsTechnicien(true);
    this.codeRestaurant = 'ée';
    this.sessionService.setIsFirstTime(true);
    this.sessionService.setBearerToken(T120);
    this.sessionService.setManagerEmail(email);
    this.router.navigateByUrl('code');

  }

  showModalDialog() {
    this.displayModal = true;
  }

  public async deleteAssociation(): Promise<void> {
    const msg = this.rhisTranslateService.translate('MSG_DISSOCIER') + "<br><br>" + "<b>" + this.rhisTranslateService.translate('MENU.supp_pointage') +"</b>";
    this.confirmationService.confirm({
      message: msg,
      header: this.rhisTranslateService.translate('POPUPS.ASSOCIATE_RESTAURANT_HEADER'),
      acceptLabel: this.rhisTranslateService.translate('PLANNING_PAGE_PRINCIPALE.CONFIRM_BUTTON'),
      rejectLabel: this.rhisTranslateService.translate('POPUPS.ANNULER'),
      icon: 'pi pi-info-circle',
      accept: async () => {
        await this.syncAndDeassociate();
        this.sessionService.setIsFirstTime(true);
        this.router.navigateByUrl('code');
      },
      reject: () => {
      }
    });


  }

  private getMac(): void {
    const sub = this.macPointeuse.getMacPointeuse().subscribe(() => {
      sub.unsubscribe();
    }, error => {
      if (error.status === 200) {
        this.mac = error.error.text;
      } else {
        this.mac = this.restaurantDataService.makeString();
      }
      sub.unsubscribe();
    });

  }

  /**
   * Permet de creer un string de 32 char utilise comme identifiant unique
   */
  private makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }

  /************************************** clavier virtuel ****************************/
  private onChange = (input: string) => {
    this.textInputValue = input;
  }

  /**
   * pour activer et désactiver le majuscule avec le shit ou capslock
   */
  private onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') {
      this.handleShift();
    }
  }

  private handleShift = () => {
    const currentLayout = this.keyboard.options.layoutName;
    const shiftToggle = currentLayout === 'default' ? 'shift' : 'default';
    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  }
  isDeassociated: any;
  totalPointingHours: any;
  totalemploye: any;
  volume: any;
  totalDuration: any;


  /**
   * permet d'ajouter l'adresse mac du pointeuse dans le restaurant
   * @param restaurant
   */
  private addMacToRestaurant(restaurant: RestaurantModel): void {
    restaurant.macPointeuse = this.mac;
    const sub = this.restaurantService.linkMacPointeuseToRestaurant(restaurant.macPointeuse, restaurant.codePointeuse).subscribe((restaurant: RestaurantModel) => {
    }, err => {
      console.log(err);
    });
    // sub.unsubscribe();
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
    this.volume = this.sessionService.getVolume();

  }

  private async ConfirmAssociation(codeRestaurant: string) {
    return this.restaurantService.confirmAssociation(codeRestaurant).toPromise();
  }

  //permet de renialiser la liste de restaurants lors de l'ouverture et fermeture de dropDown
  public  onDropdownOpen() {
    if (!this.isDropdownOpen) {
      this.selectedRestaurant = [];
    }
    this.isDropdownOpen = true;
  }

  public changePointeuse_association_date(dateAssociation: string, uuidRestaurant: string) {
    return this.http.get(this.pathService.getPathEmployee() + '/restaurant/pointeuse_association_date/' + dateAssociation + '/' + uuidRestaurant);
  }

  
}
