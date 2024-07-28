import {Injectable} from '@angular/core';
import {EmployeeService} from '../../modules/employes/service/employee.service';
import {DecoupageHoraireService} from './decoupage.horaire.service';
import {Router} from '@angular/router';
import {ShiftService} from './shift.service';
import {SessionService} from './session.service';
import {AnomalieService} from '../../modules/anomalie/service/anomalie.service';
import {UpdateHeaderAnomalieService} from './updateHeaderAnomalie.service';
import {DateService} from './date.service';
import {AnomalieJsStoreService} from '../../modules/anomalie/service/anomalieJsStore.service';
import {MessageService} from '../../modules/messages/service/message.service';
import {ShiftJsStoreService} from './JsStoreServices/shiftJsStore.service';
import {DecoupageHoraireJsStoreService} from './JsStoreServices/decoupageHoraireJsStore.service';
import {EmployeJsStoreService} from '../../modules/employes/service/employeJsStore.service';
import {InfoRestaurantJsStoreService} from './JsStoreServices/infoRestaurantJsStore.service';
import {MessageJsStoreService} from '../../modules/messages/service/messageJsStore.service';
import {PlanningJsStoreService} from '../../modules/plannings/services/planningJsStore.service';
import {PlanningService} from '../../modules/plannings/services/planning.service';
import {DecoupageHoraireModel} from '../model/decoupage.horaire.model';
import {ShiftModel} from '../model/shift.model';
import {MessageModel} from '../model/message.model';
import {PointageModel} from '../model/pointage.model';
import {AnomalieModel} from '../model/anomalie.model';
import {AlarmeService} from './alarme.service';
import {JourSemaine} from '../enumration/jour.semaine';
import {ParameterJsStoreService} from "./JsStoreServices/parameter-js-store.service";
import {PointingService} from "../../modules/pointage/service/pointing.service";
import {CorrectionPointageModel} from "../model/CorrectionPointage.model";
import {EntityAction} from "../model/enumeration/EntityAction.model";
import {
  CorrectionPointageJsStoreService
} from '../../modules/correction-pointage/service/correctionPointageJsStore.service';
import {CorrectionPointageService} from '../../modules/correction-pointage/service/correction-pointage.service';
import {PointingHttpService} from '../../modules/pointage/service/pointing-http.service';
import {ParametreModel} from '../model/parametre.model';
import {ParametreService} from '../../modules/parametre-globaux/services/parametre.service';
import {PointageTime} from '../model/enumeration/PointageTime.modele';
import {TypePointageService} from './type-pointage.service';
import {TypePointageJsStoreService} from './JsStoreServices/type-pointage-js-store.service';
import {TypePointageModel} from '../model/type-pointage.model';
import {DateInterval} from '../model/gui/date-interval';
import {SynchronisationService} from './synchronisation.service';
import {CheckingSocialConstraintsRegularlyService} from './checking-social-constraints-regularly.service';
import {ContrainteSocialeService} from './contrainte-sociale.service';
import {RestaurantService} from './restaurant.service';
import {EmployeeModel} from '../model/employee.model';
import * as rfdc from 'rfdc';
import {OnlineService} from '../../health/online.service';
import {NameOfTable} from '../model/enumeration/NameOfTable.model';
import {AchevalService} from './acheval.service';
import {LanguageStorageService} from './language-storage.service';
import {TokenPointeuseService} from "./token-pointeuse.service";

import {EmployePointeuseDTO} from '../model/gui/EmployePointeuseDTO';
import {RestaurantModel} from "../model/restaurant.model";



@Injectable({
  providedIn: 'root'
})
export class RestaurantDataService {
  public clone = rfdc();

  private listDecoupageHoraire = [];
  private listMessage = [];
  private listShift = [];
  private listPointage = [];
  public listAnomalie: AnomalieModel[] = [];
  public listPointageFromIndexDb: PointageModel[] = [];
  // 86400000 = 24(heure) * 60(mn) * 60(s) * 1000(ms)
  private ONE_DAY_AS_MILLISECONDS = 86400000;
  private param = 'CORRECTPRNAUTO';
  private paramMode24 = 'MODE_24H';
  private paramPret = 'PRET_SALARIE';
  private paramatere: ParametreModel[] = [];
  public allEmployees: EmployeeModel[];
  private isOnline = true;
  public tableNameEmployee = NameOfTable.EMPLOYEE;
  public tableNameShift = NameOfTable.SHIFT;
  public tableNamePointage = NameOfTable.POINTAGE;
  public pretedEmployeeIdList: number[] = [];
  private readonly onzeMinutes = 11;
  private readonly thirteenMinutes = 30;
  public readonly currentDate = new Date();


  constructor(public employeeService: EmployeeService,
              public decoupageHoraireService: DecoupageHoraireService,
              public router: Router,
              public shiftService: ShiftService,
              public sessionService: SessionService,
              public anomalieService: AnomalieService,
              public updateHeaderAnomalieService: UpdateHeaderAnomalieService,
              public dateService: DateService,
              public anomalieJsStoreService: AnomalieJsStoreService,
              private messageService: MessageService,
              private shiftJsStoreService: ShiftJsStoreService,
              private decoupageHoraireJsStoreService: DecoupageHoraireJsStoreService,
              private employeJsStoreService: EmployeJsStoreService,
              private infoRestaurantJsStoreService: InfoRestaurantJsStoreService,
              private messageJsStoreService: MessageJsStoreService,
              private planningJsStoreService: PlanningJsStoreService,
              private planningService: PlanningService,
              private alerteService: AlarmeService,
              private parameterJsStoreService: ParameterJsStoreService,
              private pointingService: PointingService,
              private correctionPointageJsStoreService: CorrectionPointageJsStoreService,
              private correctionPointageService: CorrectionPointageService,
              private pointingHttpService: PointingHttpService,
              private parametreService: ParametreService,
              private typePointageService: TypePointageService,
              private synchronisationService: SynchronisationService,
              private typePointageJsStoreService: TypePointageJsStoreService,
              private checkingSocialConstraintsRegularlyService: CheckingSocialConstraintsRegularlyService,
              private restaurantService: RestaurantService,
              private contrainteSocialeService: ContrainteSocialeService,
              private onlineService: OnlineService,
              private debutJourneeService: AchevalService,
              private langueStorageService: LanguageStorageService,
              private dateHelperService: DateService,
              private tokenPointeuseService: TokenPointeuseService) {
    this.checkOnlineState();
  }

  private checkOnlineState(): void {
    this.onlineService.onlineState().subscribe((isOnline) => this.isOnline = isOnline);
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

  /**
   * recuperer les employes actif et les suavegardent dans la base local
   */
  public async getEmployeeActifAndSaveToLocalBase(idRestaurant: number): Promise<void> {
    let actifEmployees = [];
    const employeesToSave = [];
    await this.employeeService.getEmployeActifAndAbsenceByIdWithRestaurant(idRestaurant).toPromise().then(result => {
      actifEmployees = result;
      this.allEmployees = this.clone(result);
      this.sessionService.setSyncEmployesProgress(true);
      this.sessionService.setNbrTotEmp(this.allEmployees.length);
      let total = 0;
      actifEmployees.forEach((employee) => {
        total += employee.absenceConges.length;
      });
      this.sessionService.setNbrAbsence(total);

    })
      .catch((err) => {
        this.sessionService.setSyncEmployesProgress(false);
        console.log(err);
      });

    for (let i = 0; i < actifEmployees.length; i++) {
      actifEmployees[i].idFront = this.makeString();
      actifEmployees[i].idRestaurant = idRestaurant;
      if (actifEmployees[i].badge === null) {
        const employee = (await this.employeJsStoreService.getById(actifEmployees[i].idEmployee)).pop();
        if (employee) {
          actifEmployees[i].badge = employee.badge;
          employeesToSave.push(actifEmployees[i]);
        }
      } else {
        employeesToSave.push(actifEmployees[i]);
      }
    }
    await this.employeJsStoreService.clear();
    await this.employeJsStoreService.addALLEmployees(employeesToSave);
  }

  /**
   * get list de decpoupage et sauvegarder ds l bd local
   */
  private async getDecopageHoraireAndSaveToLocalBase(idRestaurant: number): Promise<void> {
    if (this.isOnline) {
      const data: DecoupageHoraireModel[] = await this.decoupageHoraireService.getDecoupageHoraire(idRestaurant).toPromise();
      await this.decoupageHoraireJsStoreService.clearData();
      data.forEach(item => {
        item.idFront = this.makeString();
        this.decoupageHoraireJsStoreService.addDecoupage(item);
        this.listDecoupageHoraire.push(item);
      });
      await this.setDateJourneeAndOuvertureFermetureTimer();
    }
  }


  /**wwl
   * get list de shift et sauvegarder ds l bd local
   */
  public async getShiftAndSaveToLocalBase(idRestaurant: number): Promise<void> {
    let shifts: any[];
    let totalDuration = 0;
    await this.shiftService.getListShiftByIdRestaurant(idRestaurant).toPromise().then(async (result: ShiftModel[]) => {
      shifts = result;
      this.structureDataToDisplay(shifts);
      this.sessionService.setSyncPlanningProgress(true);
      await this.shiftJsStoreService.clearData();
      shifts.forEach((item: ShiftModel) => {
          if (item.acheval && item.modifiable) {
            item.heureFinCheval = item.heureFin;
            item.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(this.sessionService.getDebutJournee(), ':');
            item.heureFinChevalIsNight = item.heureFinIsNight;
          } else if (item.acheval && !item.modifiable) {
            item.heureDebutCheval = item.heureDebut;
            item.heureDebut = this.dateService.getHHmmformatFromDateAndWithSeparator(this.sessionService.getDebutJournee(), ':');
            item.heureDebutChevalIsNight = false;
            item.heureFinIsNight = false;
          }
          item.idFront = this.makeString();
          item.idRestaurant = idRestaurant;
          this.shiftJsStoreService.addShift(item);
          totalDuration += item.totalHeure;

      });
      let totalHours = totalDuration / 60;
      this.sessionService.setTotEmpPlaned(totalHours);

    })
      .catch((err) => {
        this.sessionService.setSyncPlanningProgress(false);
        console.log(err);
      });
  }

  /***
   * Structure Data from list shift and list pointage to be displayed
   * Each employee has a list of shifts, and each shift has a list of pointings
   */
  private async structureDataToDisplay(ListShift: ShiftModel[]): Promise<void> {
    this.allEmployees = await this.employeJsStoreService.getEmployesList();
    this.allEmployees.forEach((employe: EmployeeModel) => {
      employe['shifts'] = ListShift.filter((shift: ShiftModel) => shift.employee && (shift.employee.idEmployee === employe.idEmployee));
      if (employe['shifts'] && employe['shifts'].length)
        this.contrainteSocialeService.verificationContraintMaxShiftWithoutBreakInListShift(employe);
    });
  }

  /**
   * recuperer les employes actif et les suavegardent dans la base local
   */
  private async getMessagesAndSaveToLocalBase(idRestaurant: number): Promise<void> {
    const messages: MessageModel[] = await this.messageService.getMessagesByRestaurant(idRestaurant).toPromise();
    for (let i = 0; i < messages.length; i++) {
      if (!this.listMessage.some((message: MessageModel) => message.idMessage === messages[i].idMessage)) {
        messages[i].idFront = this.makeString();
        await this.messageJsStoreService.addMessage(messages[i]);
        this.listMessage.push(messages[i]);
      }
    }
  }

  /**
   * recuperer les pointages et les suavegardent dans la base local
   */
  private async getPointagesAndSaveToLocalBase(idRestaurant: number): Promise<void> {
    let pointagesLocal = await this.planningJsStoreService.getListPointage();
    if (pointagesLocal.length === 0) {
      const backPointeusePointages = await this.planningService.getListPointageByIdRestaurant(idRestaurant).toPromise();
      if (backPointeusePointages.length) {
        for (let i = 0; i < backPointeusePointages.length; i++) {
          if (!this.listPointage.some((pointage: PointageModel) => pointage.idFront === backPointeusePointages[i].idFront)) {
            if (!(backPointeusePointages[i].idFront)) {
              backPointeusePointages[i].idFront = this.makeString();
            }
            const dateDebut = this.dateService.createDateFromHourAndNightValue(new Date(`${backPointeusePointages[i].dateJournee} ${backPointeusePointages[i].heureDebut}`), backPointeusePointages[i].heureDebutIsNight);
            const datefin = this.dateService.createDateFromHourAndNightValue(new Date(`${backPointeusePointages[i].dateJournee} ${backPointeusePointages[i].heureFin}`), backPointeusePointages[i].heureFinIsNight);
            backPointeusePointages[i].tempsPointes = this.dateService.getDiffInMinutes(datefin, dateDebut);
            backPointeusePointages[i].idShift === 0 ? backPointeusePointages[i].idShift = null : true;
            backPointeusePointages[i].typePointageRef = (await this.typePointageJsStoreService.getOneById(backPointeusePointages[i]['idTypePointageRef'])).pop();
            backPointeusePointages[i].idRestaurant = idRestaurant;
            await this.planningJsStoreService.addPointage(backPointeusePointages[i]);
            this.listPointage.push(backPointeusePointages[i]);
          }
        }
      }

    }
  }

  /**
   * récupération des données restaurant
   */
  public async getInfoToPointeuse(idRestaurant: number): Promise<void> {
    if (this.isOnline) {
      // await this.getTokenPointeuseFromV2();
      await this.getDecopageHoraireAndSaveToLocalBase(idRestaurant);
      await this.getEmployeeActifAndSaveToLocalBase(idRestaurant);
      await this.getShiftAndSaveToLocalBase(idRestaurant);
      await this.getListAnomalies(idRestaurant);
      await this.getMessagesAndSaveToLocalBase(idRestaurant);
      await this.getActiveTypesPointage();
      await this.getParametreList(idRestaurant);
      await this.getPointagesAndSaveToLocalBase(idRestaurant);
      await this.planningJsStoreService.deleteAllPointageBefore2Months();
      const paramPret = await this.parameterJsStoreService.getParamatreByParam(this.paramPret);
       if (paramPret[0].valeur === 'true') {
         await this.getEmployePreteActifAndShiftAndPointage(idRestaurant);
       }
       this.updateLocalStorageWheneGetInfoToPointeuse();
    } else {
      await this.setDateJourneeAndOuvertureFermetureTimer();
    }
  }

  private updateLocalStorageWheneGetInfoToPointeuse(): void {
    this.sessionService.setLastDateOuverturePointeuse(new Date());
    this.sessionService.setIsOuvertureDone(true);
    this.sessionService.setAllPointagesInLocalStorage('');
    this.sessionService.setAllCorrectionPointagesInLocalStorage('');
  }

  private async getTokenPointeuseFromV2() {
    const jwt = this.tokenPointeuseService.getTokenForPointeuseAndSetToLocalStorage(this.sessionService.getTokenPointeuse())
      .subscribe((res: any) => {
      this.sessionService.setTokenPointeuse(res.body);
      this.router.navigateByUrl('code');
    });
  }

  private async getActiveTypesPointage(): Promise<void> {
    const typesPointage: TypePointageModel[] = await this.typePointageService.getActiveTypePointage().toPromise();
    this.typePointageJsStoreService.clearData();
    for (let i = 0; i < typesPointage.length; i++)
      typesPointage[i].idFront = this.makeString();
    await this.typePointageJsStoreService.addAll(typesPointage);
  }

  /**
   * récupérer list des anomalies et enregistrer dans la index db
   */
  private async getListAnomalies(idRestaurant: number): Promise<void> {
    const anomalies: AnomalieModel[] = await this.anomalieService.getAllAnomalieByRestaurant(idRestaurant).toPromise();
    this.updateHeaderAnomalieService.setListGuiAnomalie(anomalies);
    this.sessionService.setNbrAnomalie(anomalies.length.toString())
    await this.addAnomalie(anomalies);
  }

  /**
   * ajouter  anomalies recuperer de la base de donnée (back) dans l'index db(jssstore)
   * @param anomalies
   */
  private async addAnomalie(anomalies: AnomalieModel[]): Promise<void> {
    if (anomalies.length > 0) {
      for (let i = 0; i < anomalies.length; i++) {
        anomalies[i].idFront = this.makeString();
        anomalies[i].dateAnomalie = this.dateService.setTimeNull(anomalies[i].dateAnomalie);
        const addedAnomalies = await this.anomalieJsStoreService.addAnomalie(anomalies[i]);
        this.listAnomalie.push(addedAnomalies[0]);
      }
    }
  }

  /**
   * cette methode permettera de definir la journee dactivite (date et journee) selon la date courante et le decoupage horaire
   * Aussi elle creera des alarmes periodique pour la fin de journee courant et debut de journee suivante
   */
  public async setDateJourneeAndOuvertureFermetureTimer(): Promise<void> {
    let currentDate = new Date();
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);
    const previousDate: Date = new Date(currentDate.getTime() - this.ONE_DAY_AS_MILLISECONDS);
    const nextDate: Date = new Date(currentDate.getTime() + this.ONE_DAY_AS_MILLISECONDS);
    const currentDay: JourSemaine = this.dateService.getJourSemaine(currentDate);
    const previousDay: JourSemaine = this.dateService.getJourSemaine(previousDate);
    const nextDay: JourSemaine = this.dateService.getJourSemaine(nextDate);
    const afterNextDay: JourSemaine = this.dateService.getJourSemaine(new Date(nextDate.getTime() + this.ONE_DAY_AS_MILLISECONDS));
    const listDecoupageHoraire: DecoupageHoraireModel[] = await this.decoupageHoraireJsStoreService.getListDecoupage();
    // DJA = Debut Journee Activite
    const debutJournee: DecoupageHoraireModel = listDecoupageHoraire.filter(item => item.phaseLibelle === 'DJA')[0];

    // FJA = Fin Journee Activite
    const finJournee: DecoupageHoraireModel = listDecoupageHoraire.filter(item => item.phaseLibelle === 'FJA')[0];
    const currentDayDecoupage: any = this.dateService.createDateFromDecoupageValues(currentDay, 0, debutJournee, finJournee);
    const previousDayDecoupage: any = this.dateService.createDateFromDecoupageValues(previousDay, -1, debutJournee, finJournee);
    const nextDayDecoupage: any = this.dateService.createDateFromDecoupageValues(nextDay, 1, debutJournee, finJournee);
    const afterNextDayDecoupage: any = this.dateService.createDateFromDecoupageValues(afterNextDay, 2, debutJournee, finJournee);

    if (currentDate >= currentDayDecoupage.debut && currentDate <= currentDayDecoupage.fin) {
      this.sessionService.setDateJournee(currentDate);
      this.sessionService.setJournee(currentDay);
      this.sessionService.setDebutJournee(currentDayDecoupage.debut);
      this.sessionService.setFinJournee(currentDayDecoupage.fin);
      this.alerteService.setTimer('fermetureAutomatiquePointese', currentDayDecoupage.fin, async () => {
        const dateJournne = JSON.parse(JSON.stringify(this.sessionService.getDateJournee()));
        await this.updatePointing(currentDayDecoupage.fin, finJournee['valeur' + this.dateService.convertStringToCamelCase(currentDay) + 'IsNight'], dateJournne, nextDayDecoupage.debut);
        this.sessionService.setPointeuseState(false);
        this.checkingSocialConstraintsRegularlyService.stopAudio();
        this.checkingSocialConstraintsRegularlyService.stopPreAlarme();
        this.sessionService.setIsOuvertureDone(false);
        //await this.getParametreByparam();
      })
      this.sessionService.setDateProchFermeture(currentDayDecoupage.fin);

      if (this.dateService.isSameDateOn(nextDayDecoupage.debut, currentDayDecoupage.fin, 'minutes')) {
        this.alerteService.setTimer('ouvertureAutomatiquePointeuse', nextDayDecoupage.debut, async () => {
          this.sessionService.setNbrTotempPointe(0);
          await this.getTokenPointeuseFromV2();
          await this.getInfoToPointeuse(+this.sessionService.getIdRestaurant());
          this.synchronisationService.updateState();
          this.restaurantService.launchImportNCRFiles(+this.sessionService.getIdRestaurant());
          this.createAchevalPointingOnOpen(nextDate);
        });
        this.sessionService.setDateProchOuverture(nextDayDecoupage.debut);

      } else {
        const differenceDate = currentDayDecoupage.fin.getTime() + (nextDayDecoupage.debut.getTime() - currentDayDecoupage.fin.getTime()) / 2;
        this.sessionService.setOuvertureInter(differenceDate);

        this.alerteService.setTimer('ouvertureAutomatiquePointeuse', new Date(differenceDate), async () => {
          this.sessionService.setNbrTotempPointe(0);
          await this.getTokenPointeuseFromV2();
          await this.getInfoToPointeuse(+this.sessionService.getIdRestaurant());
          this.synchronisationService.updateState();
          this.restaurantService.launchImportNCRFiles(+this.sessionService.getIdRestaurant());
          this.createAchevalPointingOnOpen(new Date(differenceDate));
        });
        this.sessionService.setDateProchOuverture(new Date(differenceDate));

        this.alerteService.setTimer('debloquerPointaeuse', nextDayDecoupage.debut, async () => {
          this.sessionService.setPointeuseState(true);
          this.setDateJourneeAndOuvertureFermetureTimer();
        });
        this.sessionService.setDateProchDeblocage(nextDayDecoupage.debut)
      }
    } else if (currentDate >= previousDayDecoupage.debut && currentDate <= previousDayDecoupage.fin) {
      this.sessionService.setDateJournee(previousDate);
      this.sessionService.setJournee(previousDay);
      this.alerteService.setTimer('fermetureAutomatiquePointese', previousDayDecoupage.fin, async () => {
        const dateJournne = JSON.parse(JSON.stringify(this.sessionService.getDateJournee()));
        await this.updatePointing(previousDayDecoupage.fin, previousDayDecoupage['valeur' + this.dateService.convertStringToCamelCase(currentDay) + 'IsNight'], dateJournne, currentDayDecoupage.debut);
        this.sessionService.setPointeuseState(false);
        this.checkingSocialConstraintsRegularlyService.stopAudio();

        this.sessionService.setDateProchFermeture(previousDayDecoupage.fin);
        this.checkingSocialConstraintsRegularlyService.stopPreAlarme();
        // await this.getParametreByparam();
        this.sessionService.setIsOuvertureDone(false);
      });
      if (this.dateService.isSameDateOn(previousDayDecoupage.fin, currentDayDecoupage.debut, 'minutes')) {
        this.alerteService.setTimer('ouvertureAutomatiquePointeuse', currentDayDecoupage.debut, async () => {
          this.sessionService.setNbrTotempPointe(0);
          await this.getTokenPointeuseFromV2();
          await this.getInfoToPointeuse(+this.sessionService.getIdRestaurant());
          this.synchronisationService.updateState();
          this.restaurantService.launchImportNCRFiles(+this.sessionService.getIdRestaurant());
          this.createAchevalPointingOnOpen(currentDate);
        });
        this.sessionService.setDateProchFermeture(previousDayDecoupage.fin);
        this.sessionService.setDateProchOuverture(currentDayDecoupage.debut);
      } else {
        const differenceDate = previousDayDecoupage.fin.getTime() + (currentDayDecoupage.debut.getTime() - previousDayDecoupage.fin.getTime()) / 2;
        this.alerteService.setTimer('ouvertureAutomatiquePointeuse', new Date(differenceDate), async () => {
          this.sessionService.setNbrTotempPointe(0);
          await this.getTokenPointeuseFromV2();
          await this.getInfoToPointeuse(+this.sessionService.getIdRestaurant());
          this.synchronisationService.updateState();
          this.restaurantService.launchImportNCRFiles(+this.sessionService.getIdRestaurant());
          this.createAchevalPointingOnOpen(new Date(differenceDate));
        });
        this.sessionService.setDateProchOuverture(new Date(differenceDate));
        this.alerteService.setTimer('debloquerPointaeuse', currentDayDecoupage.debut, async () => {
          this.sessionService.setPointeuseState(true);
          this.setDateJourneeAndOuvertureFermetureTimer();
        });
        this.sessionService.setDateProchDeblocage(currentDayDecoupage.debut);
      }
    } else if (currentDate >= nextDayDecoupage.debut && currentDate <= nextDayDecoupage.fin) {
      this.sessionService.setDateJournee(nextDate);
      this.sessionService.setJournee(nextDay);
      this.alerteService.setTimer('fermetureAutomatiquePointese', nextDayDecoupage.fin, async () => {
        const dateJournne = JSON.parse(JSON.stringify(this.sessionService.getDateJournee()));
        await this.updatePointing(nextDayDecoupage.fin, nextDayDecoupage['valeur' + this.dateService.convertStringToCamelCase(currentDay) + 'IsNight'], dateJournne,afterNextDayDecoupage.debut);
        this.sessionService.setPointeuseState(false);
        this.checkingSocialConstraintsRegularlyService.stopAudio();
        this.checkingSocialConstraintsRegularlyService.stopPreAlarme();
        this.sessionService.setDateProchFermeture(nextDayDecoupage.fin);
        this.sessionService.setIsOuvertureDone(false);
        //await this.getParametreByparam();
      });
    } else {
      this.sessionService.setDateJournee(currentDate >= currentDayDecoupage.fin ? nextDate : currentDate);
      this.sessionService.setJournee(currentDate >= currentDayDecoupage.fin ? nextDay : currentDay);
      const differenceWithPreviousDate = previousDayDecoupage.fin.getTime() + (currentDayDecoupage.debut.getTime() - previousDayDecoupage.fin.getTime()) / 2;
      const differencewithNextDate = currentDayDecoupage.fin.getTime() + (nextDayDecoupage.debut.getTime() - currentDayDecoupage.fin.getTime()) / 2;
      this.alerteService.setTimer('ouvertureAutomatiquePointeuse', currentDate >= currentDayDecoupage.fin ? new Date(differencewithNextDate) : new Date(differenceWithPreviousDate), async () => {
        this.sessionService.setNbrTotempPointe(0);
        await this.getTokenPointeuseFromV2();
        await this.getInfoToPointeuse(+this.sessionService.getIdRestaurant());
        this.synchronisationService.updateState();
        this.restaurantService.launchImportNCRFiles(+this.sessionService.getIdRestaurant());
        this.createAchevalPointingOnOpen(currentDate >= currentDayDecoupage.fin ? new Date(differencewithNextDate) : new Date(differenceWithPreviousDate));
      });
      currentDate >= currentDayDecoupage.fin ?this.sessionService.setDateProchOuverture( new Date(differencewithNextDate)) : this.sessionService.setDateProchOuverture(new Date(differenceWithPreviousDate));

      this.alerteService.setTimer('debloquerPointaeuse', currentDate >= currentDayDecoupage.fin ? nextDayDecoupage.debut : currentDayDecoupage.debut, async () => {
        this.sessionService.setPointeuseState(true);
        this.setDateJourneeAndOuvertureFermetureTimer();
      });
      currentDate >= currentDayDecoupage.fin ?this.sessionService.setDateProchDeblocage( new Date(differencewithNextDate)) : this.sessionService.setDateProchDeblocage(new Date(differenceWithPreviousDate));

    }
  }

  private async createAchevalPointingOnOpen(currentDay: Date) {
    this.sessionService.setPointeuseState(true);
    const lastDay = new Date(currentDay.getTime() - this.ONE_DAY_AS_MILLISECONDS);
    const yesterdayStringFormat = lastDay.getFullYear() + '-' + (lastDay.getMonth() + 1).toString().padStart(2, '0') + '-' + lastDay.getDate().toString().padStart(2, '0');
    const pointagedaily = await this.pointingService.getdailyPointages(yesterdayStringFormat);
    const achvealPoitings = this.listPointage;

  }

  /**
   * Cette methode traitera le cas où on aura un refresh de la page vu que la gestion des alarmes est dans un service donc le F5 provoque la reinitialisation du service donc la reinitialisation des alarmes periodiques
   */
  public checkDecoupagePresenceAndCreateAlarme(): void {
    this.decoupageHoraireJsStoreService.getListDecoupage().then((result: DecoupageHoraireModel[]) => {
      if (result.length) {
        this.setDateJourneeAndOuvertureFermetureTimer();
      }
    });
  }


  public async getParametreList(idRestaurant: number): Promise<void> {
    let parameters: ParametreModel[];
    await this.parametreService.getAllParametreByIdRestaurat(idRestaurant).toPromise().then(result => {
      parameters = result;
      this.sessionService.setSyncParamProgress(true);

      const paramSong = parameters.find((paramete: ParametreModel) => paramete.param === 'LANGUE_SONS');
      if (paramSong.valeur !== this.langueStorageService.getVocalLanguageSettings()) {
        this.langueStorageService.setVocalLanguageSettings(paramSong.valeur);
      }

    })
      .catch((err) => {
        console.log(err);
        this.sessionService.setSyncParamProgress(false);
      });
    this.parameterJsStoreService.clearData();
    for (let i = 0; i < parameters.length; i++) {
      parameters[i].idFront = this.makeString();
      await this.parameterJsStoreService.addParameter(parameters[i]);
      this.setLanguageParamToLocalStorage(parameters[i]);
    }
  }

  private setLanguageParamToLocalStorage(parametre): void {
    if (parametre.param === 'LANGUE_SONS') {
      this.langueStorageService.setVocalLanguageSettings(parametre.valeur.toLowerCase());
    }
    if (parametre.param === 'LANGUE_AFFICHAGE') {
      this.langueStorageService.setDisplayLanguageSettings(parametre.valeur.toLowerCase());
    }
    if (parametre.param === 'AFFICHAGE_DATE') {
      this.sessionService.setDisplayDateOption(parametre.valeur.toLowerCase());
    }
  }

  /**
   * get parametre by param
   */
  private async getParametreByparam(): Promise<void> {
    if (this.isOnline) {
      this.synchronisePrametre();
    }
  }

  public async updatePointing(dateFinActivity: Date, isNight: boolean, dateJournee: string,dateNextDebutActivity: Date): Promise<void> {
    if (this.isOnline) {
      this.paramatere = await this.parameterJsStoreService.getParamatreByParam(this.param);
      await this.getListPointage(dateFinActivity, isNight, dateJournee,dateNextDebutActivity);
    }
  }

  /**
   * get all pointagaes
   */
  private async getListPointage(dateFinActivity: Date, isNight: boolean, dateJournee: string,dateNextDebutActivity: Date): Promise<void> {
    this.listPointageFromIndexDb = await this.pointingService.getdailyPointages(dateJournee);
    await this.verifyExitpointing(dateFinActivity, isNight, dateJournee,dateNextDebutActivity);
  }

  /**
   * verifier l'existance de heur de fin pointage
   * @param dateFinActivity
   * @param isNight
   * @param dateJournee
   */
  private async verifyExitpointing(dateFinActivity: Date, isNight: boolean, dateJournee: string, dateNextDebutActivity: Date): Promise<void> {
    const paramatereMode: ParametreModel[] = await this.parameterJsStoreService.getParamatreByParam(this.paramMode24);

    for (let i = 0; i < this.listPointageFromIndexDb.length; i++) {

      if (!this.listPointageFromIndexDb[i].heureFin && (this.dateService.getDiffOn(dateFinActivity, dateNextDebutActivity, 'minutes') !== 0 || paramatereMode[0].valeur === '0')) {
        await this.updateOrDeletePointage(this.listPointageFromIndexDb[i], dateFinActivity, isNight, dateJournee);
      } else if (this.dateService.getDiffOn(dateFinActivity, dateNextDebutActivity, 'minutes') === 0 && paramatereMode[0].valeur !== '0' && (this.listPointageFromIndexDb[i].heureFin === null)) {
        this.createAchevalPointage(this.listPointageFromIndexDb[i]);
      }
    }
    if (this.isOnline) {
      await this.synchronisePointage(dateJournee);
    }
  }

  private async createAchevalPointage(pointage: PointageModel): Promise<void> {
    pointage.isAcheval = true;
    await this.planningJsStoreService.updatePointage(pointage);
  }

  /**
   * modifier ou supprimer un pontage
   * @param pointage
   * @param dateFinActivity
   * @param isNight
   * @param dateJournee
   */
  private async updateOrDeletePointage(pointage: PointageModel, dateFinActivity: Date, isNight: boolean, dateJournee: string): Promise<void> {
    const paramatere = await this.parameterJsStoreService.getParamatreByParam(this.param);
    if (paramatere[0].valeur === '1') {
      pointage.heureFin = this.dateService.createDatePlusHHmmTime(this.dateService.setTimeFormatHHMM(this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(dateFinActivity), ':')), 0 + '');
      pointage.heureFin = this.dateService.substractMinuteToDate(pointage.heureFin, 1);
      pointage.heureFin = this.dateService.getHHmmformatFromDateAndWithSeparator(pointage.heureFin, ':');
      let datFin = this.dateService.createDatePlusHHmmTime(this.dateService.setTimeFormatHHMM(this.dateService.getHHmmformatFromDateAndWithSeparator(new Date(dateFinActivity), ':')), 0 + '');
      pointage.heureFinIsNight = await this.contrainteSocialeService.checkIsNight(
        new Date(datFin.valueOf() - 60000), this.dateService.getCorrectDateJournee());
      pointage.tempsPointes = this.dateService.getTotalMinutes(<DateInterval>pointage);
      pointage.modified = 2;
      await this.pointingService.updatePointage(pointage);
      await this.addCorrectionPointage(pointage, EntityAction.MODIFICATION, dateJournee);
    } else if (paramatere[0].valeur === '0') {
      await this.pointingService.deletePointage(pointage.idFront);
      await this.addCorrectionPointage(pointage, EntityAction.DELETION, dateJournee);
    }
  }

  /**
   * ajouter de correction de pointage a chaque modifiction de pointage
   * @param pointage
   * @param dateJournee
   * @param entityAction
   */
  private async addCorrectionPointage(pointage: PointageModel, entityAction: EntityAction, dateJournee: string): Promise<void> {
    const employee = await this.employeJsStoreService.getEmployesByIdEmployee(pointage.idEmployee);
    const correctionPointage = {} as CorrectionPointageModel;
    correctionPointage.entityAction = EntityAction[entityAction];
    correctionPointage.dateModification = new Date();
    correctionPointage.nomEmployee = employee[0].nom;
    correctionPointage.prenomEmployee = employee[0].prenom;
    correctionPointage.idEmployee = pointage.idEmployee;
    correctionPointage.nomManager = null;
    correctionPointage.prenomManager = null;
    correctionPointage.idManager = 0;
    correctionPointage.idRestaurant = +this.sessionService.getIdRestaurant();
    correctionPointage.idFront = this.makeString();
    if (employee[0].badge) {
      correctionPointage.employeeCodeBadge = employee[0].badge.code;
    }
    if (entityAction === EntityAction.MODIFICATION) {
      // set old hours
      correctionPointage.oldValue = null;
      correctionPointage.oldValueIsNight = false;
      correctionPointage.pointageTime = PointageTime[PointageTime.EXIT];
      // set updated hours
      correctionPointage.newValue = pointage.heureFin;
      correctionPointage.newValueIsNight = pointage.heureFinIsNight;
    } else if (entityAction === EntityAction.DELETION) {
      // set old hours
      correctionPointage.oldValue = pointage.heureDebut;
      correctionPointage.oldValueIsNight = pointage.heureDebutIsNight;
      correctionPointage.pointageTime = PointageTime[PointageTime.ENTER_EXIT];
    }

    correctionPointage.pointageIdFront = pointage.idFront;
    correctionPointage.dayOfActivity = dateJournee;
    await this.correctionPointageJsStoreService.addCorrection(correctionPointage);

  }


  /**
   * save  pointage dans la base de donnée et supprimer les pointages en local avant deux mois
   */
  public async synchronisePointage(dateJournee: string): Promise<void> {
    let pointages: PointageModel[];
    pointages = await this.pointingService.getdailyPointages(this.sessionService.getDateJournee().toString());
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(new Date(this.sessionService.getDateJournee()));
    await this.synchronisationService.publishPointageClosePointeuse(pointages, this.sessionService.getDateJournee());
    await this.planningJsStoreService.deleteAllPointageBefore2Months();
  }


  public async synchroniseCorrectionPointage(dateJournee: string): Promise<void> {
    let corrections: CorrectionPointageModel[];
    corrections = await this.correctionPointageJsStoreService.getdailyCorrections(dateJournee);
    await this.correctionPointageService.updateCorrectionPointages(corrections, 0).toPromise();
  }

  /**
   * save parametre dans la base de donnée
   */
  public async synchronisePrametre(): Promise<void> {
    let parametres: ParametreModel[];
    parametres = await this.parameterJsStoreService.getListParameter();
    this.parametreService.updateParamsByRestaurant(parametres, +this.sessionService.getIdRestaurant()).toPromise();
  }

  public async getEmployePreteActifAndShiftAndPointage(idRestaurant: number): Promise<void> {
    // set employee prete in indexedDB
    let employeesDto = {} as EmployePointeuseDTO;
    await this.employeeService.getEmployePreteActifAndShiftAndPointageByIdRestaurantAndDateJournee(idRestaurant).toPromise().then(result => {
      employeesDto = result;
      this.sessionService.setSyncPretsProgress(true);
    })
      .catch((err) => {
        this.sessionService.setSyncPretsProgress(false);
        console.log(err);
      });
    if (employeesDto.employeeList && employeesDto.employeeList.length) {
      await this.getEmployeePreteAndSaveToLocalBase(employeesDto, idRestaurant);
      await this.getPointagesPretsAndSaveToLocalBase(employeesDto, idRestaurant);
      await this.getShiftPretAndSaveToLocalBase(employeesDto, idRestaurant);
    }

  }

  /**
   * recuperer les employes pretes actif et les suavegardent dans la base local
   */
  public async getEmployeePreteAndSaveToLocalBase(employeeDto, idRestaurant: number) {
    await this.employeJsStoreService.deleteEmployeePrete(this.tableNameEmployee, idRestaurant);
    for (let i = 0; i < employeeDto.employeeList.length; i++) {
      this.pretedEmployeeIdList.push(employeeDto.employeeList[i].idEmployee);
      employeeDto.employeeList[i].idFront = this.makeString();
    //  employeeDto.employeeList[i].idRestaurant = idRestaurant;
      await this.employeJsStoreService.addEmployee(employeeDto.employeeList[i]);
    }
  }

  public async getShiftPretAndSaveToLocalBase(employeeDto, idRestaurant: number) {
    await this.employeJsStoreService.deleteEmployeePrete(this.tableNameShift, idRestaurant);
    const listShiftSaved = await this.shiftJsStoreService.getShiftList();
    if (employeeDto.shiftList.length) {
      employeeDto.shiftList.forEach((item: ShiftModel) => {
          const indexShift = listShiftSaved.indexOf(item);
          if (indexShift === -1) {
            item.idFront = this.makeString();
            this.shiftJsStoreService.addShift(item);
          }
        }
      );
    }
  }

  /**
   * recuperer les pointages de prets les suavegardent dans la base local
   */
  public async getPointagesPretsAndSaveToLocalBase(employeeDto, idRestaurant: number) {
    await this.planningJsStoreService.deletePlanningPreteByEmployees(this.tableNamePointage, this.pretedEmployeeIdList);
    if (employeeDto.pointageList.length) {
      for (let i = 0; i < employeeDto.pointageList.length; i++) {
        if (!( employeeDto.pointageList[i].idFront)) {
          employeeDto.pointageList[i].idFront = this.makeString();
        }
          const dateDebut = this.dateService.createDateFromHourAndNightValue(new Date(`${employeeDto.pointageList[i].dateJournee} ${employeeDto.pointageList[i].heureDebut}`), employeeDto.pointageList[i].heureDebutIsNight);
          const datefin = this.dateService.createDateFromHourAndNightValue(new Date(`${employeeDto.pointageList[i].dateJournee} ${employeeDto.pointageList[i].heureFin}`), employeeDto.pointageList[i].heureFinIsNight);
          employeeDto.pointageList[i].tempsPointes = this.dateService.getDiffInMinutes(datefin, dateDebut);
          employeeDto.pointageList[i].idShift === 0 ? employeeDto.pointageList[i].idShift = null : true;
          employeeDto.pointageList[i].typePointageRef = (await this.typePointageJsStoreService.getOneById(employeeDto.pointageList[i]['typePointageRef']['id'])).pop();
          await this.planningJsStoreService.addPointage(employeeDto.pointageList[i]);
          this.listPointage.push(employeeDto.pointageList[i]);
        }
    }
  }
  public isCanReload (): boolean {
    return this.sessionService.getTimeToReload() >= this.onzeMinutes && (this.isDateBefore30MinuteOverture(this.sessionService.getDateProchOuverture(), this.currentDate) || this.isDateAfter30MinuteFermeture(this.sessionService.getDateProchFermeture(), this.currentDate))
  }
  public isDateBefore30MinuteOverture (dateOuverture: Date, currentDate: Date): boolean {
    return this.dateService.getDiffInMinutes(dateOuverture, currentDate) > this.thirteenMinutes;
  }
  public isDateAfter30MinuteFermeture (dateFermeture: Date, currentDate: Date): boolean {
    return this.dateService.getDiffInMinutes(currentDate, dateFermeture) > this.thirteenMinutes;
  }

  public setPointeuse_association_date(dateAssociation :string, uuidRestaurant: string) {
    this.restaurantService.changePointeuse_association_date(dateAssociation, uuidRestaurant).subscribe();
  }

  public async getInfoToPointeuseIfIndexedDBIsDeleted(idRestaurant: number): Promise<void> {
    if (this.isOnline) {
      await this.getDecopageHoraireAndSaveToLocalBase(idRestaurant);
      await this.getEmployeeActifAndSaveToLocalBase(idRestaurant);
      await this.getShiftAndSaveToLocalBase(idRestaurant);
      await this.getListAnomalies(idRestaurant);
      await this.getMessagesAndSaveToLocalBase(idRestaurant);
      await this.getActiveTypesPointage();
      await this.getParametreList(idRestaurant);
      await this.getInfoRestaurant();
      await this.getPointagesFromLocalStorageAndSaveToLocalBase();
      await this.getCorrectionPointagesFromLocalStorageAndSaveToLocalBase();
      await this.planningJsStoreService.deleteAllPointageBefore2Months();
      const paramPret = await this.parameterJsStoreService.getParamatreByParam(this.paramPret);
      if (paramPret[0].valeur === 'true') {
        await this.getEmployePreteActifAndShiftAndPointage(idRestaurant);
      }
      this.sessionService.setLastDateOuverturePointeuse(new Date());
      this.sessionService.setIsOuvertureDone(true);
    } else {
      await this.setDateJourneeAndOuvertureFermetureTimer();
    }
  }
  /**
   * recuperer les pointages et les suavegardent dans la base local
   */
  private async getPointagesFromLocalStorageAndSaveToLocalBase(): Promise<void> {
      const listPointageString = await this.sessionService.getAllPointagesFromLocalStorage();
      const backPointeusePointages = JSON.parse(listPointageString);
      if (backPointeusePointages.length) {
        for (let i = 0; i < backPointeusePointages.length; i++) {
          if (!this.listPointage.some((pointage: PointageModel) => pointage.idFront === backPointeusePointages[i].idFront)) {
            if (!(backPointeusePointages[i].idFront)) {
              backPointeusePointages[i].idFront = this.makeString();
            }
            await this.planningJsStoreService.addPointage(backPointeusePointages[i]);
            this.listPointage.push(backPointeusePointages[i]);
          }
        }
      }
  }

  private async getCorrectionPointagesFromLocalStorageAndSaveToLocalBase(): Promise<void> {
    const listCorrectionPointageString = await this.sessionService.getAllCorrectionPointagesFromLocalStorage();
    const backUpCorrectionPointages = JSON.parse(listCorrectionPointageString);
    if (backUpCorrectionPointages.length) {
      for (let i = 0; i < backUpCorrectionPointages.length; i++) {
          await this.correctionPointageJsStoreService.addCorrection(backUpCorrectionPointages[i]);
      }
    }
  }
  public async isInfoRestaurantIsEmpty(): Promise<boolean> {
    const restaurantsInfos =  await this.infoRestaurantJsStoreService.getRestaurantList();
    return (!(restaurantsInfos && restaurantsInfos.length));
  }

  public getInfoRestaurant() {
    this.restaurantService.getRestauratByCodePointeuse(this.sessionService.getCodeRestaurant()).subscribe(async (restaurant: RestaurantModel) => {
      if (restaurant && restaurant.idRestaurant) {
        restaurant.idFront = this.makeString();
        this.infoRestaurantJsStoreService.addRestaurant(restaurant);
        this.pointingService.restaurant = restaurant;
        this.sessionService.setIdRestaurant(restaurant.idRestaurant);
        this.sessionService.setRestaurantName(restaurant.libelle);
        this.sessionService.setPointeuseState(true);
      }
    });
  }

  public async checkIfIndexedDBIsDeletedAfterPassBadge() {
    const listEmployee = await this.employeJsStoreService.getEmployesList();
    this.onlineService.onlineState().subscribe((isOnline) => this.isOnline = isOnline);
    if ((this.isOnline && listEmployee.length === 0)) {
      await this.getInfoToPointeuseIfIndexedDBIsDeleted(+this.sessionService.getIdRestaurant());
      await this.setDateJourneeAndOuvertureFermetureTimer();
    }
  }

}
