import {HealthCheckService} from './health/health-check.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RhisTranslateService} from './shared/services/rhis-translate.service';
import {BandroleService} from './shared/services/bandrole.service';
import {SessionService} from './shared/services/session.service';
import {initJsStore} from './shared/services/createTable.service';
import {DateService} from './shared/services/date.service';
import {RestaurantDataService} from './shared/services/restaurant-data.service';
import {
  CheckingSocialConstraintsRegularlyService
} from './shared/services/checking-social-constraints-regularly.service';
import {Subject, Subscription} from 'rxjs';
import {UserActionDetectorService} from './shared/services/user-action-detector.service';
import {SynchronisationService} from './shared/services/synchronisation.service';
import {ParameterJsStoreService} from './modules/parametre-globaux/services/parameter-js-store.service';
import {Router} from '@angular/router';
import {MyrhisIdleSerice} from './shared/services/myrhis.idle.serice';
import {PointeuseVersionNotifierService} from './health/pointeuse-version-notifier.service';
import {StompClient} from './rabbitmq/stomp-client';
import {takeUntil} from 'rxjs/operators';
import {Message} from '@stomp/stompjs';
import {CorrectionPointageModel} from './shared/model/CorrectionPointage.model';
import {
  CorrectionPointageJsStoreService
} from './modules/correction-pointage/service/correctionPointageJsStore.service';
import {RxStompService} from '@stomp/ng2-stompjs';
import {LanguageStorageService} from './shared/services/language-storage.service';
import {PathService} from './shared/services/path.service';
import {GlobalSettingsService} from './shared/services/global-settings.service';
import {MenuStatusService} from './shared/services/menu-status.service';
import {OnlineService} from "./health/online.service";
import {EmployeJsStoreService} from "./modules/employes/service/employeJsStore.service";
import {PlanningJsStoreService} from "./modules/plannings/services/planningJsStore.service";
import {DecoupageHoraireJsStoreService} from "./shared/services/JsStoreServices/decoupageHoraireJsStore.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public bandroleMessage: string;

  public areMenuAndHeaderDisplayed;

  private subscription: Subscription;
  private notification: Subject<void> = new Subject<void>();
  private destroyed$: Subject<void> = new Subject<void>();
  private send: boolean;
  private message: any;
  private observable: Subject<void> = new Subject();
  show: any;
  buttonName: any;
  display: any;
  visibleSidebar1: any;
  menuState: any;
  idRestauarant: number;
  private codeRestaurant: string;
  public isFirstTimeAssociation: boolean;
  isConnected = false;
  private isOnline = true;
  constructor(private rhisTranslateService: RhisTranslateService,
              private bandrole: BandroleService,
              private parameterJsStoreParameter: ParameterJsStoreService,
              private dateService: DateService,
              private restaurantDataService: RestaurantDataService,
              public sessionService: SessionService,
              private healthCheckService: HealthCheckService,
              private checkSocialConstraintsRegularly: CheckingSocialConstraintsRegularlyService,
              private userActionDetector: UserActionDetectorService,
              private synchronisationService: SynchronisationService,
              private router: Router,
              private myRhisIdle: MyrhisIdleSerice,
              private appService: UserActionDetectorService,
              private stompClient: StompClient ,
              private pointeuseVersionNotifierService: PointeuseVersionNotifierService,
              private correctionPointageJsStoreService: CorrectionPointageJsStoreService,
              private rxStompService: RxStompService,
              private languageStorageService: LanguageStorageService,
              private globalSettings: GlobalSettingsService,
              private menuStatusService: MenuStatusService,
              private pathService: PathService,
              private onlineService: OnlineService,
              private employeJsStoreService: EmployeJsStoreService,
              private planningJsStore: PlanningJsStoreService,
              private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService) {
    this.rhisTranslateService.configLanguage(['en', 'fr'], 'fr');
    this.healthCheckService.checkHealth();
    this.pointeuseVersionNotifierService.checkForUpdates();
    this.codeRestaurant = this.sessionService.getCodeRestaurant();
    this.isFirstTimeAssociation = this.codeRestaurant == 'ée';
    this.idRestauarant = +this.sessionService.getIdRestaurant();
  }


  async ngOnInit() {
    this.sessionService.isConnected$.pipe(takeUntil(this.destroyed$)).subscribe(isConnected => {
      this.isConnected = isConnected;
    });
    this.stompClient.connect();
    this.stompClient.synchroPointageNotification().pipe(takeUntil(this.notification)).subscribe(async (notification: Message) => {
      this.message = JSON.parse(notification.body);
      if (notification.body != null) {
        // tslint:disable-next-line:max-line-length
        const corrections: CorrectionPointageModel[] = await this.correctionPointageJsStoreService.getdailyCorrections(this.message.dateJournee);
        this.rxStompService.publish({destination: this.pathService.getSychroCorrectionQueue(), body: JSON.stringify(corrections),
          headers: {
            uuidRestaurant: this.message.uuidRestaurant,
            dateJournee: this.message.dateJournee,
            isRegularly: this.message.isRegularly,
            timeZone: '' + new Date().getTimezoneOffset(),
            heureSynchro: '' + new Date(),
            'content-type': 'application/json',
          }
        });
      }
    });
    try {
      await initJsStore();
      const listEmployee = await this.employeJsStoreService.getEmployesList();
      this.onlineService.onlineState().subscribe((isOnline) => this.isOnline = isOnline);
      if ((!this.sessionService.getIsOuvertureDone() && this.isOnline)) {
        await this.getDataForOuverturePointeuse(this.idRestauarant)
        if (!this.sessionService.getPointeuseState()) {
            this.changePointeuseState();
        }
      }
      else if ((this.isOnline && listEmployee.length === 0)) {
        await this.getDataForPointeuseIfIndexedDBIsDeleted(this.idRestauarant);
       }
    } catch (error) {
    }

    this.redirectIfTimedOut();

    if (this.sessionService.isConnected) {
      this.myRhisIdle.startIdle();

    }
    this.appService.getUserLoggedIn().subscribe((userLoggedIn: boolean) => {
      if (userLoggedIn && !this.myRhisIdle.isRunning()) {
        this.myRhisIdle.startIdle();
      } else {
        this.myRhisIdle.stopIdle();
      }
    });

    await this.checkSocialConstraintsRegularly.handWashingReminder();
    this.synchronisationService.synchronistation(0);
    this.checkSocialConstraintsRegularly.verifyRegulary();
    this.setOuvertureFermetureAlarme();
    this.bandrole.currentMessage.subscribe(message => this.bandroleMessage = message);
    if (this.languageStorageService.getDisplayLanguageSettings()) {
      this.rhisTranslateService.language = this.languageStorageService.getDisplayLanguageSettings();
    }
    if (!this.languageStorageService.getVocalLanguageSettings()) {
      this.languageStorageService.setVocalLanguageSettings('fr');
    }

  }
  toggle() {
    this.show = !this.show;

    // Change the name of the button.
    if (this.show) {
      this.buttonName = 'Hide';
    }
    else {
      this.buttonName = 'Show';
    }
  }

  private async changePointeuseState(): Promise<void> {
    const debutFinJouneePhases = await this.decoupageHoraireJsStoreService.getListDecoupage();
    const debutJourneesPhases = debutFinJouneePhases.find(value => value.phaseLibelle == 'DJA');
    const heureDebut = debutJourneesPhases['valeur' + this.dateService.convertStringToCamelCase(this.sessionService.getJournee())];
    let dateJournee = new Date();
    dateJournee.setHours(+(heureDebut.substr(0, 2)));
    dateJournee.setMinutes(+(heureDebut.substr(3, 2)));
    dateJournee.setSeconds(0,0);
    if (this.dateService.isSameOrAfter(new Date(), dateJournee)) {
      this.sessionService.setPointeuseState(true);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.stompClient.deactivate();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private async getDataForOuverturePointeuse(idRestaurant: number) {
    await this.restaurantDataService.getInfoToPointeuse(idRestaurant);
    await this.restaurantDataService.setDateJourneeAndOuvertureFermetureTimer();
  }

  private async getDataForPointeuseIfIndexedDBIsDeleted(idRestaurant: number) {
    // await this.planningJsStore.deleteAllPointageFromIndexedDb();
    await this.restaurantDataService.getInfoToPointeuseIfIndexedDBIsDeleted(idRestaurant);
    await this.restaurantDataService.setDateJourneeAndOuvertureFermetureTimer();
  }

  /**
   * Cette methode lancera la creation des alarmes de decoupage horaire suite a un F5 (refresh)
   */
  private setOuvertureFermetureAlarme() {
    this.restaurantDataService.checkDecoupagePresenceAndCreateAlarme();
  }

  public redirectIfTimedOut(): void {
    this.subscription = this.myRhisIdle.isTimedOut().subscribe(async (isTimedOut: boolean) => {
      if (isTimedOut) {
        await this.router.navigate(['/']);
        window.location.reload()
      }
    });

  }
}
