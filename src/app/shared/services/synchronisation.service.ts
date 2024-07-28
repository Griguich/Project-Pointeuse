import {Injectable} from '@angular/core';
import {ParameterJsStoreService} from "./JsStoreServices/parameter-js-store.service";
import {CorrectionPointageJsStoreService} from "../../modules/correction-pointage/service/correctionPointageJsStore.service";
import {PointingService} from "../../modules/pointage/service/pointing.service";
import {SessionService} from "./session.service";
import {PointingHttpService} from "../../modules/pointage/service/pointing-http.service";
import {CorrectionPointageService} from "../../modules/correction-pointage/service/correction-pointage.service";
import {CorrectionPointageModel} from "../model/CorrectionPointage.model";
import {PointageModel} from "../model/pointage.model";
import {ParametreModel} from "../model/parametre.model";
import {Subject} from "rxjs";
import {DateService} from "./date.service";
import {OnlineService} from "../../health/online.service";
import {RxStompService} from "@stomp/ng2-stompjs";
import {PathService} from "./path.service";
import {PlanningJsStoreService} from "../../modules/plannings/services/planningJsStore.service";
import {RestaurantDataService} from "./restaurant-data.service";
import {RestaurantService} from "./restaurant.service";
import {RestaurantModel} from "../model/restaurant.model";

@Injectable({
  providedIn: 'root'
})
export class SynchronisationService {
  private minuteInMillisecond = 60000;
  private timer = 'TIMER_SYNCHRO';
  private paramChanges = new Subject();
  public currentState = this.paramChanges.asObservable();
  private isOnline = true;
  private idRestaurantForSynchronisation;
  private readonly paramTIMER_SYNCHRO = 'TIMER_SYNCHRO';
  private readonly timer_synchro_disabled = '0';
  public synchro_marche = 0;
  public synchro_ne_marche_pas = 0;


  constructor(private parameterJsStoreService: ParameterJsStoreService,
              private correctionPointageJsStoreService: CorrectionPointageJsStoreService,
              private pointingService: PointingService,
              private sessionService: SessionService,
              private pointingHttpService: PointingHttpService,
              private correctionPointageService: CorrectionPointageService,
              private dateService: DateService,
              private onlineService: OnlineService,
              private rxStompService: RxStompService,
              private pathService: PathService,
              private restaurantService: RestaurantService
  ) {
    this.checkOnlineState();
  }

  private checkOnlineState(): void {
    this.onlineService.onlineState().subscribe(isOnline => {
      if (!this.isOnline && isOnline) {
        this.isOnline = isOnline;
        // this.synchroniseRegulary(true, this.sessionService.getDateJournee(), 0);
        this.onSendPointing(true, this.sessionService.getDateJournee(), 0);
      } else {
        this.isOnline = isOnline;
      }
    });
  }

  public synchronistation(isRegularly: number): void {
    this.parameterJsStoreService.getListParameter().then((parameters: ParametreModel[]) => {
      // tslint:disable-next-line:variable-name
      const timer_synchro = parameters.find(paramete => paramete.param === this.timer);
      if (this.isOnline && timer_synchro.valeur !== this.timer_synchro_disabled) {
      setInterval(async () => {
          // await this.synchroniseRegulary(true, this.sessionService.getDateJournee(), isRegularly);
          await this.onSendPointing(true, this.sessionService.getDateJournee(), isRegularly);
        }
        , +timer_synchro.valeur * this.minuteInMillisecond);
      }
    });
  }


  public async synchronizeCorrections(dateJournee: string, isRegularly: number): Promise<void> {
    const corrections: CorrectionPointageModel[] = await this.correctionPointageJsStoreService.getdailyCorrections(dateJournee);
    await this.correctionPointageService.updateCorrectionPointages(corrections, isRegularly).toPromise().then(result => {
      this.sessionService.setSyncCorrectionsProgress(true);
    })
      .catch((err) => {
        console.log(err);
        this.sessionService.setSyncCorrectionsProgress(false);
      });
  }

 

  public updateState(): void {
    this.paramChanges.next();
  }
  public async synchroniseRegulary(syncPointage: boolean, dateChoisit: string, isRegularly: number): Promise<void> {
    
    if (this.isOnline) {
      if (syncPointage) {
        let pointages: PointageModel[];
        pointages = await this.pointingService.getdailyPointagesForCorrection(dateChoisit);
        await pointages.forEach((pointage: PointageModel) => {
          if (typeof pointage.modified === 'boolean') {
            pointage.modified = pointage.modified ? 1 : 0;
          }
          if (!pointage.idFront) {
            pointage.idFront = this.makeString();
          }
          
        });
        await this.pointingHttpService.updatePointagesV2(pointages, isRegularly, dateChoisit).toPromise().then(result => {
          this.sessionService.setSyncPointageProgress(true);
          
          let currentValue = parseInt(this.sessionService.getSynchronisation_ok(), 10);
          if (isNaN(currentValue)) {
            currentValue = 0;
        }
          currentValue++;
          // Convert back to a string and store it using sessionService
          this.sessionService.setSynchronisation_ok(currentValue.toString());
          console.log ("marche :=" +this.sessionService.getSynchronisation_ok()) ;
        })
          .catch((err) => {
            console.log(err);
            this.sessionService.setSyncPointageProgress(false);
              
            
            let currentValue = parseInt(this.sessionService.getSynchronisation_failed(), 10);

            if (isNaN(currentValue)) {
              currentValue = 0;
          }
          currentValue++;
          // Convert back to a string and store it using sessionService
          this.sessionService.setSynchronisation_failed(currentValue.toString());
            console.log ("ne marche pas =:" + this.sessionService.getSynchronisation_failed()) ;
          });
        await this.synchronizeCorrections(dateChoisit, isRegularly);
      }
      this.updateState();
    }
  }
  public async onSendPointing(syncPointage: boolean, date: string, isRegularly: number): Promise<void> {
    const paramTimerSynchro = await this.parameterJsStoreService.getParamatreByParam(this.paramTIMER_SYNCHRO);
    if (this.isOnline && paramTimerSynchro[0].valeur !== '0') {
      if (syncPointage) {
        let pointages: PointageModel[];
        pointages = await this.pointingService.getdailyPointages(date);
        await pointages.forEach((pointage: PointageModel) => {
          if (typeof pointage.modified === "boolean") {
            pointage.modified = pointage.modified ? 1 : 0;
          }
        });
        if (this.publishPointage(pointages, isRegularly, date)) {
          this.sessionService.setSyncPointageProgress(true);
        } else {
          this.sessionService.setSyncPointageProgress(false);
        }
      }
      this.updateState();
      this.sessionService.setLastSync( (new Date()).toLocaleString());
      if (isRegularly)
      this.sessionService.setLastSyncType(0);
    }
  }

  public publishPointage(pointages: PointageModel[], isRegularly: number, date: string): boolean {
    // TODO modifier le save de id restaurant dans le  localstorage (a éviter d'utiliser les deux fct atob et btoa)
    const idRestaurant = +this.sessionService.getIdRestaurant();
    if (isNaN(idRestaurant * 155)) {
      this.restaurantService.getRestauratByCodePointeuse(this.sessionService.getCodeRestaurant()).subscribe(async (restaurant: RestaurantModel) => {
        this.idRestaurantForSynchronisation = restaurant.idRestaurant;
      });
    } else {
      this.idRestaurantForSynchronisation = idRestaurant;
    }
    const uuidResto = this.sessionService.uuidGenerator(this.idRestaurantForSynchronisation);
    if (!this.sessionService.getrefreshAfterMise()) {
      this.sessionService.setrefreshAfterMise('done');
      window.location.reload();
    }
    if (pointages.length) {
      this.rxStompService.publish({destination: this.pathService.getSychroPointageQueue(), body: JSON.stringify(pointages),
        headers: {
          uuidRestaurant: uuidResto,
          dateJournee: date,
          isRegularly: String(isRegularly),
          heureSynchro: '' + new Date(),
          'content-type': 'application/json',
        }
      });
    }
    return true;
  }

  public publishPointageClosePointeuse(pointages: PointageModel[], date: string) {
    // TODO modifier le save de id restaurant dans le  localstorage (a éviter d'utiliser les deux fct atob et btoa)
    const idRestaurant = +this.sessionService.getIdRestaurant();
    if (isNaN(idRestaurant * 155)) {
      this.restaurantService.getRestauratByCodePointeuse(this.sessionService.getCodeRestaurant()).subscribe(async (restaurant: RestaurantModel) => {
        this.idRestaurantForSynchronisation = restaurant.idRestaurant;
      });
    } else {
      this.idRestaurantForSynchronisation = idRestaurant;
    }
    const uuidResto = this.sessionService.uuidGenerator(this.idRestaurantForSynchronisation);
    if (pointages.length) {
      this.rxStompService.publish({destination: this.pathService.getSychroPointageQueue(), body: JSON.stringify(pointages),
        headers: {
          nomRestau: this.sessionService.getRestaurantName(),
          uuidRestaurant: uuidResto,
          dateJournee: date,
          isRegularly: String('2'),
          heureSynchro: '' + new Date(),
          'content-type': 'application/json',
        }
      });
    }
    this.sessionService.setLastSync( (new Date()).toLocaleString());
    this.sessionService.setLastSyncType(0);
  }
  /**
   * Permet de creer un string de 32 char utilise comme identifiant unique
   */
  public makeString(): string {
    let outString = '';
    const inOptions = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));
    }
    return outString;
  }





}
