/* tslint:disable */
import {Injectable} from '@angular/core';
import {NameOfTable} from '../../../shared/model/enumeration/NameOfTable.model';
import {EmployeeModel} from '../../../shared/model/employee.model';
import {ContrainteSocialeService} from '../../../shared/services/contrainte-sociale.service';
import {PointageModel} from '../../../shared/model/pointage.model';
import {ShiftModel} from '../../../shared/model/shift.model';
import {PointingHttpService} from './pointing-http.service';
import {RestaurantModel} from '../../../shared/model/restaurant.model';
import {SessionService} from '../../../shared/services/session.service';
import {InfoRestaurantJsStoreService} from '../../../shared/services/JsStoreServices/infoRestaurantJsStore.service';
import {EmployeJsStoreService} from '../../employes/service/employeJsStore.service';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';
import {ShiftJsStoreService} from '../../../shared/services/JsStoreServices/shiftJsStore.service';
import {ParametreModel} from '../../../shared/model/parametre.model';
import {ParameterJsStoreService} from '../../parametre-globaux/services/parameter-js-store.service';
import {DateService} from '../../../shared/services/date.service';
import {RhisTranslateService} from '../../../shared/services/rhis-translate.service';
import {MessageService} from '../../messages/service/message.service';
import {NotificationService} from '../../../shared/services/notification.service';
import {MessageModel} from '../../../shared/model/message.model';
import {MessageJsStoreService} from '../../messages/service/messageJsStore.service';
import {BehaviorSubject, Observable} from "rxjs";
import {CodeNameContrainteSocial} from "../../../shared/enumration/codeNameContrainteSocial";
import {
  CheckingSocialConstraintsRegularlyService
} from "../../../shared/services/checking-social-constraints-regularly.service";
import {TypePointageJsStoreService} from "../../../shared/services/JsStoreServices/type-pointage-js-store.service";
import {TypePointageModel} from "../../../shared/model/type-pointage.model";
import {DomSanitizer} from "@angular/platform-browser";
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {SoundModel} from "../../../shared/model/sound.model";
import {SoundJsStoreService} from "../../../shared/services/JsStoreServices/sound-js-store.service";
import {LanguageStorageService} from 'src/app/shared/services/language-storage.service';
import {PlanningJsStoreService} from "../../plannings/services/planningJsStore.service";

@Injectable({
  providedIn: 'root'
})
export class PointingService extends DbJsStoreService<PointageModel> {
  public tableName = NameOfTable.POINTAGE;
  private isEnterPointing: boolean;
  private lastPointing: PointageModel;
  private restaurantInfos: RestaurantModel;
  private employeeInfos: { employee: EmployeeModel, pointages: PointageModel[], shifts: ShiftModel[] };
  private listParameter: ParametreModel[] = [];
  private planningUser = 'PLANNINGUSE';
  private minBeforPlan = 'MINBEFORPLAN';
  public messages: MessageModel[] = [];
  private currentShift: ShiftModel;
  private decalage = false;
  private constraintMessage = new BehaviorSubject('');
  public currentMessage = this.constraintMessage.asObservable();
  private planningUseState = 'false';
  private defaultTypePointageRef: TypePointageModel;
  private constrainteSoundPath = [
    {identifiant: 1, text: 'MinNightDelay.WAV'},
    {identifiant: 2, text: 'MinNbDayNumber.WAV'},
    {identifiant: 3, text: 'MinNbDayNumber.WAV'},
    {identifiant: 4, text: 'MaxDelayPerDay.WAV'},
    {identifiant: 5, text: 'MaxDelayPerWeek.WAV'},
    {identifiant: 6, text: 'MaxNbShift.WAV'},
    {identifiant: 7, text: 'ValidWorkingHours.WAV'},
    {identifiant: 8, text: 'MinPauseDelay.WAV'},
    {identifiant: 9, text: 'MaxDelayPerMonth.WAV '},
    {identifiant: 10, text: 'MinFreeDay.WAV'},
    {identifiant: 11, text: 'ValidWorkingHours.WAV'},
    {identifiant: 12, text: 'STRMSG07.WAV'},
    {identifiant: 13, text: 'STRMSG07.WAV'},
    {identifiant: 14, text: 'MaxDelayWorkPerDay.WAV'}
  ];
  private coordination: any;
  public audioLang: string;
  private readonly volumeMax = 100;

  constructor(private infoRestaurantJsStoreService: InfoRestaurantJsStoreService,
              private employeJsStoreService: EmployeJsStoreService,
              private shiftJsStoreService: ShiftJsStoreService,
              private pointingHttpService: PointingHttpService,
              private constraintService: ContrainteSocialeService,
              private sessionService: SessionService,
              private parameterJsStoreParameter: ParameterJsStoreService,
              private dateService: DateService,
              private rhisTranslateService: RhisTranslateService,
              private messageService: MessageService,
              private notificationService: NotificationService,
              private messageJsStore: MessageJsStoreService,
              private checkingSocialConstraintsRegularlyService: CheckingSocialConstraintsRegularlyService,
              private typePointageJsStoreService: TypePointageJsStoreService,
              private sessionservice: SessionService,
              private sanitizer: DomSanitizer,
              private http: HttpClient,
              private soundJsStoreService: SoundJsStoreService,
              private languageStorageService: LanguageStorageService,
              private planningJsStore: PlanningJsStoreService) {
    super();
  }

  public async checkRestaurantInfos() {
    if (!this.restaurantInfos) {
      this.restaurantInfos = await this.infoRestaurantJsStoreService.getRestaurantList()
        .then((restaurantsInfos: RestaurantModel[]) => {
          if (restaurantsInfos && restaurantsInfos.length) {
            return restaurantsInfos[0];
          }
          return null;
        });
      this.constraintService.setParameters(this.restaurantInfos);
    }
  }

  public async pointing(badgeCode: string, typePointage: string): Promise<boolean> {
    this.defaultTypePointageRef = (await this.typePointageJsStoreService.getOneByLibelle(typePointage)).pop();
    await this.checkRestaurantInfos();
    // Get Employee by badge);
    return this.employeJsStoreService.getEmployesList()
      .then((employees: EmployeeModel[]) => {
        return employees.find(employee => {
          if (employee.badge && employee.badge.code) {
            return employee.badge.code === badgeCode;
          } else {
            return null;
          }
        });
      })
      // Select employee's pointing
      .then((employe: EmployeeModel) => {
        if (employe && employe.loiPointeuse && employe.loiPointeuse.length) {
          return this.getAll(this.tableName)
            .then((pointages: PointageModel[]) => {
              return {
                employee: employe,
                pointages: pointages.filter(pointage => {
                  return this.employeePointages(pointage, employe);
                })
              };
            });
        }
        return {employee: null, pointages: []};
      })
      // Select employee's shifts
      .then((coordiantions: { employee: any, pointages: any }) => {
        return this.shiftJsStoreService.getByDateJournee(this.sessionService.getDateJournee())
          .then(shifts => {
            return {
              ...coordiantions,
              shifts: coordiantions.employee ? shifts.filter(shift => {
                if (shift.employee) {
                  return shift.employee.idEmployee === coordiantions.employee.idEmployee;
                }

              }) : []
            };
          });
      })
      .then(async (coordinations: { employee: EmployeeModel, pointages: PointageModel[], shifts: any }) => {
        [this.lastPointing, this.isEnterPointing] = this.constraintService.getLastPointingParameters(coordinations.pointages, false);
        this.employeeInfos = coordinations;
        await this.verifyDecalageShiftEntry(coordinations);
        if (this.sessionService.getAutorisation()) {
          this.coordination = coordinations;
          return coordinations.employee &&
          this.isEnterPointing ? this.checkInPointingAuthorized(coordinations) : this.checkOutPointingAuthorized(coordinations);
        } else {
          this.coordination = coordinations;
          // Verify enter/exit operation
          return coordinations.employee &&
          this.isEnterPointing ?
            this.decalage &&
            this.checkInPointing(coordinations)
            :
            this.checkOutPointing(coordinations);
          // Exit constraint to be checked
        }

      })
      .then(async (pointingResponse: any) => {
        return await this.getPointingValidityAndSave(pointingResponse, this.coordination);
      });
  }

  private async getPointingValidityAndSave(pointingResponse: boolean, coordinations: any): Promise<boolean> {
    if (!pointingResponse) {
      return false;
    }
    if (this.isEnterPointing) {
      this.notificationService.showSuccessMessage('POINTAGE.SUCCESS_ENTRY');
      const enterPointing = await this.constraintService.getEnterPointing(this.employeeInfos.employee);
      enterPointing.idFront = this.makeString();
      enterPointing.idShift = this.currentShift ? this.currentShift.idShift : null;
      enterPointing.typePointageRef = this.defaultTypePointageRef;
      await this.add(this.tableName, enterPointing);
    } else {
      this.notificationService.showSuccessMessage('POINTAGE.SUCCESS_EXIST');
      const exitPointing = await this.constraintService.getExitPointing(this.lastPointing);
      const shift = await this.getCurrentShiftOnOutPointing(coordinations, exitPointing);
      exitPointing.idShift = exitPointing.idShift === null ? (shift !== null ? shift.idShift : null) : exitPointing.idShift;
      await this.update(this.tableName, exitPointing.idFront, exitPointing);
    }
    return true;
  }

  private async getCurrentShiftOnOutPointing(coordinations: any, pointage: PointageModel): Promise<ShiftModel> {
    const heureFinPointage = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), new Date());
    let shiftNow: ShiftModel = null;
    await coordinations.shifts.forEach((shift: ShiftModel) => {
      const dateDebutShift = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), shift.heureDebut);
      const datefinShift = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), shift.heureFin);
      const debutPointage = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), pointage.heureDebut);
      if (this.dateService.isSameOrAfter(heureFinPointage, dateDebutShift) && this.dateService.isSameOrBefore(heureFinPointage, datefinShift)) {
        shiftNow = shift;
      } else if (this.dateService.isSameOrAfter(heureFinPointage, datefinShift) && this.dateService.isSameOrBefore(debutPointage, datefinShift)) {
        shiftNow = shift;
      }
    });
    return shiftNow;
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

  get restaurant(): RestaurantModel {
    return this.restaurantInfos;
  }

  set restaurant(value: RestaurantModel) {
    this.restaurantInfos = value;
  }

  public getManager(badgeCode) {
    if (badgeCode !== '0') {
      this.sessionService.setIsTechnicien(false);
    }
    return this.employeJsStoreService.getEmployesList()
      .then((employees) => {
        return employees.find((employee: EmployeeModel) => {
          if (employee.badge && employee.badge.code) {
            return employee.badge.code === badgeCode;
          } else {
            return null;
          }
        });
      })
      .then((employee: EmployeeModel) => {
        this.sessionService.setIsManager(employee.groupeTravail.pointeuse);
        // ajouter dans le localstorage les valeurs de champs personalizedAccess
        this.sessionservice.setpersonalizedAccess(employee.groupeTravail.personalizedAccess);
        this.messageJsStore.getMessageByIdReciever(employee.idEmployee).then((messages: MessageModel[]) => {
          if (messages.length > 0)
            this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('MESSAGE.RECEIVED') + messages.length + this.rhisTranslateService.translate('MESSAGE.NUMBER'));
        })
        return employee.groupeTravail.pointeuse;
      })
  }


  private async getListParameter(): Promise<void> {
    await this.parameterJsStoreParameter.getListParameter().then((listParameter: ParametreModel[]) => {
      this.listParameter = listParameter;
    });
  }


  /**
   * cette methode permet de verifier si l'employe a un shift au momet du pointage et verifie le decalage avant
   * @param coordinations
   */
  private async verifyDecalageShiftEntry(coordinations: any): Promise<any> {
    this.decalage = false;
    let planningUseParameter: ParametreModel;
    let minBeforPlanParameter: ParametreModel;
    const today = new Date();
    await this.getListParameter();
    planningUseParameter = this.listParameter.find((paramete: ParametreModel) => paramete.param === this.planningUser);
    minBeforPlanParameter = this.listParameter.find((paramete: ParametreModel) => paramete.param === this.minBeforPlan);
    if (planningUseParameter.valeur === this.planningUseState) {
      this.currentShift = null;
      this.decalage = true;
      await coordinations.shifts.forEach((shift: ShiftModel) => {
        const dateDebutShift = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), shift.heureDebut, shift.heureDebutIsNight ? 1 : 0);
        const datefinShift = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), shift.heureFin, shift.heureFinIsNight ? 1 : 0);
        if (this.dateService.isSameOrAfter(today, dateDebutShift) && this.dateService.isSameOrBefore(today, datefinShift)) {
          this.currentShift = shift;
          this.decalage = true;
        }
      });

    } else {
      await coordinations.shifts.forEach((shift: ShiftModel) => {
        const dateDebutShift = this.dateService.createDateFromTime(this.sessionservice.getDateJournee(), shift.heureDebut);
        if ((((this.dateService.getDiffOn(new Date(dateDebutShift.setSeconds(0)), new Date(today.setSeconds(0)), 'seconds')) / 60) <= minBeforPlanParameter.valeur)) {
          this.currentShift = shift;
          this.decalage = true;
        }
      });
    }
    if (!this.decalage) {
      this.updateMessage(this.rhisTranslateService.translate('POINTAGE.DECALAGE_ERREUR') + ' ' + minBeforPlanParameter.valeur + ' ' + this.rhisTranslateService.translate('POINTAGE.MINUTE_DECALAGE'));
    }
  }

  private async checkInPointing(coordinations: any): Promise<boolean> {
    await this.constraintService.setParameters(this.restaurantInfos);
    const inVerification = [];
    let inCheck: boolean = true;
    //nombre des contraintes failed
    let nbConstraintDown = 0;
    let constraintCode = 0;
    let soundAlertPath;
    inVerification.push(this.constraintService.verifyMinNightDelay(coordinations), this.constraintService.verifyMaxNbDayNumber(coordinations),
      this.constraintService.verifyMaxNbDayNumber2(coordinations), this.constraintService.verifyMaxDelayPerDay(coordinations),
      this.constraintService.verifyMaxDelayWorkPerWeek(coordinations), this.constraintService.verifyMaxNbShift(coordinations),
      this.constraintService.verifyValidWorkingHours(coordinations), this.constraintService.verifyMinPauseDelay(coordinations),
      this.constraintService.verifyMaxDelayWorkPerMonth(coordinations), this.constraintService.verifyMinFreeDayAndMinWeeklyRestDays(coordinations),
      this.constraintService.verifyCheckAbsenceHours(coordinations), this.constraintService.verifyMinHoursForCoupur(coordinations),
      (await (this.constraintService.verifyMaxDelayWorkPerDay(coordinations))));

    inVerification.forEach((constraint: any) => {
      constraintCode++;
      inCheck = inCheck && constraint.isRespected;
      if (!constraint.isRespected) {
        nbConstraintDown++;
        soundAlertPath = this.constrainteSoundPath.find(constraintSound => constraintSound.identifiant === constraintCode).text;
       // la contrainte "verifyMinHoursForCoupur" est la douziéme dans la liste des contraintes ("inVerification")
        // si la contrainte est la douziéme on fait pas le split afin d'afficher la valeur du contrainte
        if (constraintCode === 12) {
          this.updateMessage(this.constraintMessage.getValue() + constraint.contrainteMessage + '.');

        } else {
          this.updateMessage(this.constraintMessage.getValue() + constraint.contrainteMessage.split(/[0-9]+/)[0].split(':')[0] + '.');
        }
      }
    });
    if (nbConstraintDown > 1) {
      this.playAudio('PlusieursAnomalies.WAV');
    } else if (nbConstraintDown === 1) {
      this.playAudio(soundAlertPath);
    } else if (nbConstraintDown === 0) {
      this.saveAudio('Entree.WAV');
    }
    return inCheck;
  }

  private checkOutPointing(coordinations: any): boolean {
    let constrainteResult = {contrainteMessage: '', isRespected: null};
    constrainteResult = this.constraintService.verifyMinShiftDelay(coordinations);
    if (!constrainteResult.isRespected) {
      this.updateMessage(constrainteResult.contrainteMessage.split(/[0-9]+/)[0].split(':')[0] + '.')
      this.playAudio('MinShiftDelay.WAV');
    }
    return constrainteResult.isRespected;
  }


  public updateMessage(message: string): void {
    this.constraintMessage.next(message)
  }

  public getPointagesList(): Promise<PointageModel[] | never> {
    return super.getAll(this.tableName)
      .then((pointages: PointageModel[]) => {
        return pointages;
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

  public getALLPointages(): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
    });
  }

  public getdailyPointagesForCorrection(dateJourne: string): Promise<PointageModel[]> {
    if ( localStorage.getItem('TemporartSycn')) {
      return this.getdailyPointages(dateJourne);
    } else {
      localStorage.setItem('TemporartSycn', 'Done');
      return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        dateJournee: {
          in: [dateJourne]
        },
      }
    });
  }
  }

  public getPointingByEmployee(idEmployee: number): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        idEmployee: idEmployee
      }
    });
  }

  /**
   * delete pointage
   */
  public deletePointage(idFront: string) {
    return super.delete(this.tableName, idFront);
  }

  /**
   * modifier pointage
   */
  public updatePointage(pointage: PointageModel) {
    return super.update(this.tableName, pointage.idFront, pointage);
  }

  private checkInPointingAuthorized(coordinations: any): boolean {
    this.verifyAuhorizedInPointingConstraint(coordinations);
    this.sessionService.setAutorisation(false);
    return true;
  }

  private checkOutPointingAuthorized(coordinations: any): boolean {
    this.verifyAuhorizedOutPointingConstraint(coordinations);
    this.sessionService.setAutorisation(false);
    return true;
  }

  /**
   * *verification des contraintes sociales en entréé en cas d'autorisation de pointage par un manager
   * @param coordinations
   * @param validAnomalie
   */
  public async verifyAuhorizedInPointingConstraint(coordinations: any, validAnomalie = this.sessionService.getAutorisation()): Promise<void> {
    if (!this.constraintService.verifyMaxDelayPerDay(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_HEURE_MAXI_JOUR_PLANIFIE);
      const valeurDepasse = this.constraintService.verifyMaxDelayPerDay(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, -1, validAnomalie);
    }
    if (!this.constraintService.verifyValidWorkingHours(coordinations).isRespected) {
      const codeNames = [CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_APRES_HEURE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_AVANT_HEURE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_DIMANCHE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_WEEK_END, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_JOUR_FERIE];
      const valeurList = this.constraintService.verifyValidWorkingHours(coordinations).contrainteMessage.split(':').splice(1);
      this.checkingSocialConstraintsRegularlyService.addValidHoursAlerts(valeurList, codeNames, coordinations, 0, validAnomalie);
    }

    if (!this.constraintService.verifyCheckAbsenceHours(coordinations).isRespected) {
      const valeurDepasse = this.constraintService.verifyCheckAbsenceHours(coordinations).contrainteMessage.split('/')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, null, valeurDepasse, 0, validAnomalie);
    }
    if (!this.constraintService.verifyMinNightDelay(coordinations).isRespected) {
      const valeurDepasse = this.constraintService.verifyMinNightDelay(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, null, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMaxNbDayNumber(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_MAXI_JOUR_TRAVAIL_SEMAINE)
      const valeurDepasse = this.constraintService.verifyMaxNbDayNumber(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMaxNbDayNumber2(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_MAXI_JOUR_TRAVAIL_DEUX_SEMAINES_SNARR)
      const valeurDepasse = this.constraintService.verifyMaxNbDayNumber2(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMaxDelayWorkPerWeek(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_HEURE_MAXI_SEMAINE)
      const valeurDepasse = this.constraintService.verifyMaxDelayWorkPerWeek(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMaxNbShift(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_SHIFT_MAX_JOUR)
      const valeurDepasse = this.constraintService.verifyMaxNbShift(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMinPauseDelay(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.LONGUEUR_MINI_BREAK)
      const valeurDepasse = this.constraintService.verifyMinPauseDelay(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMaxDelayWorkPerMonth(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.NB_HEURE_MAXI_MOIS)
      const valeurDepasse = this.constraintService.verifyMaxDelayWorkPerMonth(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMinFreeDayAndMinWeeklyRestDays(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.JOURS_REPOS_CONS)
      const valeurDepasse = this.constraintService.verifyMinFreeDayAndMinWeeklyRestDays(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
    if (!this.constraintService.verifyMinHoursForCoupur(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES)
      const valeurDepasse = this.constraintService.verifyMinHoursForCoupur(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }

    if (!(await (this.constraintService.verifyMaxDelayWorkPerDay(coordinations))).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.AMPLITUDE_JOUR_MAX);
      const valeurDepasse = (await (this.constraintService.verifyMaxDelayWorkPerDay(coordinations))).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie);
    }
    if (!(await (this.constraintService.MaxDelayWithoutPause(coordinations))).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK);
      const valeurDepasse = (await (this.constraintService.MaxDelayWithoutPause(coordinations))).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie);
    }

  }

  public verifyAuhorizedOutPointingConstraint(coordinations: any, validAnomalie = this.sessionService.getAutorisation()): void {
    if (!this.constraintService.verifyMinShiftDelay(coordinations).isRespected) {
      const specificLoi = this.checkingSocialConstraintsRegularlyService.getSpecifiedLoi(coordinations, CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT)
      const valeurDepasse = this.constraintService.verifyMinShiftDelay(coordinations).contrainteMessage.split(':')[1];
      this.checkingSocialConstraintsRegularlyService.createAnomalie(coordinations, specificLoi, valeurDepasse, 0, validAnomalie)
    }
  }

  public clearData() {
    return super.clear(this.tableName);
  }

  private playAudio(path: string): void {
    let audio = new Audio();
    audio.volume = (this.sessionService.getVolume()/this.volumeMax);
    audio.src = '../../../../assets/audio/' + this.languageStorageService.getVocalLanguageSettings().toLowerCase() + '/' + path;
    audio.load();
    audio.loop = false;
    audio.play();
  }


  private async saveAudio(path: string): Promise<void> {
    let listMessages = await this.soundJsStoreService.getSound();
    if (listMessages.length) {
      let messageAudio = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(listMessages[0].sound));
      let audio = new Audio();
      audio.src = URL.createObjectURL(listMessages[0].sound);
      audio.volume = (this.sessionService.getVolume()/this.volumeMax);
      audio.load();
      audio.play();
    } else {
      let sound: SoundModel = new SoundModel();
      this.http.get('../../../../assets/audio/' + this.languageStorageService.getVocalLanguageSettings().toLowerCase() + '/Entree.WAV', {responseType: 'blob'})
        .subscribe(
          data => {
            let audio = new Audio();
            audio.src = URL.createObjectURL(data);
            audio.volume = (this.sessionService.getVolume()/this.volumeMax);
            audio.load();
            audio.play();
            sound.idSound = this.makeString();
            sound.sound = data;
            this.soundJsStoreService.addSound(sound);
          },
          error => {
            console.log(error);
          }
        );
    }
  }


  private downloadDataAsBase64(blob: Blob): Observable<string> {
    return this.blobToBase64(blob).pipe(
      map((b64Result: string) => {
        return b64Result;
      })
    );

  }

  private blobToBase64(blob: Blob): Observable<{}> {
    const fileReader = new FileReader();
    const observable = new Observable(observer => {
      fileReader.onloadend = () => {
        observer.next(fileReader.result);
        observer.complete();
      };
    });
    fileReader.readAsDataURL(blob);
    return observable;
  }

  /**
   * pour la verification des contraintes sociele on recupere les pointages de l'employe qui a badge
   * pour les pointages de j-1 et acheval on l'ajoute j
   * @param pointage
   * @param employe
   */
  private employeePointages(pointage: PointageModel, employe: EmployeeModel): PointageModel {
    if (pointage.idEmployee === employe.idEmployee) {
      if (pointage.dateJournee === this.dateService.getYesterDay(this.sessionService.getDateJournee()) && pointage.isAcheval) {
        pointage.dateJournee = this.sessionService.getDateJournee();
      }
      return pointage;
    }
  }


  public async deleteAllPointageWithoutHeureFin(dateJournee: string): Promise<void> {
    const date = this.dateService.initializeDate(new Date(dateJournee));
    const pointageList = await this.planningJsStore.getAllPointage();
    if (pointageList.length) {
      pointageList.forEach(pointage => {
        const d = this.dateService.initializeDate(new Date(pointage.dateJournee));
        if (this.dateService.isEquals(d, date) && !pointage.heureFin) {
          super.delete(NameOfTable.POINTAGE, pointage.idFront);
        }
      });
    }
  }
}

