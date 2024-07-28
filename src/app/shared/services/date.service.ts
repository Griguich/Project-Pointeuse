import {Injectable} from '@angular/core';
import {JourSemaine} from '../enumration/jour.semaine';
import * as moment from 'moment';
import {DurationInputArg1, DurationInputArg2} from 'moment';
import {RhisTranslateService} from './rhis-translate.service';
import {Observable, timer} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {DateInterval} from '../model/gui/date-interval';
import Diff = moment.unitOfTime.Diff;
import {SessionService} from './session.service';
import {DecoupageHoraireModel} from '../model/decoupage.horaire.model';


@Injectable({
  providedIn: 'root'
})
export class DateService {
  // 86400000 = 24(heure) * 60(mn) * 60(s) * 1000(ms)
  private ONE_DAY_AS_MILLISECONDS = 86400000;

  constructor(private rhisTranslateService: RhisTranslateService,
              private sessionService: SessionService) {
    this.runClock();
  }

  public addMinuteToDate(date: Date, minutesToAdd: number): Date {
    return moment(date).add(minutesToAdd, 'm').toDate();
  }

  public addToDate(date: Date, nbrOfUnit: number, unit: DurationInputArg2): Date {
    return moment(date).add(nbrOfUnit, unit).toDate();
  }

  public subtractFromDate(date: Date, nbrOfUnit: number, unit: DurationInputArg2): Date {
    return moment(date).subtract(nbrOfUnit, unit).toDate();
  }

  public substractMinuteToDate(date: Date, minutesToSubstract: number): Date {
    return moment(date).subtract(minutesToSubstract, 'm').toDate();
  }

  public isSameDateOn(d1: Date | string, d2: Date | string, unit: Diff): boolean {
    return moment(d1).isSame(d2, unit);
  }

  public getHHmmformatFromDateAndWithSeparator(date: Date | string, separator: string): string {
    return `${('0' + new Date(date).getHours()).slice(-2)}${separator}${('0' + new Date(date).getMinutes()).slice(-2)}`;
  }

  public HHmmTimeStringToNumber(time: string): number {
    const hoursMinutes = time.split(/[.:]/);
    const hours = parseInt(hoursMinutes[0], 10);
    const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return (hours * 60) + minutes;
  }

  public substractDayFrom(dayNumber: DurationInputArg1, date: string | Date, unit: DurationInputArg2): Date {
    return moment(date).subtract(dayNumber, unit).toDate();
  }

  public getDiffOn(d1: Date, d2: Date, unit: Diff): number {
    return moment(d1).diff(d2, unit, true);
  }

  // calcule la difference heure de fin et heure de debut
  public getDiffInMinutes(heureFin: Date, heureDebut: Date): number {
    return moment(heureFin).diff(heureDebut, 'minutes');
  }

  public getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(firstInterval: DateInterval, secondInterval: DateInterval): [Date, Date] {
    return this.getIntersectionOfTowDatesInterval(
      [
        this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
        this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      ],
      [
        this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight),
        this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight),
      ]
    );
  }

  public getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNightifAcheval(firstInterval: DateInterval, secondInterval: DateInterval): [Date, Date] {
    return this.getIntersectionOfTowDatesInterval(
      [
        this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebutAcheval}`), firstInterval.heureDebutIsNight),
        this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      ],
      [
        this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight),
        this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight),
      ]
    );
  }

  public isIncluded(firstInterval: DateInterval, secondInterval: DateInterval): boolean {
    const isSameOrAfter = this.isSameOrAfter(
      this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
      this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight)
    );
    const isSameOrBefore = this.isSameOrBefore(
      this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight)
    );
    return isSameOrAfter && isSameOrBefore;
  }

  public isSameOrAfter(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSameOrAfter(secondDate, 'minutes');
  }

  public isSameOrAfterWithDate(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSameOrAfter(secondDate);
  }

  public isSameOrBefore(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSameOrBefore(secondDate, 'minutes');
  }

  public isTheSameDates(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSame(secondDate, 'minutes');
  }

  public getDiffInMinutesForStartHours(firstInterval: DateInterval, secondInterval: DateInterval): number {
    return this.getDiffInMinutes(
      this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
      this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight)
    );
  }

  public getDiffInMinuteForEndHours(firstInterval: DateInterval, secondInterval: DateInterval): number {
    return this.getDiffInMinutes(
      this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight)
    );
  }

  public getDiffInMinuteBetweenIntervals(firstInterval: DateInterval, secondInterval: DateInterval, unit: Diff): number {
    return this.getDiffOn(
      this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureDebut}`), secondInterval.heureDebutIsNight),
      this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureFin}`), firstInterval.heureFinIsNight),
      unit
    );
  }

  public getTotalMinutes(dateInterval: DateInterval): number {
    return this.getDiffInMinutes(
      this.createDateFromHourAndNightValue(new Date(`${dateInterval.dateJournee} ${dateInterval.heureFin}`), dateInterval.heureFinIsNight),
      this.createDateFromHourAndNightValue(new Date(`${dateInterval.dateJournee} ${dateInterval.heureDebut}`), dateInterval.heureDebutIsNight)
    );
  }

  public isSameOrBeforeByDayTimeAndIsNight(firstDateInterval: DateInterval, secondDateInterval: DateInterval): boolean {
    return this.isSameOrBefore(
      this.createDateFromHourAndNightValue(new Date(`${firstDateInterval.dateJournee} ${firstDateInterval.heureDebut}`), firstDateInterval.heureDebutIsNight),
      this.createDateFromHourAndNightValue(new Date(`${secondDateInterval.dateJournee} ${secondDateInterval.heureDebut}`), secondDateInterval.heureDebutIsNight)
    );
  }

  public isSameOrBeforeByDayTimeAndIsNightAcheval(firstDateInterval: DateInterval, secondDateInterval: DateInterval): boolean {
    if (firstDateInterval.isAcheval) {
      const heurDebutJournee = this.getHHmmformatFromDateAndWithSeparator(this.sessionService.getDebutJournee(), ':');
      return this.isSameOrBefore(
        this.createDateFromHourAndNightValue(new Date(`${firstDateInterval.dateJournee} ${heurDebutJournee}`), false),
        this.createDateFromHourAndNightValue(new Date(`${secondDateInterval.dateJournee} ${secondDateInterval.heureDebut}`), secondDateInterval.heureDebutIsNight)
      );
    } else {
      return this.isSameOrBefore(
        this.createDateFromHourAndNightValue(new Date(`${firstDateInterval.dateJournee} ${firstDateInterval.heureDebut}`), firstDateInterval.heureDebutIsNight),
        this.createDateFromHourAndNightValue(new Date(`${secondDateInterval.dateJournee} ${secondDateInterval.heureDebut}`), secondDateInterval.heureDebutIsNight)
      );
    }

  }

  public getBreakBettwenTwoShift(firstInterval: DateInterval, secondInterval: DateInterval): number {
    return this.getDiffInMinutes(
      this.createDateFromHourAndNightValue(new Date(`${firstInterval.dateJournee} ${firstInterval.heureDebut}`), firstInterval.heureDebutIsNight),
      this.createDateFromHourAndNightValue(new Date(`${secondInterval.dateJournee} ${secondInterval.heureFin}`), secondInterval.heureFinIsNight)
    );
  }

  public sortDates(d1: Date, d2: Date): -1 | 1 | 0 {
    if (moment(d1).isSame(d2, 'minute')) {
      return 0;
    }
    return moment(d1).isBefore(d2, 'minute') ? 1 : -1;
  }

  public isBeforeInHoursAndMinutes(date1: Date | string, date2: Date | string, date1IsNight = false, date2IsNight = false): boolean {
    let dateToCompare1: Date;
    let dateToCompare2: Date;
    dateToCompare1 = this.createDateFromTime(new Date(), date1, date1IsNight ? 1 : 0);
    dateToCompare2 = this.createDateFromTime(new Date(), date2, date2IsNight ? 1 : 0);
    return moment(dateToCompare1).isBefore(dateToCompare2);
  }

  public isBefore(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isBefore(secondDate, 'minute');
  }

  /**
   * Check if tow date intervals intersect or not
   * @param: firstInterval
   * @param: secondInterval
   */
  public isIntersect(firstInterval: [Date, Date], secondInterval: [Date, Date]): boolean {
    return !((firstInterval[0] > secondInterval[1]) || (secondInterval[0] > firstInterval[1]));
  }

  /**
   * Cette methode permet de retourner le jourSemaine d'un integer en param
   * @param: jour
   */
  public getJourSemaineFromInteger(jour: number): JourSemaine {
    let jourSemaine: JourSemaine;
    switch (jour) {
      case 0: {
        jourSemaine = JourSemaine.DIMANCHE;
        break;
      }
      case 1: {
        jourSemaine = JourSemaine.LUNDI;
        break;
      }
      case 2: {
        jourSemaine = JourSemaine.MARDI;
        break;
      }
      case 3: {
        jourSemaine = JourSemaine.MERCREDI;
        break;
      }
      case 4: {
        jourSemaine = JourSemaine.JEUDI;
        break;
      }
      case 5: {
        jourSemaine = JourSemaine.VENDREDI;
        break;
      }
      case 6: {
        jourSemaine = JourSemaine.SAMEDI;
        break;
      }
      default: {
        // statements;
        break;
      }
    }
    return jourSemaine;
  }

  public getNumberOfDaysFromRestaurantFirstWeekDay(restaurantFirstWeekDay: JourSemaine, currentDateJournee: string | Date, minusDaysNumber: number = 0): Date[] {
    const comparedDay = this.getJourSemaineFromInteger(new Date(currentDateJournee).getDay());
    const weekDays = [];
    const wantedDates: Date[] = [];
    for (const day in JourSemaine) {
      weekDays.push(day);
    }
    const comparedDayIndex = weekDays.findIndex((day: JourSemaine) => day === comparedDay);
    const firstRestaurantWeekDayIndex = weekDays.findIndex((day: JourSemaine) => day === restaurantFirstWeekDay);
    let difference = comparedDayIndex - firstRestaurantWeekDayIndex;
    difference = difference >= 0 ? difference : (difference + 7);
    if (difference !== 0) {
      for (let i = 1; i <= (difference + minusDaysNumber); i++) {
        wantedDates.push(moment(currentDateJournee).subtract(i, 'days').toDate());
      }
    }
    return wantedDates;
  }

  public getDateOfJourSemaineByRestaurantFirstDayAndCurrentDate(restaurantFirstWeekDay: JourSemaine, currentDateJournee: string | Date, jourSemaine: JourSemaine): Date {
    const comparedDay: JourSemaine = this.getJourSemaineFromInteger(new Date(currentDateJournee).getDay());
    const weekDays = [];
    for (const day in JourSemaine) {
      weekDays.push(day);
    }
    const comparedDayIndex = weekDays.findIndex((day: JourSemaine) => day === comparedDay);
    const firstRestaurantWeekDayIndex = weekDays.findIndex((day: JourSemaine) => day === restaurantFirstWeekDay);
    const jourSemaineIndex = weekDays.findIndex((day: JourSemaine) => day === jourSemaine);
    let differenceForCurrentDateFromRestaurantFirstWeekDay = comparedDayIndex - firstRestaurantWeekDayIndex;
    if (differenceForCurrentDateFromRestaurantFirstWeekDay < 0) {
      differenceForCurrentDateFromRestaurantFirstWeekDay += 7;
    }
    const firstRestaurantWeekDayDate: Date = moment(currentDateJournee).subtract(differenceForCurrentDateFromRestaurantFirstWeekDay, 'days').toDate();
    let jourSemaineDifferenceFromFirsRestaruanttWeekDay = (jourSemaineIndex - firstRestaurantWeekDayIndex);
    if (jourSemaineDifferenceFromFirsRestaruanttWeekDay < 0) {
      jourSemaineDifferenceFromFirsRestaruanttWeekDay += 7;
    }
    return moment(firstRestaurantWeekDayDate).add(jourSemaineDifferenceFromFirsRestaruanttWeekDay, 'days').toDate();
  }

  public formatToShortDate(date: Date | string, seperator: string = '-'): string {
    const dateToFormat = new Date(date);
    return ('0' + dateToFormat.getDate()).slice(-2) + seperator + ('0' + (dateToFormat.getMonth() + 1)).slice(-2) + seperator + dateToFormat.getFullYear();
  }

  public createDateFromTime(jourDate: string | Date, time: string | Date, numberDaysToAdd: number = 0): Date {
    const date = this.getCorrectDateJournee(jourDate);
    if (!(time instanceof Date)) {
      const timeParts = time.split(':');
      date.setHours(timeParts.length >= 2 ? +timeParts[0] : 0,
        timeParts.length >= 2 ? +timeParts[1] : 0, 0, 0);
    } else {
      date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    }
    return moment(date).add(numberDaysToAdd, 'days').toDate();
  }

  public createDatePlusHHmmTime(date: Date, time: string): Date {
    date.setSeconds(0, 0);
    const timeToMilliseconds = this.HHmmTimeStringToNumber(time) * 60 * 1000;
    return new Date(date.getTime() + timeToMilliseconds);
  }

  public createDateFromHourAndNightValue(date: Date, isNight: boolean): Date {
    return moment(date).add(isNight ? 1 : 0, 'days').toDate();
  }

  public getIntersectionOfTowDatesInterval(firstBlockOfDates: [Date, Date], secondBlockOfDates: [Date, Date]): [Date, Date] {
    if ((firstBlockOfDates[0] >= secondBlockOfDates[1]) || (secondBlockOfDates[0] >= firstBlockOfDates[1])) {
      return [null, null];
    } else {
      const start: Date = firstBlockOfDates[0] > secondBlockOfDates[0] ? firstBlockOfDates[0] : secondBlockOfDates[0];
      const end: Date = firstBlockOfDates[1] < secondBlockOfDates[1] ? firstBlockOfDates[1] : secondBlockOfDates[1];
      return [start, end];
    }
  }

  public setTimeFormatHHMM(param: any): Date {
    if (param && !(param instanceof Date)) {
      if (param) {
        const dateParser = new Date();
        dateParser.setMinutes(+(param.substr(3, 2)));
        dateParser.setHours(+(param.substr(0, 2)));
        dateParser.setSeconds(0);
        dateParser.setMilliseconds(0);
        param = dateParser;
      }
    }
    return param;
  }

  // conversion number to time
  public convertNumberToTime(minutesCumule: number): any {
    let diffAsString = '';
    const hours = Math.floor(minutesCumule / 60);
    diffAsString = diffAsString.concat(hours.toString());
    diffAsString = diffAsString.concat('.');
    const minutes = minutesCumule - (hours * 60);
    if (minutes < 10) {
      diffAsString = diffAsString.concat('0');
      diffAsString = diffAsString.concat(minutes.toString());
    } else {
      diffAsString = diffAsString.concat(minutes.toString());
    }
    return diffAsString;
  }

  /**
   * Permet de saisir la date correctement, permet d eviter le probleme de decalage horaire
   * @param : data
   */
  public setCorrectDate(data: Date): Date {
    if (data) {
      data.setHours(12);
    }

    return data;
  }

  /**
   * Cette methode permet de retourner le jourSemaine d'une date passer en param
   * @param: jour
   */
  getJourSemaine(jour: Date): JourSemaine {
    return this.getJourSemaineFromInteger(jour.getDay());
  }

  /**
   * transformer date pour passer en url
   * @param: dateChosit
   */
  public formatDateToScoreDelimiter(dateChosit: Date) {
    dateChosit = this.setCorrectDate(dateChosit);
    const dateFinMonth = dateChosit.getMonth() + 1;
    let stringDateChoisit: string;
    let stringDateChoisitDay: string;
    let stringDateChoisitMonth: string;
    if (dateChosit.getDate() < 10) {
      stringDateChoisitDay = '0' + dateChosit.getDate();
    } else {
      stringDateChoisitDay = dateChosit.getDate().toString();
    }
    if (dateChosit.getMonth() + 1 < 10) {
      stringDateChoisitMonth = '0' + dateFinMonth;
    } else {
      stringDateChoisitMonth = dateFinMonth.toString();
    }
    stringDateChoisit = stringDateChoisitDay + '-' + stringDateChoisitMonth + '-' + dateChosit.getFullYear();
    return stringDateChoisit;
  }

  // conversion la date time en date selement
  public setTimeNull(date): Date {
    if (date) {
      date = new Date(date);
    } else {
      date = new Date();
    }
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  /**
   * Cette methode permet de retourner le 'Code' du mois utilisé pour la traduction dans les fichiers fr.json et en.json
   * @param: monthNumber
   */
  public getMonthAsStringFromNumber(monthNumber: number): string {
    switch (monthNumber) {
      case 0: {
        return 'JAN';
      }
      case 1: {
        return 'FEV';
      }
      case 2: {
        return 'MARS';
      }
      case 3: {
        return 'AVRIL';
      }
      case 4: {
        return 'MAI';
      }
      case 5: {
        return 'JUIN';
      }
      case 6: {
        return 'JUL';
      }
      case 7: {
        return 'AOUT';
      }
      case 8: {
        return 'SEP';
      }
      case 9: {
        return 'OCT';
      }
      case 10: {
        return 'NOV';
      }
      case 11: {
        return 'DEC';
      }
      default: {
        return '';
      }
    }
  }

  /**
   * Cette metohde permet de retourner comme string la valeur de la date exp '07/10/2019' retourne 'Lundi 07 Octobre 2019'
   * @param: dateJournee
   */
  public setFullDateAsString(dateJournee: Date): string {
    const dayOfWeek = this.rhisTranslateService.translate('DAYS.' + this.getJourSemaine(dateJournee));
    const dayOfMonth = dateJournee.getDate();
    const month = this.rhisTranslateService.translate('MOIS.' + this.getMonthAsStringFromNumber(dateJournee.getMonth()));
    const year = dateJournee.getFullYear();

    return dayOfWeek + ' ' + dayOfMonth + ' ' + month + ' ' + year;
  }

  /**
   * Cette methode permet de mettre les heures dans la correcete format en respectant si l'heure est heure de nuit ou non
   * @param: item
   */
  public setCorrectTimeToDisplay(item: any): void {
    item.heureDebut = this.setTimeFormatHHMM(item.heureDebut);
    if (item.heureDebutIsNight) {
      item.heureDebut.setDate(item.heureDebut.getDate() + 1);
    }
    item.heureFin = this.setTimeFormatHHMM(item.heureFin);
    if (item.heureFinIsNight) {
      item.heureFin.setDate(item.heureFin.getDate() + 1);
    }
  }

  /**
   * Cette methode permet de convertir le string du jour semaine en un string ayant la forme suivant (JEUDI => Jeudi)
   * @param day
   */
  public convertStringToCamelCase(day: string): string {
    let convertedItem = day.charAt(0);
    convertedItem = convertedItem.concat(day.substring(1, day.length).toLowerCase());
    return convertedItem;
  }

  private _clock: Observable<Date>;
  get clock(): Observable<Date> {
    return this._clock;
  }

  /**
   * Cette methode permet de creer un observable qui se lance chaque 1 seconde et retourne la valeur courante du date et heure
   */
  public runClock(): void {
    const now = new Date();
    const diffMilliSecondsNextMinute = (60 - now.getSeconds()) * 1000;
    this._clock = timer(diffMilliSecondsNextMinute, 60000).pipe(
      map((x: number) => {
        return new Date();
      }),
      share()
    );
  }

  public isTimeValue(value: string): boolean {
    const timePattern = new RegExp('^([01]?[0-9]|2[0-3]):[0-5][0-9]$');
    return timePattern.test(value.toString());
  }

  /**
   * Permet de creer un string HH:MM
   */
  setStringFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + minutes;
  }

  /**
   * permet de retourner la format yyy-mm-dd d'une date
   * @param date
   */
  public getDareFormat(date: Date): string {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }


  public dateToShortForm(dateJournee: Date): string {
    return dateJournee.getFullYear() + '-' + (dateJournee.getMonth() + 1).toString().padStart(2, '0') + '-' + dateJournee.getDate().toString().padStart(2, '0');
  }

  public dateToLongForm(dateJournee: Date): string {
    return this.getJourSemaineFromInteger(dateJournee.getDay()).toLowerCase() + ' ' + dateJournee.getDate().toString().padStart(2, '0') + ' ' + this.rhisTranslateService.translate('MOIS.' + this.getMonthAsStringFromNumber(dateJournee.getMonth()));
  }

  public delay(milliSeconds: number): Promise<void> {
    return new Promise(resolve => {
      const timer = setTimeout(_ => {
        resolve();
        clearTimeout(timer);
      }, milliSeconds);
    });
  }

  public getDiffBetweenTwoDatesWithNightHours(d1: Date, d1IsNight: Boolean, d2: Date, d2IsNight: Boolean, unit: Diff): number {
    d1 = d1IsNight ? new Date(d1.setDate(d1.getDate() + 1)) : d1;
    d2 = d2IsNight ? new Date(d2.setDate(d2.getDate() + 1)) : d2;
    return moment(d1).diff(d2, unit, true);
  }

  /**
   * permet de recupérer j-1
   * @param today
   */
  public getYesterDay(today: Date | string): string {
    const yesterday = new Date(new Date(today).getTime() - 86400000);
    return yesterday.getFullYear() + '-' + (yesterday.getMonth() + 1).toString().padStart(2, '0') + '-' + yesterday.getDate().toString().padStart(2, '0');
  }

  public getDateFromDateIntervalFor(interval: DateInterval, hour: 'heureDebut' | 'heureFin'): Date {
    return this.createDateFromHourAndNightValue(new Date(`${interval.dateJournee} ${interval[hour]}`), interval[`${hour}IsNight`]);
  }

  /**
   * Cette methode permettra de creer une pair de date (debut / fin) qui est le debut de journee dactivite et fin de journee dactivite du day passer en param
   * @param day
   * @param offset
   * @param debutJournee
   * @param finJournee
   */
  public createDateFromDecoupageValues(day: string, offset: number, debutJournee: DecoupageHoraireModel, finJournee: DecoupageHoraireModel): { 'debut': Date, 'fin': Date } {
    const currentDate: Date = new Date(new Date().getTime() + (offset * this.ONE_DAY_AS_MILLISECONDS));
    currentDate.setSeconds(0);
    currentDate.setMilliseconds(0);

    const heureDebut: string = debutJournee['valeur' + this.convertStringToCamelCase(day)];
    const heureFin: string = finJournee['valeur' + this.convertStringToCamelCase(day)];

    let dateDebut: Date = new Date(currentDate.getTime());
    dateDebut.setHours(+(heureDebut.substr(0, 2)));
    dateDebut.setMinutes(+(heureDebut.substr(3, 2)));

    if (debutJournee['valeur' + this.convertStringToCamelCase(day) + 'IsNight']) {
      dateDebut = new Date(dateDebut.getTime() + this.ONE_DAY_AS_MILLISECONDS);
    }

    let dateFin: Date = new Date(currentDate.getTime());
    dateFin.setHours(+(heureFin.substr(0, 2)));
    dateFin.setMinutes(+(heureFin.substr(3, 2)));

    if (finJournee['valeur' + this.convertStringToCamelCase(day) + 'IsNight']) {
      dateFin = new Date(dateFin.getTime() + this.ONE_DAY_AS_MILLISECONDS);
    }

    return {'debut': dateDebut, 'fin': dateFin};
  }

  getCorrectDateJournee(date?: any, initHours?: boolean): Date {

    const rawDate = date ? new Date(date) : new Date(this.sessionService.getDateJournee());
    const userTimezoneOffset = rawDate.getTimezoneOffset() * 60000;
    if (userTimezoneOffset > 0) {
      if (initHours) {
        return new Date(rawDate.getTime());
      } else {
        return new Date(rawDate.getTime() + userTimezoneOffset);
      }

    } else {
      return rawDate;
    }
  }
   initializeDate(date: Date): Date {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
  }

  public isEquals(firstDate: Date, secondDate: Date): boolean {
    return moment(firstDate).isSame(secondDate);
  }
}
