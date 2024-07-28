import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {PointageModel} from "../model/pointage.model";
import {DateService} from "./date.service";
import {SessionService} from "./session.service";
import {PlanningJsStoreService} from "../../modules/plannings/services/planningJsStore.service";
import {DecoupageHoraireModel} from "../model/decoupage.horaire.model";
import {DecoupageHoraireJsStoreService} from "./JsStoreServices/decoupageHoraireJsStore.service";
import {ParametreModel} from "../model/parametre.model";
import {ParameterJsStoreService} from "./JsStoreServices/parameter-js-store.service";
import {JourSemaine} from "../enumration/jour.semaine";

@Injectable({
  providedIn: 'root'
})
export class AchevalService {


  constructor(private dateService: DateService,
              private sessionService: SessionService,
              private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService,
              private parameterJsStoreService: ParameterJsStoreService,
              private planningsJsStoreService: PlanningJsStoreService) {
  }

  /**
   * recupereration de des pointages de j-1 par date
   */
  public async getYesterdayPoitnings(): Promise<PointageModel[]> {
    let currentDate = this.dateService.getCorrectDateJournee();
    const previousDate: Date = this.dateService.subtractFromDate(currentDate, 1, "days");
    const currentDay: JourSemaine = this.dateService.getJourSemaine(currentDate);
    const previousDay: JourSemaine = this.dateService.getJourSemaine(previousDate);
    const listDecoupageHoraire: DecoupageHoraireModel[] = await this.decoupageHoraireJsStoreService.getListDecoupage();
    // DJA = Debut Journee Activite
    const debutJournee: DecoupageHoraireModel = listDecoupageHoraire.filter(item => item.phaseLibelle === 'DJA')[0];
    // FJA = Fin Journee Activite
    const finJournee: DecoupageHoraireModel = listDecoupageHoraire.filter(item => item.phaseLibelle === 'FJA')[0];
    const currentDayDecoupage: {debut: Date, fin: Date} = this.dateService.createDateFromDecoupageValues(currentDay, 0, debutJournee, finJournee);
    const previousDayDecoupage: {debut: Date, fin: Date} = this.dateService.createDateFromDecoupageValues(previousDay, -1, debutJournee, finJournee);
    const mode24Param: ParametreModel[] = await this.parameterJsStoreService.getParamatreByParam('MODE_24H');

    // the last day pointage list that should be returned
    let lastDayPointages = [];

    // if it's 24 mode and yesterday "fin decoupage" equal to today's "debut decoupage" get incompleted last day pointages
    if (this.dateService.getDiffOn(currentDayDecoupage.debut, previousDayDecoupage.fin, 'minutes') === 0 && mode24Param[0].valeur !== '0') {
      // recupération des pointage de j-1
      const yesterdayStringFormat = previousDate.getFullYear() + '-' + (previousDate.getMonth() + 1).toString().padStart(2, '0') + '-' + previousDate.getDate().toString().padStart(2, '0');
      lastDayPointages = await this.planningsJsStoreService.getPointagesByDateJournee(yesterdayStringFormat);
      // à la récupération des pointages mettre debut de journée comme heur de debut et mettre heur de debut comme heureDebutAcheval
      for (const pointage of lastDayPointages) {
        pointage.heureDebutAcheval = pointage.heureDebut;
        pointage.heureDebut = this.dateService.getHHmmformatFromDateAndWithSeparator(this.sessionService.getDebutJournee(), ':');
        pointage.heureDebutAchevalIsNight = pointage.heureDebutIsNight;
        pointage.heureDebutIsNight = false;
      }
    }
    return lastDayPointages;
  }

  /**
   * recupereration de des pointages de j-1 par date et employee
   */
  public async getYesterdayPoitningsByEmployee(): Promise<PointageModel[]> {
    // recupération des pointage de j-1
    const yesterday = new Date(this.dateService.getCorrectDateJournee().getTime() - 86400000);
    const yesterdayStringFormat = yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString().padStart(2, '0') + '-' + yesterday.getDate().toString().padStart(2, '0');
    const lastDayPointages = await this.planningsJsStoreService.getPointagesByDateJourneeAndIdEmployee(yesterdayStringFormat, [+this.sessionService.getEmploye()]);

    // à la récupération des pointages mettre debut de journée comme heur de debut et mettre heur de debut comme heureDebutAcheval
    for (const pointage of lastDayPointages) {
      pointage.heureDebutAcheval = pointage.heureDebut;
      pointage.heureDebut = this.dateService.getHHmmformatFromDateAndWithSeparator(this.sessionService.getDebutJournee(), ':');
      pointage.heureDebutAchevalIsNight = pointage.heureDebutIsNight;
      pointage.heureDebutIsNight = false;
    }
    return lastDayPointages;
  }
}
