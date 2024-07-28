import {Injectable} from '@angular/core';
import {NameOfTable} from '../model/enumeration/NameOfTable.model';
import {ContrainteSocialeService} from './contrainte-sociale.service';
import {EmployeJsStoreService} from '../../modules/employes/service/employeJsStore.service';
import {EmployeeModel} from '../model/employee.model';
import {PointageModel} from '../model/pointage.model';
import {EmployeeCoordinations} from '../model/employeCoordinations.model';
import {ParametreModel} from '../model/parametre.model';
import {ParameterJsStoreService} from '../../modules/parametre-globaux/services/parameter-js-store.service';
import {DateService} from './date.service';
import {RestaurantModel} from '../model/restaurant.model';
import {DbJsStoreService} from './JsStoreServices/dbJsStore.service';
import {AnomalieModel} from '../model/anomalie.model';
import {SessionService} from './session.service';
import {LoiPaysModel} from '../model/loi.pays.model';
import {CodeNameContrainteSocial} from '../enumration/codeNameContrainteSocial';
import {AnomalieJsStoreService} from '../../modules/anomalie/service/anomalieJsStore.service';
import {RhisTranslateService} from './rhis-translate.service';
import {PointingJsStoreService} from "./JsStoreServices/pointing-js-store.service";
import { LanguageStorageService } from './language-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CheckingSocialConstraintsRegularlyService extends DbJsStoreService<any> {
  private minCheckCont = 'MINCHECKCONT';
  private mpreventDelay = 'MPREVENTDELAY';
  private washingDelay = 'WASHINGDELAY';
  private readonly volumeMax = 100;
  public tableName = NameOfTable.POINTAGE;
  private restaurantInfos: RestaurantModel;
  private employesCoordinationsList: EmployeeCoordinations[] = [];
  private audio = new Audio();
  private audioPrealarme = new Audio();
  private minuteInMillisecond = 60000;
  public audioLang: any;

  constructor(private constraintService: ContrainteSocialeService,
              private employeJsStoreService: EmployeJsStoreService,
              private pointageService: PointingJsStoreService,
              private parameterJsStoreParameter: ParameterJsStoreService,
              private contraintreSocialService: ContrainteSocialeService,
              private dateService: DateService,
              private sessionService: SessionService,
              private anomalieJsStoreService: AnomalieJsStoreService,
              private rhisTranslateService: RhisTranslateService,
              private sessionservice: SessionService,
              private languageStorageService: LanguageStorageService
  ) {
    super();
  }

  /**
   * permet de recuperer les employés présents dans le restaurant
   */
  public async getEmployesCoordinations(delay: number): Promise<EmployeeCoordinations[]> {
    let cordinationsList: EmployeeCoordinations[] = [];
    const employes: EmployeeModel[] = await this.employeJsStoreService.getEmployesList();
    for (let index = 0; index < employes.length; index++) {
      let pointages: PointageModel[] = await this.pointageService.getByIdEmploye(this.tableName, employes[index].idEmployee);
      if (pointages && pointages.length && this.verifyIsCurrent(pointages)) {
        pointages.forEach(async (pointage: PointageModel) => {
          if ( pointage.dateJournee === this.dateService.getYesterDay(this.sessionService.getDateJournee()) && pointage.isAcheval)
          {
            pointage.dateJournee = this.sessionService.getDateJournee();
          }
          pointage = await this.setPointingDates(pointage, delay);
        });
        if (pointages.length > 0) {
          cordinationsList.push(new EmployeeCoordinations(employes[index], pointages, true));
        }
      }
    }
    return cordinationsList;
  }

  private async setPointingDates(pointage: PointageModel, delay: number): Promise<PointageModel> {
    if(pointage.isAcheval){
      pointage.heureDebut = this.dateService.createDateFromHourAndNightValue(new Date(`${this.dateService.getYesterDay(pointage.dateJournee)} ${pointage.heureDebut}`), pointage.heureDebutIsNight);
    } else {
      pointage.heureDebut = this.dateService.createDateFromHourAndNightValue(new Date(`${pointage.dateJournee} ${pointage.heureDebut}`), pointage.heureDebutIsNight);
    }
    if (!pointage.heureFin) {
      pointage.heureFin = this.dateService.createDateFromTime(this.sessionService.getDateJournee(), this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':'))
      pointage.heureFin = this.dateService.addMinuteToDate(pointage.heureFin, delay);
      pointage.heureFinIsNight = await this.constraintService.checkIsNight(new Date(), this.dateService.getCorrectDateJournee());
    } else {
      pointage.heureFin = this.dateService.createDateFromTime(pointage.dateJournee, pointage.heureFin)
    }
    pointage.tempsPointes = this.dateService.getDiffOn(pointage.heureFin, pointage.heureDebut, 'minutes');
    return pointage;
  }


  private verifyIsCurrent(pointages: PointageModel[]): boolean {
    return pointages.some((pointage: PointageModel) => pointage.heureFin === null);
  }


  public async verify(delay: number): Promise<void> {
    this.employesCoordinationsList = await this.getEmployesCoordinations(delay);
    await this.checkRestaurantInfos();

    for (const coordinations of this.employesCoordinationsList) {
      if (!this.constraintService.verifyMaxDelayPerDay(coordinations).isRespected) {
        const specificLoi = this.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_HEURE_MAXI_JOUR_PLANIFIE);
        const valeurDepasse = this.constraintService.verifyMaxDelayPerDay(coordinations).contrainteMessage.split(':')[1];
        this.createAnomalie(coordinations, specificLoi, valeurDepasse, delay)
      }

      if (!(await (this.constraintService.verifyMaxDelayWorkPerDay(coordinations))).isRespected) {
        const specificLoi = this.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.AMPLITUDE_JOUR_MAX);
        const valeurDepasse = (await (this.constraintService.verifyMaxDelayWorkPerDay(coordinations))).contrainteMessage.split(':')[1];
        this.createAnomalie(coordinations, specificLoi, valeurDepasse, delay)
      }

      if (!this.constraintService.verifyMaxDelayWorkPerWeek(coordinations).isRespected) {
        const specificLoi = this.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_HEURE_MAXI_SEMAINE);
        const valeurDepasse = this.constraintService.verifyMaxDelayWorkPerWeek(coordinations).contrainteMessage.split(':')[1];
        this.createAnomalie(coordinations, specificLoi, valeurDepasse, delay)
      }

      if (! (await(this.constraintService.MaxDelayWithoutPause(coordinations))).isRespected) {
        const specificLoi = this.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK);
        const valeurDepasse = (await (this.constraintService.MaxDelayWithoutPause(coordinations))).contrainteMessage.split(':')[1];
        this.createAnomalie(coordinations, specificLoi, valeurDepasse, delay);
      }

      if (!this.constraintService.verifyMaxDelayWithNight(coordinations).isRespected) {
        const specificLoi = this.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.GAMME_MAX_JOUR_HEURE_NUIT)
        const valeurDepasse = this.constraintService.verifyMaxDelayWithNight(coordinations).contrainteMessage.split(':')[1];
        this.createAnomalie(coordinations, specificLoi, valeurDepasse, delay);
      }

      if (!this.constraintService.verifyValidWorkingHours(coordinations).isRespected) {
        const codeNames = [CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_APRES_HEURE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_AVANT_HEURE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_DIMANCHE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_WEEK_END, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_JOUR_FERIE];
        const valeurList = this.constraintService.verifyValidWorkingHours(coordinations).contrainteMessage.split(':').splice(1);
        this.addValidHoursAlerts(valeurList, codeNames, coordinations, delay);
      }

      if (!this.constraintService.verifyCheckAbsenceHours(coordinations).isRespected) {
        const valeurDepasse = this.constraintService.verifyCheckAbsenceHours(coordinations).contrainteMessage.split('/')[1];
        this.createAnomalie(coordinations, null, valeurDepasse, delay);
      }

    }
  }

  /**
   * permet la creation d'un anomalie (if not exist)
   * @param validAnomalie
   * @param coordonee
   * @param specificLoi
   * @param valeurDepasse
   * @param delay
   */
  public async createAnomalie(coordonee: EmployeeCoordinations, specificLoi: any, valeurDepasse: string, delay: number, validAnomalie = this.sessionService.getAutorisation()): Promise<void> {
    const anomalie: AnomalieModel = new AnomalieModel();
    anomalie.idFront = this.makeString();
    anomalie.badgeEmployee = coordonee.employee.badge.code;
    anomalie.idEmployee = coordonee.employee.idEmployee;
    anomalie.idRestaurant = +this.sessionService.getIdRestaurant();
    anomalie.nomEmploye = coordonee.employee.nom;
    anomalie.prenomEmploye = coordonee.employee.prenom;
    anomalie.dateAnomalie = this.dateService.setTimeNull(this.dateService.getCorrectDateJournee());
    anomalie.isPreAlarme = delay > 0;
    anomalie.valide = validAnomalie;
    if (specificLoi) {
      anomalie.codeAnomalie = specificLoi.codeName;
      anomalie.libelleAnomalie = specificLoi.libelle;
      anomalie.valeurContrainte = this.constraintService.getConstraintValueByCodeName(specificLoi.codeName, coordonee.employee.loiPointeuse,
        coordonee.employee.hebdoCourant >= 35, coordonee.employee.majeur);
    } else {
      anomalie.libelleAnomalie = this.rhisTranslateService.translate('ANOMALIE.ASENCE_MESSAGE');
      anomalie.valeurContrainte = null;
    }
    anomalie.valeurDepasse = valeurDepasse;
    anomalie.idFrontPointage = this.constraintService.currentShiftId(coordonee);
    const isAnomalieValidated = await this.isValidatedAnomalieExist(anomalie);
    if (!isAnomalieValidated) {
    this.isPreAlarmeExist(anomalie).then((isExist: boolean) => {
      if (!isExist && anomalie.isPreAlarme) {
        this.anomalieJsStoreService.addAnomalie(anomalie);
        this.startPreAlarme();
      }
    });
    if (validAnomalie) {
      this.anomalieJsStoreService.addAnomalie(anomalie);
    } else {
      this.isAnomalieExist(anomalie).then(async (check: boolean) => {
        if (!check && !anomalie.isPreAlarme) {
          let preAlarme = await this.getPreAlarmeOfAnomalie(anomalie);
          if (preAlarme) {
            this.anomalieJsStoreService.deleteAnomalie(preAlarme);
            this.anomalieJsStoreService.addAnomalie(anomalie);
            this.stopPreAlarme();
            this.callManager();
          } else {
            this.anomalieJsStoreService.addAnomalie(anomalie);
            this.callManager();
          }
        }
      });
    }
    }
  }

  private callManager(): void {
    this.audio.src = '../../../assets/audio/' + this.languageStorageService.getVocalLanguageSettings().toLowerCase() + '/DemandeManager.WAV';
    this.audio.load();
    this.audio.loop = true;
    this.audio.volume = this.sessionService.getVolume() / this.volumeMax;
    this.audio.play();

  }

  private startPreAlarme(): void {
    this.audioPrealarme.src = '../../../assets/audio/' + this.languageStorageService.getVocalLanguageSettings().toLowerCase() + '/prealarme.WAV';
    this.audioPrealarme.load();
    this.audioPrealarme.loop = true;
    this.audioPrealarme.volume = this.sessionService.getVolume() / this.volumeMax;
    this.audioPrealarme.play();

  }


  public stopAudio(): void {
    this.audio.src = '';
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  public stopPreAlarme(): void {
    this.audioPrealarme.src = '';
    this.audioPrealarme.pause();
    this.audioPrealarme.currentTime = 0;
  }

  private async checkRestaurantInfos(): Promise<any> {
    if (!this.restaurantInfos) {
      this.restaurantInfos = await super.getAll(NameOfTable.RESTAURANT)
        .then((restaurantsInfos: RestaurantModel[]) => {
          if (restaurantsInfos && restaurantsInfos.length) {
            return restaurantsInfos[0];
          }
          return null;
        });
      this.constraintService.setParameters(this.restaurantInfos);
    }
  }

  public getSpecifiedLoi(coordonnee: any, codeName: string): any {
    return coordonnee.employee.loiPointeuse.find((loi: LoiPaysModel) => loi.codeName === codeName);
  }

  /**
   * permet de créer une anomalie par sous contrainte pour les heures fausses
   * @param listConstraintMessage
   * @param codeNames
   * @param coordinations
   * @param delay
   * @param validAnomalie
   */
  public addValidHoursAlerts(listConstraintMessage: string[], codeNames: string[], coordinations: EmployeeCoordinations,
                             delay: number, validAnomalie = this.sessionService.getAutorisation()): void {
    if (listConstraintMessage[0] === 'false') {
      const specificLoi = this.getSpecifiedLoi(coordinations, codeNames[0]);
      this.createAnomalie(coordinations, specificLoi, this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':'), delay, validAnomalie);
    }
    if (listConstraintMessage[1] === 'false') {
      const specificLoi = this.getSpecifiedLoi(coordinations, codeNames[1]);
      this.createAnomalie(coordinations, specificLoi, this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':'), delay, validAnomalie);
    }
    if (listConstraintMessage[2] === 'false') {
      const specificLoi = this.getSpecifiedLoi(coordinations, codeNames[2]);
      this.createAnomalie(coordinations, specificLoi, this.sessionService.getJournee(), delay, validAnomalie);
    }
    if (listConstraintMessage[3] === 'false') {
      const specificLoi = this.getSpecifiedLoi(coordinations, codeNames[3]);
      this.createAnomalie(coordinations, specificLoi, this.sessionService.getDateJournee(), delay, validAnomalie);
    }
    if (listConstraintMessage[4] === 'false') {
      const specificLoi = this.getSpecifiedLoi(coordinations, codeNames[4]);
      this.createAnomalie(coordinations, specificLoi, this.sessionService.getDateJournee(), delay, validAnomalie);
    }
  }

  public verifyRegulary(): void {
    this.parameterJsStoreParameter.getListParameter().then((parameters: ParametreModel[]) => {
      const planningUserParameter = parameters.find(paramete => paramete.param === this.minCheckCont);
      const MPREVENTDELAY = parameters.find(paramete => paramete.param === this.mpreventDelay)
      setInterval(() => {
          // verification periodique
          this.verify(0);
          // pré-alarme
          this.verify(+MPREVENTDELAY.valeur);
        }
        , +planningUserParameter.valeur * this.minuteInMillisecond);
    })
  }

  /**
   * permet de verifier si une anomalie existe
   * @param anomalie
   */
  private async isAnomalieExist(anomalie: AnomalieModel): Promise<boolean> {
    const anomalieList: AnomalieModel[] = await this.anomalieJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee()));
    return anomalieList.some((anomalieFound: AnomalieModel) =>
      anomalieFound.codeAnomalie === anomalie.codeAnomalie &&
      anomalieFound.idFrontPointage === anomalie.idFrontPointage &&
      !anomalieFound.isPreAlarme
    );
  }

  private async getPreAlarmeOfAnomalie(anomalieModel: AnomalieModel): Promise<AnomalieModel> {
    const anomalieList: AnomalieModel[] = await this.anomalieJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee()));
    return anomalieList.find((anomalie: AnomalieModel) => anomalie.codeAnomalie === anomalieModel.codeAnomalie
      && anomalie.idFrontPointage === anomalieModel.idFrontPointage
      && anomalie.isPreAlarme);
  }

  private async isPreAlarmeExist(anomalie: AnomalieModel): Promise<boolean> {
    const anomalieList: AnomalieModel[] = await this.anomalieJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee()));
    return anomalieList.some((anomalieFound: AnomalieModel) =>
      anomalieFound.codeAnomalie === anomalie.codeAnomalie &&
      anomalieFound.idFrontPointage === anomalie.idFrontPointage);
  }

  private async isValidatedAnomalieExist(anomalie: AnomalieModel): Promise<boolean> {
    const anomalieList: AnomalieModel[] = await this.anomalieJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee()));
    const vam = anomalieList.some((anomalieFound: AnomalieModel) =>
      anomalieFound.codeAnomalie === anomalie.codeAnomalie &&
      anomalieFound.idEmployee === anomalie.idEmployee &&
      anomalieFound.valide);
    return vam;
  }


  public async handWashingReminder(): Promise<void> {
    this.parameterJsStoreParameter.getListParameter().then((parameters: ParametreModel[]) => {
      let washingDelay = parameters.find(parameter => parameter.param === this.washingDelay);
      setInterval(async () => {
          if (await this.verifyRestaurantIsNotEmpty()) {
            let audio = new Audio();
            audio.src = '../../../assets/audio/' + this.languageStorageService.getVocalLanguageSettings().toLowerCase() + '/lavage.WAV';
            audio.load();
            audio.loop = false;
            audio.volume = (this.sessionService.getVolume() / this.volumeMax);
            audio.play();
          }
        }
        , +washingDelay.valeur * this.minuteInMillisecond);
    });


  }

  public getdailyPointages(dateJourne: string): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        dateJournee: dateJourne,
      }
    });
  }

  private async verifyRestaurantIsNotEmpty(): Promise<boolean> {
    let pointages = await this.getdailyPointages(this.sessionService.getDateJournee());
    return pointages.some(pointage => pointage.heureFin === null);
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
