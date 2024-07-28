import {Injectable} from '@angular/core';
import {ValidationContrainteSocialeModel} from '../model/validationContrainteSociale.model';
import {EmployeeModel} from '../model/employee.model';
import {LoiPaysModel} from '../model/loi.pays.model';
import {CodeNameContrainteSocial} from '../enumration/codeNameContrainteSocial';
import {PointageModel} from '../model/pointage.model';
import {DateService} from './date.service';
import {JourSemaine} from '../enumration/jour.semaine';
import {JourFeriesModel} from '../model/jourFeries.model';
import {RestaurantModel} from '../model/restaurant.model';
import {EmployeeCoordinations} from '../model/employeCoordinations.model';
import {RhisTranslateService} from './rhis-translate.service';
import * as moment from "moment";
import {SessionService} from "./session.service";
import {DecoupageHoraireModel} from "../model/decoupage.horaire.model";
import {DecoupageHoraireJsStoreService} from "./JsStoreServices/decoupageHoraireJsStore.service";
import {DetailEvenement} from "../model/DetailEvenement.model";
import {AbsenceCongeModel} from "../model/absence.conge.model";
import {DateInterval} from "../model/gui/date-interval";
import {ParameterJsStoreService} from "./JsStoreServices/parameter-js-store.service";


@Injectable({
  providedIn: 'root'
})
export class ContrainteSocialeService {
  private firstRestaurantDay: JourSemaine;
  private heureDebutWeekEnd: Date;
  private heureFinWeekEnd: Date;
  private jourDebutWeekEnd: JourSemaine;
  private jourFinWeekEnd: JourSemaine;
  private joursFeries: JourFeriesModel[];
  private now: Date;
  private minBeforeCoupure = 0;


  constructor(private dateService: DateService,
              private sessionService: SessionService,
              private rhisTranslateService: RhisTranslateService,
              private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService,
              private parameterJsStoreService: ParameterJsStoreService
  ) {
  }

  private validContrainte(realValue: any, loi: LoiPaysModel, tempsTravailPartiel: boolean, majeur: boolean): { isValidated: boolean, loiValue: any } {
    let loiValue: number;
    if (loi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
      if (tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue >= (loiValue = +loi.valeurMajeurTempsPartiel) : realValue >= (loiValue = +loi.valeurMineurTempsPartiel),
          loiValue: loiValue
        };
      } else if (!tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue >= (loiValue = +loi.valeurMajeurTempsPlein) : realValue >= (loiValue = +loi.valeurMineurTempsPlein),
          loiValue: loiValue
        };
      }
    } else if (loi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
      if (tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue <= (loiValue = +loi.valeurMajeurTempsPartiel) : realValue <= (loiValue = +loi.valeurMineurTempsPartiel),
          loiValue: loiValue
        };
      } else if (!tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue <= (loiValue = +loi.valeurMajeurTempsPlein) : realValue <= (loiValue = +loi.valeurMineurTempsPlein),
          loiValue: loiValue
        };
      }
    }
  }

  /**
   * Compare realValue with the result of the execution of the function ``fn`` based on ``tempsTravailPartiel``, ``majeur`` and ``ValidationContrainteSocialeModel``
   * @param: realValue
   * @param: loi
   * @param: tempsTravailPartiel: determine if the employee has ``part-time work``
   * @param: majeur: determine if the employee is ``old`` or not
   * @param: fn : a reference to a function to be passed in call statement
   */
  private validContrainteWithTreatment(realValue: any, loi: LoiPaysModel, tempsTravailPartiel: boolean,
                                       majeur: boolean, fn: (param: string) => number): { isValidated: boolean, loiValue: number } {
    let loiValue: number;
    if (loi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
      if (tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue >= (loiValue = fn(loi.valeurMajeurTempsPartiel)) : realValue >= (loiValue = fn(loi.valeurMineurTempsPartiel)),
          loiValue: loiValue
        };
      } else if (!tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue >= (loiValue = fn(loi.valeurMajeurTempsPlein)) : realValue >= (loiValue = fn(loi.valeurMineurTempsPlein)),
          loiValue: loiValue
        };
      }
    } else if (loi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
      if (tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue <= (loiValue = fn(loi.valeurMajeurTempsPartiel)) : realValue <= (loiValue = fn(loi.valeurMineurTempsPartiel)),
          loiValue: loiValue
        };
      } else if (!tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue <= (loiValue = fn(loi.valeurMajeurTempsPlein)) : realValue <= (loiValue = fn(loi.valeurMineurTempsPlein)),
          loiValue: loiValue
        };
      }
    }
  }

  /**
   * Compare realValue with the result of the execution of the function ``fn`` based on ``tempsTravailPartiel``, ``majeur`` and ``ValidationContrainteSocialeModel``
   * Outside constraint limit
   * @param: realValue
   * @param: loi
   * @param: tempsTravailPartiel: determine if the employee has ``part-time work``
   * @param: majeur: determine if the employee is ``old`` or not
   * @param: fn : a reference to a function to be passed in call statement
   */
  private validContrainteWithTreatmentOutSideLimit(realValue: any, loi: LoiPaysModel, tempsTravailPartiel: boolean,
                                                   majeur: boolean, fn: (param: string) => number): { isValidated: boolean, loiValue: number } {
    let loiValue: number;
    if (loi.validationContrainteSociale === ValidationContrainteSocialeModel.INFERIEUR) {
      if (tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue >= (loiValue = fn(loi.valeurMajeurTempsPartiel)) : realValue >= (loiValue = fn(loi.valeurMineurTempsPartiel)),
          loiValue: loiValue
        };
      } else if (!tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue >= (loiValue = fn(loi.valeurMajeurTempsPlein)) : realValue >= (loiValue = fn(loi.valeurMineurTempsPlein)),
          loiValue: loiValue
        };
      }
    } else if (loi.validationContrainteSociale === ValidationContrainteSocialeModel.SUPERIEUR) {
      if (tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue <= (loiValue = fn(loi.valeurMajeurTempsPartiel)) : realValue <= (loiValue = fn(loi.valeurMineurTempsPartiel)),
          loiValue: loiValue
        };
      } else if (!tempsTravailPartiel) {
        return {
          isValidated: majeur ? realValue <= (loiValue = fn(loi.valeurMajeurTempsPlein)) : realValue <= (loiValue = fn(loi.valeurMineurTempsPlein)),
          loiValue: loiValue
        };
      }
    }
  }

  /**
   * recupere param MINBEFORCOUPURE
   */
  public async getParamMinBeforeCoupure(): Promise<void> {
    const param = await this.parameterJsStoreService.getParamatreByParam('MINBEFORCOUPURE');
    if (param && param[0] && param[0].valeur) {
      this.minBeforeCoupure = +param[0].valeur;
    }
  }
  public async setParameters(restaurantInfos: RestaurantModel): Promise<void> {
    // this.now = this.dateService.createDateFromTime(this.sessionService.getDateJournee(), this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':'), await this.checkIsNight(new Date(), new Date(this.sessionService.getDateJournee())) === true ? 1 : 0 );
    this.now = new Date(this.sessionService.getIsTimePointerEntreeSortie());
    this.firstRestaurantDay = restaurantInfos.parametreNationaux.premierJourSemaine;
    this.heureDebutWeekEnd = restaurantInfos.parametreNationaux.heureDebutWeekend;
    this.heureFinWeekEnd = restaurantInfos.parametreNationaux.heureFinWeekend;
    this.jourDebutWeekEnd = restaurantInfos.parametreNationaux.premierJourWeekend;
    this.jourFinWeekEnd = restaurantInfos.parametreNationaux.dernierJourWeekend;
    this.joursFeries = restaurantInfos.jourFeriesRefs;
    await this.getParamMinBeforeCoupure();
  }

  public verifyMaxNbDayNumber(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const previousDatesFromFirstRestaurantWeekDay = this.dateService.getNumberOfDaysFromRestaurantFirstWeekDay(this.firstRestaurantDay, this.sessionService.getDateJournee());
    const data = this.checkConsecutiveWorkDaysByContstraintCode(previousDatesFromFirstRestaurantWeekDay, CodeNameContrainteSocial.NB_MAXI_JOUR_TRAVAIL_SEMAINE, coordinations);
    const message = this.rhisTranslateService.translate('ANOMALIE.MAX_WEEK_DAY') + data.loiValue;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  // todo (see reference document)
  public verifyMaxNbDayNumber2(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const previousDatesFromFirstRestaurantWeekDay = this.dateService.getNumberOfDaysFromRestaurantFirstWeekDay(this.firstRestaurantDay, this.sessionService.getDateJournee(), 7);
    const data = this.checkConsecutiveWorkDaysByContstraintCode(previousDatesFromFirstRestaurantWeekDay, CodeNameContrainteSocial.NB_MAXI_JOUR_TRAVAIL_DEUX_SEMAINES_SNARR, coordinations);
    const message = this.rhisTranslateService.translate('ANOMALIE.SNARR') + previousDatesFromFirstRestaurantWeekDay;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  /**
   * Verify MaxDelayPerDay constraints
   * @param: coordination
   */
  public verifyMaxDelayPerDay(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.NB_HEURE_MAXI_JOUR_PLANIFIE);
    const totalEstimatedPointingInMinute = this.getTotalWorkHoursFor(coordinations, [this.dateService.getCorrectDateJournee()]);
    const data = this.validContrainteWithTreatment(totalEstimatedPointingInMinute,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber);
    const message = this.rhisTranslateService.translate('ANOMALIE.WORKING_HOURS') + totalEstimatedPointingInMinute;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  /**
   * verify MaxDelayWorkPerDay
   * @param coordinations
   */
  public async verifyMaxDelayWorkPerDay(coordinations: EmployeeCoordinations): Promise<{ contrainteMessage: string, isRespected: boolean }> {
    let amplitude;
    if (coordinations.pointageToUpdate) {
      amplitude = await this.calculateamplitudeForModifiedByManager(coordinations);
    } else {
      amplitude = this.getDailyAmplitude(coordinations);
    }
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.AMPLITUDE_JOUR_MAX);

    if (!coordinations.isCurrent && !coordinations.pointageToUpdate) {
      amplitude = this.getDailyAmplitudePlusMinShift(coordinations);
    }

    const data = this.validContrainteWithTreatment(amplitude, specificLoi, coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber)
    const message = this.rhisTranslateService.translate('ANOMALIE.AMPLITUDE_MESSAGE') + amplitude;

    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  /**
   * permet de calculer l'amplitude journaliére d'un employé
   * @param coordinations
   */
  private getDailyAmplitude(coordinations: EmployeeCoordinations): number {
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], coordinations.pointages);
    const sortedPointings = this.sortPointingChronologically(completePointings);
    if (sortedPointings.length > 0) {
      const lastPointing = this.dateService.createDateFromTime(sortedPointings[0].dateJournee, sortedPointings[0].heureFin, sortedPointings[0].heureFinIsNight ? 1 : 0);
      const firstPointing = this.dateService.createDateFromTime(sortedPointings[sortedPointings.length - 1].dateJournee, sortedPointings[sortedPointings.length - 1].heureDebut, sortedPointings[sortedPointings.length - 1].heureDebutIsNight ? 1 : 0);
      return Math.trunc(this.dateService.getDiffOn(lastPointing, firstPointing, 'minute'));
    } else {
      return 0;
    }
  }

  private async calculateamplitudeForModifiedByManager(coordinations: EmployeeCoordinations): Promise<number> {
    const listPointage: PointageModel[] = [];
    if (coordinations.pointageToUpdate.heureDebut != null && coordinations.pointageToUpdate.heureFin != null) {
      listPointage.push(coordinations.pointageToUpdate);
      listPointage.push.apply(listPointage, coordinations.pointages);
    } else if (coordinations.pointageToUpdate.heureFin == null) {
      const currentPointing = {...coordinations.pointageToUpdate};
      currentPointing.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(this.sessionService.getIsTimePointerEntreeSortie()), ':');
      currentPointing.heureFinIsNight = await this.checkIsNight(new Date(), this.dateService.getCorrectDateJournee());
      listPointage.push(currentPointing);
      listPointage.push.apply(listPointage, coordinations.pointages);
    }
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], listPointage);
    const sortedPointings = this.sortPointingChronologically(completePointings);
    if (sortedPointings.length > 0) {
      const lastPointing = this.dateService.createDateFromTime(sortedPointings[0].dateJournee, sortedPointings[0].heureFin, sortedPointings[0].heureFinIsNight ? 1 : 0);
      const firstPointing = this.dateService.createDateFromTime(sortedPointings[sortedPointings.length - 1].dateJournee, sortedPointings[sortedPointings.length - 1].heureDebut, sortedPointings[sortedPointings.length - 1].heureDebutIsNight ? 1 : 0);
      return Math.trunc(this.dateService.getDiffOn(lastPointing, firstPointing, 'minute'));
    } else {
      return 0;
    }
  }

  /**
   * permet de calculer l'amplitude journaliére d'un employé avec un nouveau shift
   * @param coordinations
   */
  private getDailyAmplitudePlusMinShift(coordinations: EmployeeCoordinations): number {
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], coordinations.pointages);
    const sortedPointings = this.sortPointingChronologically(completePointings);
    const minShift = this.getConstraintValueByCodeName(CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, coordinations.employee.loiPointeuse,
      coordinations.employee.hebdoCourant >= 35, coordinations.employee.majeur);

    const heureFin = this.dateService.createDatePlusHHmmTime(new Date(), minShift);
    if (sortedPointings.length > 0) {
      const firstPointing = this.dateService.createDateFromTime(sortedPointings[0].dateJournee, sortedPointings[0].heureDebut, sortedPointings[0].heureDebutIsNight ? 1 : 0);
      return Math.trunc(this.dateService.getDiffOn(heureFin, firstPointing, 'minute'));
    } else {
      return 0;
    }
  }
  public verifyMaxDelayWithNight(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.GAMME_MAX_JOUR_HEURE_NUIT);
    const heureLimitReposValue = this.getConstraintValueByCodeName(CodeNameContrainteSocial.HEURE_LIMITE_CALCUL_DU_REPOS, coordinations.employee.loiPointeuse,
      coordinations.employee.hebdoCourant >= 35, coordinations.employee.majeur);
    const amplitude = this.getDailyAmplitude(coordinations);

    if (moment(heureLimitReposValue).isValid()) {
      if (this.dateService.isBeforeInHoursAndMinutes(heureLimitReposValue, this.currentShiftNow(coordinations))) {
        const data = this.validContrainteWithTreatment(amplitude, specificLoi, coordinations.employee.hebdoCourant < 35,
          coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber)
        const message = this.rhisTranslateService.translate('ANOMALIE.AMPLITUDE_NIGHT_HOURS') + amplitude;
        return {contrainteMessage: message, isRespected: data.isValidated};
      } else {
        return {contrainteMessage: '', isRespected: true};
      }
    } else {
      return {contrainteMessage: '', isRespected: true};
    }

  }

  /**
   * Verify MaxDelayWorkPerWeek constraints
   * @param: coordinations
   */
  public verifyMaxDelayWorkPerWeek(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.NB_HEURE_MAXI_SEMAINE);
    let dates = [this.dateService.getCorrectDateJournee()];
    const previousDatesFromFirstRestaurantWeekDay = this.dateService.getNumberOfDaysFromRestaurantFirstWeekDay(this.firstRestaurantDay, this.sessionService.getDateJournee());
    dates = dates.concat(previousDatesFromFirstRestaurantWeekDay);
    const totalEstimatedPointingInMinute = this.getTotalWorkHoursFor(coordinations, dates);
    const data = this.validContrainteWithTreatment(totalEstimatedPointingInMinute,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber);
    const message = this.rhisTranslateService.translate('ANOMALIE.WEEKLY_WORKING_hours') + totalEstimatedPointingInMinute;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  /**
   *
   * verify (DelayWithoutPause) Longueur maximum d’un shift sans break
   * @param coordinations
   * @constructor
   */
  public async MaxDelayWithoutPause(coordinations: EmployeeCoordinations): Promise<{ contrainteMessage: string, isRespected: boolean }> {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK);
    let currentShift = {};
    if (coordinations.pointageToUpdate) {
      currentShift = await this.currentShiftLengthForUpdatePointageByManager(coordinations);
    } else {
      currentShift = this.currentShiftLength(coordinations);
    }
    const data = this.validContrainteWithTreatment(currentShift,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber);
    const message = this.rhisTranslateService.translate('ANOMALIE.MAX_SHIFT_LENGTH') + currentShift;
    return {contrainteMessage: message, isRespected: data.isValidated};

  }

  private currentShiftLength(coordinations: EmployeeCoordinations): number {
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], coordinations.pointages);
    const sortedPointings = this.sortPointingChronologically(completePointings);
    return sortedPointings.length > 0 ? sortedPointings[0].tempsPointes : 0;
  }

  private async currentShiftLengthForUpdatePointageByManager(coordinations: EmployeeCoordinations): Promise<number> {
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], coordinations.pointages);
    if (coordinations.pointageToUpdate.heureDebut != null && coordinations.pointageToUpdate.heureFin != null) {
      completePointings.push(coordinations.pointageToUpdate);
    } else if (coordinations.pointageToUpdate.heureFin == null) {
      const currentPointing = {...coordinations.pointageToUpdate};
      currentPointing.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(this.sessionService.getIsTimePointerEntreeSortie()), ':');
      currentPointing.heureFinIsNight = await this.checkIsNight(new Date(), this.dateService.getCorrectDateJournee());
      currentPointing.tempsPointes = this.dateService.getTotalMinutes( <DateInterval> currentPointing );
      completePointings.push(currentPointing);
    }
    const sortedPointings = this.sortPointingChronologically(completePointings);
    return sortedPointings.length > 0 ? sortedPointings[0].tempsPointes : 0;
  }

  public currentShiftNow(coordinations: EmployeeCoordinations): string | Date {
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], coordinations.pointages);
    const sortedPointings = this.sortPointingChronologically(completePointings);
    return sortedPointings.length > 0 ? sortedPointings[0].heureFin : null;
  }

  public currentShiftId(coordinations: EmployeeCoordinations): string {
    const completePointings = this.getTerminatedPointings([this.dateService.getCorrectDateJournee()], coordinations.pointages);
    const sortedPointings = this.sortPointingChronologically(completePointings);
    return sortedPointings.length > 0 ? sortedPointings[0].idFront : null;
  }

  /**
   * verify MaxDelayWorkPerMonth
   * @param: coordinations
   */
  public verifyMaxDelayWorkPerMonth(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.NB_HEURE_MAXI_MOIS);
    const totalEstimatedPointingInMinute = this.getTotalEstimatedWorkHoursInCurentMonth(coordinations);
    const data = this.validContrainteWithTreatment(totalEstimatedPointingInMinute,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber);
    const message = this.rhisTranslateService.translate('ANOMALIE.MAX_WORK_MONTH') + totalEstimatedPointingInMinute;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  public verifyMinHoursForCoupur(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    let diffFromLastPointing;
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.CONTRAT_MIN_SANS_COUPURES);
    if (coordinations.pointages.length) {
      const lastPointing = this.getLastPointing([...coordinations.pointages.filter(pointage => pointage.dateJournee === this.sessionService.getDateJournee())]);
      if (!lastPointing) {
        return {contrainteMessage: '', isRespected: true};
      }
      if (coordinations.pointageToUpdate) {
        const lastPointageHeureDebut = this.dateService.createDateFromHourAndNightValue(new Date(`${coordinations.pointageToUpdate.dateJournee} ${coordinations.pointageToUpdate.heureDebut}`), coordinations.pointageToUpdate.heureDebutIsNight);
        const previousPointageEndHour = this.dateService.createDateFromHourAndNightValue(new Date(`${lastPointing.dateJournee} ${lastPointing.heureFin}`), lastPointing.heureFinIsNight);
        diffFromLastPointing = Math.trunc(this.dateService.getDiffOn(lastPointageHeureDebut, previousPointageEndHour, 'minute'));
      } else {
        diffFromLastPointing = this.dateService.getDiffOn(this.dateService.setTimeFormatHHMM(this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':'))
          , this.dateService.createDateFromTime(this.now, lastPointing.heureFin), 'minutes');
      }
      const data = this.validContrainteWithTreatmentOutSideLimit(coordinations.employee.hebdoCourant * 60,
        specificLoi,
        coordinations.employee.hebdoCourant < 35,
        coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber);
      if (!data.isValidated) {
        if (diffFromLastPointing > this.minBeforeCoupure) {
          const message =  this.rhisTranslateService.translate('ANOMALIE.NB_COUPURE_SEMAINE') + '0';
          return {contrainteMessage: message, isRespected: data.isValidated};
        }
      } else {
       return  this.verifyMaxCoupurPerWeek(coordinations);
      }
    }
    return {contrainteMessage: '', isRespected: true};
  }

  /**
   * Verify MaxCoupurPerWeek constraints
   * @param: coordinations
   */
  public verifyMaxCoupurPerWeek(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.NB_COUPURE_SEMAINE);
    let dates = [this.dateService.getCorrectDateJournee()];
    const previousDatesFromFirstRestaurantWeekDay = this.dateService.getNumberOfDaysFromRestaurantFirstWeekDay(this.firstRestaurantDay, this.sessionService.getDateJournee());
    dates = dates.concat(previousDatesFromFirstRestaurantWeekDay);
    const totalCoupureInWeek = this.getTotalCoupurInWeek(coordinations, dates);
    const data = this.validContrainte(totalCoupureInWeek,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur);
    const message = this.rhisTranslateService.translate('ANOMALIE.NB_COUPURE_SEMAINE') + data.loiValue;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  /**
   * verify min night delay
   * @param: coordination
   */
  public verifyMinNightDelay(coordination: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    if (coordination.pointages && (coordination.pointages.length === 0)) {
      return {contrainteMessage: '', isRespected: true};
    }
    let differenceInMinutes: number;
    let lastPointing: PointageModel;
    const orderedPointages: PointageModel[] = this.sortPointingChronologically(coordination.pointages);
    let isFirstPointageInCurrentDay: boolean;
    if (coordination.pointageToUpdate) {
      const firstPointageInCurrentDay = this.getFirstPointageOnDate(coordination.pointages, this.dateService.getCorrectDateJournee());
      isFirstPointageInCurrentDay = (firstPointageInCurrentDay === null) || this.dateService.isSameOrBeforeByDayTimeAndIsNight(<DateInterval>coordination.pointageToUpdate, <DateInterval>firstPointageInCurrentDay);
    } else {
      isFirstPointageInCurrentDay = !this.dateService.isSameDateOn(orderedPointages[0].dateJournee, this.sessionService.getDateJournee(), 'day');
    }
    const yesterdayDateJournee: Date = this.dateService.substractDayFrom(1, this.sessionService.getDateJournee(), 'day');
    lastPointing = this.getLastPointageOnDate(coordination.pointages, yesterdayDateJournee);

    if (isFirstPointageInCurrentDay && lastPointing) {
      const heureLimitReposValue = this.getConstraintValueByCodeName(CodeNameContrainteSocial.HEURE_LIMITE_CALCUL_DU_REPOS, coordination.employee.loiPointeuse,
        coordination.employee.hebdoCourant >= 35, coordination.employee.majeur);
      const isTerminatedBeforeHeureLimitRepos: boolean = this.dateService.isBeforeInHoursAndMinutes(
        lastPointing.heureFin, heureLimitReposValue, lastPointing.heureFinIsNight);
      const specificLoi: LoiPaysModel = coordination.employee.loiPointeuse.find((loi: LoiPaysModel) =>
        loi.codeName === CodeNameContrainteSocial[
          isTerminatedBeforeHeureLimitRepos ? CodeNameContrainteSocial.HEURE_REPOS_MIN_ENTRE_DEUX_JOURS : CodeNameContrainteSocial.HEURE_REPOS_MIN_ENTRE_DEUX_JOURS_SI_APRES_LIMIT
          ]);
      if (coordination.pointageToUpdate) {
        differenceInMinutes = this.getDiffTimeFromDateForPointingEndHourAndOn(this.dateService.createDateFromTime(coordination.pointageToUpdate.dateJournee, coordination.pointageToUpdate.heureDebut, coordination.pointageToUpdate.heureDebutIsNight ? 1 : 0), lastPointing, 'minutes');
      } else {
        differenceInMinutes = this.getDiffTimeFromDateForPointingEndHourAndOn(this.now, lastPointing, 'minutes');
      }
      const data = this.validContrainteWithTreatment(differenceInMinutes,
        specificLoi,
        coordination.employee.hebdoCourant < 35,
        coordination.employee.majeur, this.dateService.HHmmTimeStringToNumber);
      const message = this.rhisTranslateService.translate('ANOMALIE.REST_HOURS') + differenceInMinutes;
      return {contrainteMessage: message, isRespected: data.isValidated};
    }
    return {contrainteMessage: '', isRespected: true};
  }

  private sortPointingChronologically(pointings: PointageModel[]): PointageModel[] {
    const sortedPointing = [...pointings];
    sortedPointing.sort((p1, p2) => {
      let date1: Date;
      let date2: Date;
      date1 = this.dateService.createDateFromTime(p1.dateJournee, p1.heureDebut, p1.heureDebutIsNight ? 1 : 0);
      date2 = this.dateService.createDateFromTime(p2.dateJournee, p2.heureDebut, p2.heureDebutIsNight ? 1 : 0);
      return this.dateService.sortDates(date1, date2);
    });
    return sortedPointing;
  }

  private sortPointingForCalculeCoupure(pointings: PointageModel[]): PointageModel[] {
    const sortedPointing = [...pointings];
    sortedPointing.sort((p1, p2) => {
      let date1: Date;
      let date2: Date;
      date1 = this.dateService.createDateFromTime(p1.dateJournee, p1.heureDebut, p1.heureDebutIsNight ? 1 : 0);
      date2 = this.dateService.createDateFromTime(p2.dateJournee, p2.heureDebut, p2.heureDebutIsNight ? 1 : 0);
      return this.dateService.sortDates(date2, date1);
    });
    return sortedPointing;
  }

  public verifyMaxNbShift(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    if (coordinations.pointageToUpdate) {
      const index = coordinations.pointages.findIndex((pointage: PointageModel) => pointage.idFront === coordinations.pointageToUpdate.idFront);
      if (index !== -1) {
        coordinations.pointages.splice(index, 1);
      }
    }
    let currentDaySortedTerminatedPointing = this.getTerminatedPointings(
      [this.dateService.getCorrectDateJournee()], coordinations.pointages);
    currentDaySortedTerminatedPointing = this.sortPointingChronologically(currentDaySortedTerminatedPointing);
    currentDaySortedTerminatedPointing = currentDaySortedTerminatedPointing.reverse();
    const breakLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK);
    let nbShifts = 1;
    if (currentDaySortedTerminatedPointing.length === 0) {
      nbShifts++;
    } else if (currentDaySortedTerminatedPointing.length === 1) {
      nbShifts = this.incrementNbShiftIfBreakOutdated(this.now, currentDaySortedTerminatedPointing[0], breakLoi, coordinations, nbShifts);
    } else {
      let i = -1;
      do {
        i++;
        const firstPointing = currentDaySortedTerminatedPointing[i];
        const secondPointing = currentDaySortedTerminatedPointing[i + 1];
        const secondPointingStartDate = this.dateService.createDateFromTime(
          secondPointing.dateJournee, secondPointing.heureDebut, secondPointing.heureDebutIsNight ? 1 : 0);
        nbShifts = this.incrementNbShiftIfBreakOutdated(secondPointingStartDate, firstPointing, breakLoi, coordinations, nbShifts);
      } while ((i + 2) < currentDaySortedTerminatedPointing.length);
      if (!coordinations.pointageToUpdate) {
        nbShifts = this.incrementNbShiftIfBreakOutdated(
          this.now, currentDaySortedTerminatedPointing[currentDaySortedTerminatedPointing.length - 1], breakLoi, coordinations, nbShifts
        );
      }
    }
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.NB_SHIFT_MAX_JOUR);
    if (coordinations.pointageToUpdate && currentDaySortedTerminatedPointing.length > 1) {
      const toUpdateStartTime = this.dateService.createDateFromTime(
        coordinations.pointageToUpdate.dateJournee, coordinations.pointageToUpdate.heureDebut, coordinations.pointageToUpdate.heureDebutIsNight ? 1 : 0);
      nbShifts = this.incrementNbShiftIfBreakOutdated(
        toUpdateStartTime, currentDaySortedTerminatedPointing[currentDaySortedTerminatedPointing.length - 1], breakLoi, coordinations, nbShifts
      );
    }
    const data = this.validContrainte(nbShifts,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur);
    const message = this.rhisTranslateService.translate('ANOMALIE.MAX_SHIFT') + nbShifts;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  public verifyValidWorkingHours(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    if (coordinations.pointageToUpdate) {
      this.now = this.dateService.createDateFromTime(coordinations.pointageToUpdate.dateJournee, coordinations.pointageToUpdate.heureDebut,
        coordinations.pointageToUpdate.heureDebutIsNight ? 1 : 0);
    }
    const codeNames = [CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_APRES_HEURE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_AVANT_HEURE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_DIMANCHE, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_WEEK_END, CodeNameContrainteSocial.COLLABORATEUR_TRAVAIL_JOUR_FERIE];

    const [afterHourConstraint, beforeHourConstraint, sundayWorkingConstraint, workInWeekendConstraint, workInHolidaysConstraint] =
      this.getConstraintsValueByCodeNames(codeNames, coordinations.employee.loiPointeuse, coordinations.employee.hebdoCourant >= 35, coordinations.employee.majeur);
    const minShiftDateFromNow = this.getDatePlusMinShift(coordinations, this.now);
    let afterHourVerification: boolean;
    let beforeHourVerification: boolean;
    if (coordinations.isCurrent) {
      beforeHourVerification = !this.isAnyValueAccepted(beforeHourConstraint) ? this.verifyBeforeHourConstraint(this.dateService.createDateFromTime(this.sessionService.getDateJournee(), beforeHourConstraint), this.currentShiftNow(coordinations)) : true;
      afterHourVerification = !this.isAnyValueAccepted(afterHourConstraint) ? !this.verifyBeforeHourConstraint(this.dateService.createDateFromTime(this.sessionService.getDateJournee(), afterHourConstraint), this.currentShiftNow(coordinations)) : true;
    } else {
      beforeHourVerification = !this.isAnyValueAccepted(beforeHourConstraint) ? this.verifyBeforeHourConstraint(this.dateService.createDateFromTime(this.sessionService.getDateJournee(), beforeHourConstraint), this.now) : true;
      afterHourVerification = !this.isAnyValueAccepted(afterHourConstraint) ? !this.verifyBeforeHourConstraint(this.dateService.createDateFromTime(this.sessionService.getDateJournee(), afterHourConstraint), minShiftDateFromNow) : true;
    }

    // sunday work constraint verification
    const sundayVerification: boolean = this.sessionService.getJournee() === 'DIMANCHE' ? this.isTrueBooleanFromString(sundayWorkingConstraint) : true;
    // weekend work constraint verification
    let weekendVerification = true;
    if (!this.isTrueBooleanFromString(workInWeekendConstraint)) {
      let startWeekendDate = this.dateService.getDateOfJourSemaineByRestaurantFirstDayAndCurrentDate(this.firstRestaurantDay,
        this.sessionService.getDateJournee(), this.jourDebutWeekEnd);
      startWeekendDate = this.dateService.createDateFromTime(startWeekendDate, this.heureDebutWeekEnd);
      let endWeekendDate = this.dateService.getDateOfJourSemaineByRestaurantFirstDayAndCurrentDate(this.firstRestaurantDay,
        this.sessionService.getDateJournee(), this.jourFinWeekEnd);
      endWeekendDate = this.dateService.createDateFromTime(endWeekendDate, this.heureFinWeekEnd);
      if (this.dateService.isSameOrBefore(endWeekendDate, startWeekendDate)) {
        endWeekendDate.setDate(endWeekendDate.getDate() + 7);
      }
      weekendVerification = !this.dateService.isIntersect([this.now, minShiftDateFromNow], [startWeekendDate, endWeekendDate]);
    }
    // holidays work constraint verification
    let holidayVerification = true;
    if (!this.isTrueBooleanFromString(workInHolidaysConstraint)) {
      const isTodayHoliday: boolean = this.joursFeries.some((j: JourFeriesModel) => this.dateService.isSameDateOn(j.dateFeries, this.now, 'days'));
      holidayVerification = !isTodayHoliday;
    }
    let message = '';
    if (!afterHourVerification) {
      message = message + this.rhisTranslateService.translate('ANOMALIE.AFTER');
    }
    if (!beforeHourVerification) {
      message = message + this.rhisTranslateService.translate('ANOMALIE.BEFORE');
    }
    if (!sundayVerification) {
      message = message + this.rhisTranslateService.translate('ANOMALIE.SUNDAY');
    }
    if (!weekendVerification) {
      message = message + this.rhisTranslateService.translate('ANOMALIE.WEEKEND');
    }
    if (!holidayVerification) {
      message = message + this.rhisTranslateService.translate('ANOMALIE.HOLYDAY');
    }
    message = message + ' :' + afterHourVerification + ':' + beforeHourVerification + ':' + sundayVerification + ':' + weekendVerification + ':' + holidayVerification;
    return {
      contrainteMessage: message,
      isRespected: afterHourVerification && beforeHourVerification && sundayVerification && weekendVerification && holidayVerification
    };
  }

  private verifyBeforeHourConstraint(beforeHourConstraint: Date, date: Date | string): boolean {
    return moment(beforeHourConstraint).isBefore(date);
  }

  private getBorderPointages(target: PointageModel, pointages: PointageModel[]): [PointageModel, PointageModel] {
    if (pointages && pointages.length >= 1) {
      const asc = this.sortPointingChronologically(pointages).reverse();
      const next = target.heureFin ? asc.find(pointage => this.dateService.isSameOrBeforeByDayTimeAndIsNight(<DateInterval>target, <DateInterval>pointage)) : null;
      const desc = this.sortPointingChronologically(pointages);
      let previous = desc.find(pointage => pointage.isAcheval && pointage.dateJournee === this.sessionService.getDateJournee() && this.dateService.isSameOrBeforeByDayTimeAndIsNightAcheval(pointage as DateInterval, target as DateInterval));
      if (!previous) {
        // tslint:disable-next-line:max-line-length
        previous = desc.find(pointage => this.dateService.isSameOrBeforeByDayTimeAndIsNight(<DateInterval>pointage, <DateInterval>target));
      }
      return [previous, next];
    } else {
      return [null, null];
    }
  }

  public verifyMinPauseDelay(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    if (coordinations.pointageToUpdate) {
      return this.verifyMinPauseDelayDoneByManager(coordinations);
    } else {
      return this.verifyMinPauseDelayDoneByEmployee(coordinations);
    }
  }

  private verifyMinPauseDelayDoneByEmployee(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const previousExitPointing = this.getLastPointing(coordinations.pointages);
    if (previousExitPointing) {
      let differenceTimeFromNowInMinutes = this.getDiffTimeFromDateForPointingEndHourAndOn(this.now, previousExitPointing, 'minutes');
      const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
        loi.codeName === CodeNameContrainteSocial.LONGUEUR_MINI_BREAK);
      const data = this.validContrainteWithTreatment(differenceTimeFromNowInMinutes,
        specificLoi,
        coordinations.employee.hebdoCourant < 35,
        coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber);
      const message = this.rhisTranslateService.translate("ANOMALIE.MIN_BREAK") + differenceTimeFromNowInMinutes;
      return {contrainteMessage: message, isRespected: data.isValidated};
    } else {
      return {contrainteMessage: '', isRespected: true};
    }
  }

  public verifyMinPauseDelayDoneByManager(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const indexOfUpdatedPointage = coordinations.pointages.findIndex(value => value.idFront === coordinations.pointageToUpdate.idFront);
    if (indexOfUpdatedPointage !== -1) {
      coordinations.pointages.splice(indexOfUpdatedPointage, 1);
    }
    let [previousPointage, nextPointage] = this.getBorderPointages(coordinations.pointageToUpdate, coordinations.pointages);
    if (previousPointage || nextPointage) {

      const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
        loi.codeName === CodeNameContrainteSocial.LONGUEUR_MINI_BREAK);

      let startHourDiff = previousPointage ? this.dateService.getDiffInMinuteBetweenIntervals(<DateInterval>previousPointage, <DateInterval>coordinations.pointageToUpdate, 'minutes') : null;
      const previousPointageResult = previousPointage ? this.validContrainteWithTreatment(startHourDiff, specificLoi, coordinations.employee.hebdoCourant < 35,
        coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber) : null;

      let endHourDiff = nextPointage ? this.dateService.getDiffInMinuteBetweenIntervals(<DateInterval>coordinations.pointageToUpdate, <DateInterval>nextPointage, 'minutes') : null;
      const nextPointageResult = nextPointage ? this.validContrainteWithTreatment(endHourDiff, specificLoi, coordinations.employee.hebdoCourant < 35,
        coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber) : null;

      const message = this.rhisTranslateService.translate("ANOMALIE.MIN_BREAK") + (previousPointage ? startHourDiff : endHourDiff);
      let validation = true;
      if (previousPointageResult) {
        validation = validation && previousPointageResult.isValidated;
      }
      if (nextPointageResult) {
        validation = validation && nextPointageResult.isValidated;
      }
      return {
        contrainteMessage: message,
        isRespected: validation
      };
    } else {
      return {contrainteMessage: '', isRespected: true};
    }
  }

  public verifyMinFreeDayAndMinWeeklyRestDays(coordinations: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    const isReposConsecutive = this.getConstraintValueByCodeName(CodeNameContrainteSocial.JOURS_REPOS_CONS, coordinations.employee.loiPointeuse,
      coordinations.employee.hebdoCourant >= 35, coordinations.employee.majeur);
    const previousDatesFromFirstRestaurantWeekDay = this.dateService.getNumberOfDaysFromRestaurantFirstWeekDay(this.firstRestaurantDay, this.sessionService.getDateJournee());
    const data = this.checkConsecutiveReposDays(previousDatesFromFirstRestaurantWeekDay, coordinations, this.isTrueBooleanFromString(isReposConsecutive));
    const message = this.rhisTranslateService.translate("ANOMALIE.REST_DAYS") + previousDatesFromFirstRestaurantWeekDay;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  public verifyMinShiftDelay(coordination: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    let exitDate: Date;
    let enterDate: Date;
    let lastEnterPointing: PointageModel;
    const yesterday = this.dateService.getYesterDay(this.sessionService.getDateJournee());
    if (coordination.pointageToUpdate) {
      // pour le cas de suppression d'heure de fin
      if ( coordination.pointageToUpdate.heureFin == null ) {
        return {contrainteMessage: '', isRespected: true};
      }
      enterDate = this.dateService.createDateFromTime(coordination.pointageToUpdate.isAcheval ? yesterday : coordination.pointageToUpdate.dateJournee, coordination.pointageToUpdate.heureDebut,
        coordination.pointageToUpdate.heureDebutIsNight ? 1 : 0);
      exitDate = this.dateService.createDateFromTime(coordination.pointageToUpdate.isAcheval ? this.sessionService.getDateJournee() : coordination.pointageToUpdate.dateJournee, coordination.pointageToUpdate.heureFin,
        coordination.pointageToUpdate.heureFinIsNight ? 1 : 0);
    } else {
      lastEnterPointing = this.getLastPointing(coordination.pointages);
      enterDate = this.dateService.createDateFromTime(lastEnterPointing.isAcheval ? yesterday : lastEnterPointing.dateJournee, lastEnterPointing.heureDebut,
        lastEnterPointing.heureDebutIsNight ? 1 : 0);
      // exitDate = new Date();
      exitDate = new Date(this.sessionService.getIsTimePointerEntreeSortie());
    }

    exitDate.setSeconds(0, 0);
    let duration = this.dateService.getDiffOn(exitDate, enterDate, 'minutes');
    // concatenate duration of previous and next pointages if exist if LONGUEUR_MAXI_BREAK is respected
    const currentDayPointages = coordination.pointages.filter(pointage => {
      const isSameDay = (pointage.dateJournee === this.sessionService.getDateJournee());
      let isNotPointageInQuestion = true;
      if (lastEnterPointing) {
        isNotPointageInQuestion = (pointage.idFront !== lastEnterPointing.idFront);
      }
      return isSameDay && isNotPointageInQuestion;
    });
    const sortedPointages = this.sortPointingForCalculeCoupure([...currentDayPointages]);
    let leftPointages = [];
    const rightPointages = [];

    sortedPointages.forEach(pointage => {
      const pointageStartHour = this.dateService.getDateFromDateIntervalFor(<DateInterval>pointage, 'heureDebut');
      this.dateService.isSameOrBefore(pointageStartHour, enterDate) ? leftPointages.push(pointage) : rightPointages.push(pointage);
    });
    leftPointages = leftPointages.reverse();
    const breakLaw = coordination.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_BREAK);
    // previous pointages block reversely iterated
    for (let i = 0; i < leftPointages.length; i++) {
      const endHourPointage = this.dateService.getDateFromDateIntervalFor(<DateInterval>leftPointages[i], 'heureFin');
      const margin = this.dateService.getDiffInMinutes(enterDate, endHourPointage);
      if (this.validContrainteWithTreatment(margin,
        breakLaw,
        coordination.employee.hebdoCourant < 35,
        coordination.employee.majeur, this.dateService.HHmmTimeStringToNumber).isValidated) {
        enterDate = this.dateService.getDateFromDateIntervalFor(<DateInterval>leftPointages[i], 'heureDebut');
        duration += this.dateService.getDiffInMinutes(endHourPointage, enterDate);
      } else break;
    }
    // next pointages chronologically iterated
    for (let i = 0; i < rightPointages.length; i++) {
      const startHourPointage = this.dateService.getDateFromDateIntervalFor(<DateInterval>rightPointages[i], 'heureDebut');
      const margin = this.dateService.getDiffInMinutes(startHourPointage, exitDate);
      if (this.validContrainteWithTreatment(margin,
        breakLaw,
        coordination.employee.hebdoCourant < 35,
        coordination.employee.majeur, this.dateService.HHmmTimeStringToNumber).isValidated) {
        exitDate = this.dateService.getDateFromDateIntervalFor(<DateInterval>rightPointages[i], 'heureFin');
        duration += this.dateService.getDiffInMinutes(exitDate, startHourPointage);
      } else break;
    }
    const specificLoi = coordination.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT);
    const data = this.validContrainteWithTreatment(duration, specificLoi,
      coordination.employee.hebdoCourant < 35,
      coordination.employee.majeur, this.dateService.HHmmTimeStringToNumber);
    const message = this.rhisTranslateService.translate('ANOMALIE.MIN_SHIFT') + duration;
    return {contrainteMessage: message, isRespected: data.isValidated};
  }

  public verifyCheckAbsenceHours(coordination: EmployeeCoordinations): { contrainteMessage: string, isRespected: boolean } {
    let minShiftDateFromNow: Date;
    if (coordination.pointageToUpdate) {
      minShiftDateFromNow = this.getDatePlusMinShift(coordination, this.dateService.createDateFromTime(coordination.pointageToUpdate.dateJournee, coordination.pointageToUpdate.heureDebut, coordination.pointageToUpdate.heureDebutIsNight ? 1 : 0));
    } else if (coordination.isCurrent) {
      minShiftDateFromNow = new Date(this.currentShiftNow(coordination));
    } else {
      minShiftDateFromNow = this.getDatePlusMinShift(coordination, this.now);
    }
    if (coordination.employee.absenceConges && coordination.employee.absenceConges.length) {
      const message = this.rhisTranslateService.translate('ANOMALIE.ABSENCE_TIME');
      return {
        contrainteMessage: message,
        isRespected: !this.isIntersectAbsenceConge(coordination, minShiftDateFromNow)
      };
    } else {
      return {contrainteMessage: '', isRespected: true}

    }

  }

  private isIntersectAbsenceConge(coordination: EmployeeCoordinations, minShiftDateFromNow: Date): boolean {
    let isIntersect = false;
    coordination.employee.absenceConges.forEach((absenceConge: AbsenceCongeModel) => {
      absenceConge.detailEvenements.forEach((detailEvenement: DetailEvenement) => {
        const absenceCongeStart = this.dateService.createDateFromTime(detailEvenement.dateEvent, detailEvenement.heureDebut, 0);
        const absenceCongeEnd = this.dateService.createDateFromTime(detailEvenement.dateEvent, detailEvenement.heureFin, 0);
        if (this.dateService.isIntersect([this.now, minShiftDateFromNow], [absenceCongeStart, absenceCongeEnd])) {
          isIntersect = true;
        }
      });
    })
    return isIntersect;
  }

  /**
   * permet de trouver l'absence courante d'un employé
   * @param coordonnations
   * @param currentShift
   */
  private findAbsence(coordonnations: EmployeeCoordinations, currentShift: Date): string {
    let absence = '';
    coordonnations.employee.absenceConges[0].detailEvenements.forEach((detailEvenement: DetailEvenement) => {
      const absenceCongeStart = this.dateService.createDateFromTime(detailEvenement.dateEvent, detailEvenement.heureDebut, 0);
      const absenceCongeEnd = this.dateService.createDateFromTime(detailEvenement.dateEvent, detailEvenement.heureFin, 0);
      if (this.dateService.isIntersect([this.now, currentShift], [absenceCongeStart, absenceCongeEnd])) {
        absence = '[' + detailEvenement.heureDebut + '-' + detailEvenement.heureFin + ']';
      }
    });
    return absence;
  }

  private getDatePlusMinShift(coordination: EmployeeCoordinations, date: Date): Date {
    const concernedDate = new Date(date);
    const minShift = this.getConstraintValueByCodeName(CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, coordination.employee.loiPointeuse,
      coordination.employee.hebdoCourant >= 35, coordination.employee.majeur);
    return this.dateService.createDatePlusHHmmTime(concernedDate, minShift);
  }

  private getTotalWorkHoursFor(coordination: EmployeeCoordinations, dates: Date[]) {
    let completePointings: PointageModel[];
    completePointings = this.getTerminatedPointings(dates, coordination.pointages);
    if (coordination.isCurrent) {
      return this.calculateTotalHoursFromPointingList(completePointings);
    } else {
      return this.calculateTotalHoursFromPointingsPlusMinShif(completePointings, coordination);
    }
  }

  /**
   * calcule nbr coupure dans une semaine
   * @param coordination
   * @param dates
   */
  private getTotalCoupurInWeek(coordination: EmployeeCoordinations, dates: Date[]): number {
    let nbrCoupure = 0;
    let currentPoint = false;
    dates.forEach((date: Date) => {
      let currentPoint = false;
      const pointageByDate = coordination.pointages.filter(p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
      if (coordination.pointageToUpdate) {
        if (this.dateService.isSameDateOn(coordination.pointageToUpdate.dateJournee, date, 'day')) {

          const indexOfCurrent = pointageByDate.findIndex(value => value.idFront === coordination.pointageToUpdate.idFront);
          if (indexOfCurrent !== -1) {
            pointageByDate.splice(indexOfCurrent, 1);
          }
          pointageByDate.push(coordination.pointageToUpdate);
        }
      } else if (this.dateService.isSameDateOn(this.sessionService.getDateJournee(), date, 'day')) {
        currentPoint = true;
      }
      nbrCoupure += this.calculateTotalCoupurInWeek(pointageByDate, currentPoint);
    });
    return nbrCoupure;

  }

  private getTotalEstimatedWorkHoursInCurentMonth(coordination: EmployeeCoordinations) {
    const completePointings: PointageModel[] = this.getTerminatedPointingsInCurrentMonth(coordination.pointages);
    if (coordination.isCurrent) {
      return this.calculateTotalHoursFromPointingList(completePointings);
    } else {
      return this.calculateTotalHoursFromPointingsPlusMinShif(completePointings, coordination);
    }
  }

  private calculateTotalHoursFromPointingsPlusMinShif(completePointings: PointageModel[], coordination: EmployeeCoordinations) {
    if (coordination.pointageToUpdate) {
      const indexOfCurrent = completePointings.findIndex(value => value.idFront === coordination.pointageToUpdate.idFront);
      if (indexOfCurrent !== -1) {
        completePointings.splice(indexOfCurrent, 1);
      }
    }
    const totalPointingsInMinutes = completePointings.map(p => p.tempsPointes).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    const minShift = this.getConstraintValueByCodeName(CodeNameContrainteSocial.LONGUEUR_MINI_SHIFT, coordination.employee.loiPointeuse,
      coordination.employee.hebdoCourant >= 35, coordination.employee.majeur);
    const minShiftInMinutes = this.dateService.HHmmTimeStringToNumber(minShift);
    if (coordination.pointageToUpdate) {
      const heureFin = coordination.pointageToUpdate.heureFin ? this.dateService.createDateFromHourAndNightValue(
        new Date(`${coordination.pointageToUpdate.dateJournee} ${coordination.pointageToUpdate.heureFin}`),
        coordination.pointageToUpdate.heureFinIsNight) : new Date();
      const currentShiftInMinutes = this.dateService.getDiffInMinutes(heureFin,
        this.dateService.createDateFromHourAndNightValue(
          new Date(`${coordination.pointageToUpdate.dateJournee} ${coordination.pointageToUpdate.heureDebut}`),
          coordination.pointageToUpdate.heureDebutIsNight));
      if (coordination.pointageToUpdate.heureFin) {
        return currentShiftInMinutes + totalPointingsInMinutes;
      }
      return (currentShiftInMinutes > minShiftInMinutes ? currentShiftInMinutes : minShiftInMinutes) + totalPointingsInMinutes;
    }
    return minShiftInMinutes + totalPointingsInMinutes;
  }

  /**
   * permet de calculer le temps total pointé
   * @param completePointings
   */
  private calculateTotalHoursFromPointingList(completePointings: PointageModel[]): any {
    completePointings.forEach((pointage: PointageModel) => {
      pointage.heureDebut = this.dateService.setTimeFormatHHMM(pointage.heureDebut);
      if (pointage.heureFin === null) {
        pointage.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(), ':');
      }
      pointage.heureFin = this.dateService.setTimeFormatHHMM(pointage.heureFin);
      return pointage.tempsPointes = Math.trunc(this.dateService.getDiffOn(pointage.heureFin, pointage.heureDebut, 'minute'));
    });
    const totalPointingsInMinutes = completePointings.map(p => p.tempsPointes).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    return totalPointingsInMinutes;
  }

  /**
   *
   * @param completePointings
   */
  private calculateTotalCoupurInWeek(completePointings: PointageModel[], currentPoint: boolean): number {
    let nbrCoupure = 0;
    const sortedPointings = this.sortPointingForCalculeCoupure([...completePointings]);
    sortedPointings.forEach((pointage: PointageModel, index: number) => {
      let nextPointage = sortedPointings[index + 1];
      if (nextPointage) {
        const nextPointageHeureDebut = this.dateService.createDateFromHourAndNightValue(new Date(`${nextPointage.dateJournee} ${nextPointage.heureDebut}`), nextPointage.heureDebutIsNight);
        const heureFinPointage = this.dateService.createDateFromHourAndNightValue(new Date(`${pointage.dateJournee} ${pointage.heureFin}`), pointage.heureFinIsNight)
        let pauseCurrent = Math.trunc(this.dateService.getDiffOn(nextPointageHeureDebut, heureFinPointage, 'minute'));
        if (pauseCurrent > this.minBeforeCoupure) {
          nbrCoupure++;
        }
      }
    });
    // cas pointage en entrée
    if (currentPoint && sortedPointings[sortedPointings.length - 1]) {
      let lastPointing = sortedPointings[sortedPointings.length - 1];
      const lastPointingSortie = this.dateService.createDateFromHourAndNightValue(new Date(`${lastPointing.dateJournee} ${lastPointing.heureFin}`), lastPointing.heureFinIsNight);
      let dateNow = this.now;
      if (this.dateService.getDiffOn(this.now, lastPointingSortie, 'minutes') < 0) {
        // si l' heure actuel est inférieur à la valeur fin du dernier pointage on ajouté une journé à la date actuelle
        dateNow = new Date(dateNow.getTime() + 86400000);
      }
      let pauseCurrent = this.getDiffTimeFromDateForPointingEndHourAndOn(dateNow, lastPointing, 'minutes');
      if (pauseCurrent > 1) {
        nbrCoupure++;
      }
    }
    return nbrCoupure;

  }

  public getConstraintValueByCodeName(codeName: string, lois: LoiPaysModel[], tempsPlein: boolean, majeur: boolean): string {
    const loi = lois.find((l: LoiPaysModel) => l.codeName === CodeNameContrainteSocial[codeName]);
    return tempsPlein ?
      (majeur ? loi.valeurMajeurTempsPlein : loi.valeurMineurTempsPlein) :
      (majeur ? loi.valeurMajeurTempsPartiel : loi.valeurMineurTempsPartiel);
  }

  private getConstraintsValueByCodeNames(codeNames: string[], lois: LoiPaysModel[], tempsPlein: boolean, majeur: boolean): string[] {
    const results: string[] = [];
    codeNames.forEach((codeName: string) => {
      results.push(this.getConstraintValueByCodeName(codeName, lois, tempsPlein, majeur));
    });
    return results;
  }

  public getLastPointing(pointages: PointageModel[], date?: Date): PointageModel {
    if (pointages && pointages.length >= 1) {
      pointages = this.sortPointingChronologically(pointages);
      return pointages[0];
    } else {
      return null;
    }
  }

  private getLastPointageOnDate(pointages: PointageModel[], date: Date): PointageModel {
    let pointagesOnDate: PointageModel[] = pointages.filter(p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
    if (pointagesOnDate && pointagesOnDate.length >= 1) {
      pointagesOnDate = this.sortPointingChronologically(pointagesOnDate);
      return pointagesOnDate[0];
    } else {
      return null;
    }
  }

  private getFirstPointageOnDate(pointages: PointageModel[], date: Date): PointageModel {
    let pointagesOnDate: PointageModel[] = pointages.filter(p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
    if (pointagesOnDate && pointagesOnDate.length >= 1) {
      pointagesOnDate = this.sortPointingChronologically(pointagesOnDate);
      return pointagesOnDate[pointagesOnDate.length - 1];
    } else {
      return null;
    }
  }

  public getLastPointingParameters(pointing: PointageModel[], checkFirstPointingInDay: boolean): [PointageModel, boolean] {
    let lastPointing = this.getLastPointing(pointing);
    if (lastPointing) {
      if (checkFirstPointingInDay && (this.dateService.getDiffOn(this.dateService.getCorrectDateJournee(), new Date(lastPointing.dateJournee), 'days') > 1)) {
        lastPointing = null;
      }
    }
    const isEnterPointing: boolean = (lastPointing === null) || ((lastPointing != null) && (lastPointing.heureFin != null));
    return [lastPointing, isEnterPointing];
  }

  public getTerminatedPointings(dates: Date[], pointages: PointageModel[]): PointageModel[] {
    let pointings = [];
    dates.forEach((date: Date) => {
      pointings = pointings.concat(pointages.filter(p => this.dateService.isSameDateOn(p.dateJournee, date, 'day')));
    });
    return pointings;
  }

  /**
   * permet de recuperer tous les pointages meme les en cours
   * @param dates
   * @param pointages
   */
  public getAllPointings(dates: Date[], pointages: PointageModel[]): PointageModel[] {
    let pointings = [];
    dates.forEach((date: Date) => {
      pointings = pointages.filter(p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
    });
    return pointings;
  }

  public getTerminatedPointingsInCurrentMonth(pointages: PointageModel[]): PointageModel[] {
    return pointages.filter(p => (p.heureFin != null) && (p.heureDebut != null) &&
      this.dateService.isSameDateOn(p.dateJournee, this.sessionService.getDateJournee(), 'months'));
  }

  public async getEnterPointing(employee: EmployeeModel): Promise<PointageModel> {
    return {
      idFront: null,
      idShift: null,
      idEmployee: employee.idEmployee,
      dateJournee: this.sessionService.getDateJournee(),
      heureDebut: this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(this.sessionService.getIsTimePointerEntreeSortie()), ':'),
      heureDebutIsNight: await this.checkIsNight(new Date(this.sessionService.getIsTimePointerEntreeSortie()), this.dateService.getCorrectDateJournee()),
      heureFin: null,
      heureFinIsNight: false,
      tempsPointes: 0,
      modified: 0,
      creationDate: new Date(),
      idRestaurant: +this.sessionService.getIdRestaurant(),
    } as PointageModel;

  }

  public async checkIsNight(nowDate: Date, referenceDate: Date): Promise<boolean> {
    const listDecoupageHoraire: DecoupageHoraireModel[] = await this.decoupageHoraireJsStoreService.getListDecoupage();
    const finJournee: DecoupageHoraireModel = listDecoupageHoraire.filter(item => item.phaseLibelle === 'FJA')[0];
    const day: JourSemaine = this.dateService.getJourSemaine(this.dateService.getCorrectDateJournee());
    const key = day[0] + day.substring(1).toLowerCase();
    const endTime = finJournee['valeur' + key];

    // Si on est sur la journée d'aprés on considére que c'est une heure de nuit
    // Pas besoin de vérifier le découpage horaire
    return (nowDate.getDate() > referenceDate.getDate() || (nowDate.getMonth() > referenceDate.getMonth()));/* &&
      this.dateService.getDiffOn(
        this.dateService.createDateFromTime(this.sessionService.getDateJournee(), endTime),
        this.dateService.createDateFromTime(this.sessionService.getDateJournee(), this.dateService.getHHmmformatFromDateAndWithSeparator(nowDate, ':')), 'minute') > 0;*/
  }

  public async getExitPointing(lastPointing: PointageModel): Promise<PointageModel> {
    const exitPointing = {
      ...lastPointing,
      heureFin: this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(this.sessionService.getIsTimePointerEntreeSortie()), ':'),
      heureFinIsNight: await this.checkIsNight(new Date(), this.dateService.getCorrectDateJournee()),
    } as PointageModel;
    let spentTime: number;

    if (!exitPointing.heureDebutIsNight && exitPointing.heureFinIsNight) {
      const dateDebut = this.dateService.createDateFromHourAndNightValue(new Date(exitPointing.isAcheval ? `${this.dateService.getYesterDay(lastPointing.dateJournee)} ${lastPointing.heureDebut}` : `${lastPointing.dateJournee} ${lastPointing.heureDebut}`), exitPointing.heureDebutIsNight);
      const datefin = new Date(this.sessionService.getIsTimePointerEntreeSortie());

      spentTime = this.dateService.getDiffInMinutes(datefin, dateDebut);
      exitPointing.dateJournee = exitPointing.isAcheval ? this.dateService.getYesterDay(this.sessionService.getDateJournee()) : exitPointing.dateJournee;
      return {
        ...exitPointing,
        tempsPointes: spentTime
      };
    } else if (exitPointing.heureDebutIsNight) {
      const dateDebut = this.dateService.createDateFromHourAndNightValue(new Date(exitPointing.isAcheval ? `${this.dateService.getYesterDay(exitPointing.dateJournee)} ${exitPointing.heureDebut}` : `${exitPointing.dateJournee} ${exitPointing.heureDebut}`), exitPointing.heureDebutIsNight);
      const datefin = new Date(this.sessionService.getIsTimePointerEntreeSortie());
      spentTime = this.dateService.getDiffInMinutes(datefin, dateDebut);
      exitPointing.dateJournee = exitPointing.isAcheval ? this.dateService.getYesterDay(this.sessionService.getDateJournee()) : exitPointing.dateJournee;
      return {
        ...exitPointing,
        tempsPointes: spentTime
      };
    } else {
    // spentTime = -this.getDiffTimeFromDateForPointingEndHourAndOn(this.dateService.createDatePlusHHmmTime(exitPointing.isAcheval ? new Date(this.dateService.getYesterDay(exitPointing.dateJournee)) : new Date(new Date(exitPointing.dateJournee).setHours(0)), exitPointing.heureDebut + ''), exitPointing, 'minutes');
      spentTime = -this.getDiffTimeFromDateForPointingEndHourAndOn(this.dateService.createDatePlusHHmmTime(exitPointing.isAcheval ? this.dateService.getCorrectDateJournee(this.dateService.getYesterDay(exitPointing.dateJournee)) :
        this.dateService.getCorrectDateJournee(this.dateService.getCorrectDateJournee(exitPointing.dateJournee).setHours(0), true), exitPointing.heureDebut + ''), exitPointing, 'minutes');
      exitPointing.dateJournee = exitPointing.isAcheval ? this.dateService.getYesterDay(this.sessionService.getDateJournee()) : exitPointing.dateJournee;
      return {
        ...exitPointing,
        tempsPointes: spentTime
      };
    }
  }

  public getDiffTimeFromDateForPointingEndHourAndOn(currentDate: Date, pointage: PointageModel, unit): number {
    const date = new Date(currentDate);
    date.setSeconds(0, 0);
    const dateFin = this.dateService.createDateFromTime(pointage.dateJournee, pointage.heureFin, pointage.heureFinIsNight ? 1 : 0);
    return this.dateService.getDiffOn(date, dateFin, unit);
  }

  public getDiffTimeFromDateForPointingEndHourAndOnForManager(currentDate: Date, pointage: any, unit): number {
    const date = this.dateService.getCorrectDateJournee(currentDate,true);
    date.setSeconds(0, 0);
    const dateFin = this.dateService.createDateFromTime(pointage.dateJournee, pointage.heureFin, !pointage.hoursInSameDay ? 1 : 0);
    return this.dateService.getDiffOn(dateFin, date, unit);
  }

  private incrementNbShiftIfBreakOutdated(date: Date, pointing: PointageModel, breakLoi, coordinations: EmployeeCoordinations, nbShifts: number): number {
    const differenceInMinutesFromDate = this.getDiffTimeFromDateForPointingEndHourAndOn(date, pointing, 'minutes');
    if (!this.validContrainteWithTreatment(differenceInMinutesFromDate,
      breakLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur, this.dateService.HHmmTimeStringToNumber).isValidated) {
      nbShifts++;
    }
    return nbShifts;
  }

  private checkConsecutiveWorkDaysByContstraintCode(previousDatesFromFirstRestaurantWeekDay: Date[], codeName: string, coordinations: EmployeeCoordinations): { isValidated: boolean, loiValue: number } {
    previousDatesFromFirstRestaurantWeekDay.concat([this.dateService.getCorrectDateJournee()]).sort((d1: Date, d2: Date) => this.dateService.sortDates(d1, d2));
    previousDatesFromFirstRestaurantWeekDay = previousDatesFromFirstRestaurantWeekDay.reverse();
    const accumulateConsecutiveWorkDays: number[] = [];
    let incrementer = 0;
    previousDatesFromFirstRestaurantWeekDay.forEach((date: Date) => {
      if (this.isPointingExistInDate(coordinations.pointages, date)) {
        incrementer++;
      } else {
        incrementer = 0;
      }
    });
    return this.getDaysNumberAndVerifyConstraint(incrementer, coordinations, codeName);
  }

  private checkConsecutiveReposDays(previousDatesFromFirstRestaurantWeekDay: Date[], coordinations: EmployeeCoordinations, consecutive: boolean): { isValidated: boolean, loiValue: number } {
    previousDatesFromFirstRestaurantWeekDay = previousDatesFromFirstRestaurantWeekDay.sort((a: Date, b: Date) => {
      const diffInTime = a.getTime() - b.getTime();
      if (diffInTime > 0) {
        return 1;
      } else if (diffInTime < 0) {
        return -1;
      }
      return 0;
    });
    const presence: number[] = [];
    previousDatesFromFirstRestaurantWeekDay.forEach((date: Date) => {
      if (this.isAbsentIn(coordinations.pointages, date)) {
        presence.push(0);
      } else {
        presence.push(1);
      }
    });

    const accumulateConsecutiveReposDays: number[] = this.getConsecutiveOccurrence(0, presence);
    return this.getDaysOffNumberAndVerifyConstraint(accumulateConsecutiveReposDays, coordinations, CodeNameContrainteSocial.NB_MINI_OFF_SEMAINE, consecutive, presence);
  }

  private getConsecutiveOccurrence(x: 0 | 1, presence: number[]): number[] {
    let increment = 0;
    const accumulateConsecutiveSerchedNumber = [];
    presence.forEach(value => {
      if (value === x) {
        increment++;
      } else {
        accumulateConsecutiveSerchedNumber.push(increment);
        increment = 0;
      }
    });
    if (increment != 0) {
      accumulateConsecutiveSerchedNumber.push(increment);
    }
    return accumulateConsecutiveSerchedNumber;
  }

  private getDaysNumberAndVerifyConstraint(accumulateConsecutiveWorkDays: number, coordinations: EmployeeCoordinations, codeName: string, reposIsConsecutive = true, presenceUntilToday: number[] = []): { isValidated: boolean, loiValue: number } {
    const specificLoi = coordinations.employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial[codeName]);
    if (!reposIsConsecutive) {
      const restDays = (7 - presenceUntilToday.length) + (presenceUntilToday[length - 1] ? 0 : 1);
      const minWeekReposDays: number = +this.getConstraintValueByCodeName(codeName, coordinations.employee.loiPointeuse,
        coordinations.employee.hebdoCourant >= 35, coordinations.employee.majeur);
      let totalReposDaysInWeek: number;
      return {
        isValidated: totalReposDaysInWeek >= minWeekReposDays ? true : (minWeekReposDays - totalReposDaysInWeek) <= restDays,
        loiValue: minWeekReposDays
      };
    }

    return this.validContrainte(accumulateConsecutiveWorkDays + 1,
      specificLoi,
      coordinations.employee.hebdoCourant < 35,
      coordinations.employee.majeur);
  }

  private getDaysOffNumberAndVerifyConstraint(accumulateConsecutiveReposDays: number[], coordinations: EmployeeCoordinations, codeName: string, reposIsConsecutive = true, presenceUntilToday: number[] = []): { isValidated: boolean, loiValue: number } {
    const maxConsecutiveReposDays = accumulateConsecutiveReposDays.length ? Math.max(...accumulateConsecutiveReposDays) : 0;
    const minWeekReposDays: number = +this.getConstraintValueByCodeName(codeName, coordinations.employee.loiPointeuse,
      coordinations.employee.hebdoCourant >= 35, coordinations.employee.majeur);
    const restDays = 6 - presenceUntilToday.length;
    const totalReposDaysInWeek = accumulateConsecutiveReposDays.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    let isConsecutiveReposDaysRespected = true;
    if (reposIsConsecutive) {
      isConsecutiveReposDaysRespected = maxConsecutiveReposDays >= minWeekReposDays ? true : minWeekReposDays <= restDays;
    }
    const isMinReposDaysRespected = totalReposDaysInWeek >= minWeekReposDays ? true : (minWeekReposDays - totalReposDaysInWeek) <= restDays;
    return {
      isValidated: isConsecutiveReposDaysRespected && isMinReposDaysRespected,
      loiValue: minWeekReposDays
    };
  }

  private isPointingExistInDate(pointages: PointageModel[], date: Date): boolean {
    return pointages.some(
      p => this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
  }

  private isAbsentIn(pointages: PointageModel[], date: Date): boolean {
    return pointages.every(
      p => !this.dateService.isSameDateOn(p.dateJournee, date, 'day'));
  }

  private isTrueBooleanFromString(booleanValue: string): boolean {
    return booleanValue.toLowerCase() === 'true';
  }

  private isAnyValueAccepted(val: string): boolean {
    return val === '-';
  }

  private isAnyValueRejected(val: string): boolean {
    return val === '%%';
  }

  /**
   * Vérification de la contrainte "Longueur maximum d’un shift sans brea pour plusieurs shift
   * @param listLoi
   * @param tempsTravailPartiel
   * @param mineur
   * @param employeesShift
   */
  public verificationContraintMaxShiftWithoutBreakInListShift(employeeDisplay: EmployeeModel): any {
    let verificationContrainte;
    let nbrHourCurrent = 0;
    let nbrHour = 0;
    let i = 0;
    if (employeeDisplay['shifts'].length && employeeDisplay['shifts'].length === 1) {

      nbrHour = this.dateService.getTotalMinutes(<DateInterval>employeeDisplay['shifts'][0]);
      employeeDisplay['shifts'][0].sign = false;
      verificationContrainte = this.validDureeMaxSansBreak(employeeDisplay, this.dateService.HHmmTimeStringToNumber(this.dateService.convertNumberToTime(nbrHour)));
      if (!verificationContrainte) {
        employeeDisplay['shifts'][0].sign = true;
        return verificationContrainte;
      }
    } else {
      this.sortListShift(employeeDisplay['shifts']);
      employeeDisplay['shifts'].forEach((shiftDisplay: any, index: number) => {
        employeeDisplay['shifts'][index].sign = false;

        shiftDisplay.totalHeure = this.dateService.getTotalMinutes(<DateInterval>shiftDisplay);
        nbrHour += this.dateService.getTotalMinutes(<DateInterval>shiftDisplay);
        nbrHourCurrent = this.dateService.getTotalMinutes(<DateInterval>shiftDisplay);
        verificationContrainte = this.validDureeMaxSansBreak(employeeDisplay, this.dateService.HHmmTimeStringToNumber(this.dateService.convertNumberToTime(nbrHourCurrent)))
        if (!verificationContrainte) {
          // si il y a un pause i doit recoit index pour identifier le signe
          employeeDisplay['shifts'][index].sign = true;

          nbrHour = 0;
        }
        if (index >= 1) {
          verificationContrainte = this.validDureeMaxSansBreak(employeeDisplay, this.dateService.HHmmTimeStringToNumber(this.dateService.convertNumberToTime(nbrHour)));
          const pause = this.dateService.getBreakBettwenTwoShift(shiftDisplay, employeeDisplay['shifts'][index - 1]);
          const dureeMinBreak = this.validDureeMinBreak(employeeDisplay, pause);
          if (dureeMinBreak) {
            // si il y a un pause i doit recoit index pour identifier le signe
            i = index;
            nbrHour = +JSON.parse(JSON.stringify(nbrHourCurrent));
          } else if (!verificationContrainte) {
            employeeDisplay['shifts'][i].sign = true;
            for (let loop = i; loop <= index; loop++) {
              if (employeeDisplay['shifts'][i].totalHeure < employeeDisplay['shifts'][loop].totalHeure) {
                employeeDisplay['shifts'][i].sign = false;
                employeeDisplay['shifts'][loop].sign = true;
                i = loop;
              }
            }

          }
        }

      });
    }
  }

  /**
   * Trie des shifts
   */
  private sortListShift(listShift: any[]): void {
    listShift.sort(function (a: any, b: any) {
      if (a.heureDebut < b.heureDebut) {
        return -1;
      }
      if (a.heureDebut > b.heureDebut) {
        return 1;
      }
      return 0;
    });
  }

  /**
   *
   * verify (DelayWithoutPause) Longueur maximum d’un shift sans break
   * @param coordinations
   * @constructor
   */
  public validDureeMaxSansBreak(employee: EmployeeModel, nbrHour: number): boolean {
    const specificLoi = employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.LONGUEUR_MAXI_SHIFT_SANS_BREAK);
    const data = this.validContrainteWithTreatment(nbrHour,
      specificLoi,
      employee.hebdoCourant < 35,
      employee.majeur, this.dateService.HHmmTimeStringToNumber);
    return data.isValidated;

  }

  /**
   *
   * verify  duree min break
   * @param employee
   * @constructor
   */
  public validDureeMinBreak(employee: EmployeeModel, differenceTimeFromNowInMinutes: number): boolean {
    const specificLoi = employee.loiPointeuse.find((loi: LoiPaysModel) =>
      loi.codeName === CodeNameContrainteSocial.LONGUEUR_MINI_BREAK);
    const data = this.validContrainteWithTreatment(differenceTimeFromNowInMinutes,
      specificLoi,
      employee.hebdoCourant < 35,
      employee.majeur, this.dateService.HHmmTimeStringToNumber);
    return data.isValidated;

  }

}
