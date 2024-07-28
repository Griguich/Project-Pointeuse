import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {DateService} from '../../../shared/services/date.service';
import {SessionService} from "../../../shared/services/session.service";

@Component({
  selector: 'rhis-hours-div',
  templateUrl: './hours-div.component.html',
  styleUrls: ['./hours-div.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoursDivComponent implements OnChanges {

  @Input() id: string;
  @Input() shift;
  @Input() pointage;
  @Input() isPlanif: boolean;
  @Input() employe: any;
  @Input() intersection: boolean;
  @Output()
  public clickedAbsence = new EventEmitter<any>();

  @Input() set widthOfMinute(value: number) {
    if (value) {
      this.minutesWidht = value;
      this.setMesures(value);
      this.setColors();
    }
  }

  @Input()
  set partitions(parts: []) {
    if (parts) {
      this.parts = parts;
    }
  }

  public widthTotal: number;
  public width: number;
  public widthLeft = 0;
  public widthRight = 0;
  public left = 0;
  public top = 22;
  public color: string;
  public minutesWidht: number;
  public parts: any[];

  public cssClassDebut: string;
  public cssClassFin: string;
  public cssClassTiret: string;

  private readonly GRAY = '#7a7a7a';
  private readonly GREEN = '#2DC76Dcc';
  private readonly LIGHT_GREEN = '#2DC76D42';
  private readonly GRAY_TIME = 'time-gris';
  private readonly GREEN_TIME = 'time-green';
  private readonly ORANGE_TIME = 'time-orange';
  private readonly RED_TIME = 'time-red';

  constructor(public dateService: DateService,
              private sessionService: SessionService) {
  }

  /**
   * Set widths of shift/``pointage``/absence based on the width on a minute and ``GuiGdh`` attributes values and place theme properly in th
   * @param widthOfMinute: width of a minutes in pixels
   */
  private setMesures(widthOfMinute: number): void {
    this.calculateTotalElementWidth(widthOfMinute);
    this.calculateRealWidthOfPointageOrAbsence(widthOfMinute);
    this.calculateMarginsAndPositionsInTimeAxe(widthOfMinute);
    this.addExtraBlocksMesures();
  }

  private addExtraBlocksMesures(): void {
    if (this.parts && this.minutesWidht) {
      const extraBlocksMesure = this.parts.map(part => {
        if (part && part[1]) {
          return this.dateService.getDiffInMinutes(part[1].interval[1], part[1].interval[0]) * this.minutesWidht;
        }
        return 0;
      }).reduce((firstDuration: number, secondDuration: number) => firstDuration + secondDuration, 0);
      this.widthTotal += extraBlocksMesure;
    }
  }

  private calculateRealWidthOfPointageOrAbsence(widthOfMinute: number): void {
    if (!this.isPlanif && this.shift && (this.shift.idShift !== null) && this.pointage) {
      // it's a ``pointage`` associated with a shfit, so we calculate the start/end of the intersection between
      // the ``pointage`` and it's shift, we can have three blocks here (delay / advance for the start hour, ``pointage`` and delay / advance for the end hour)
      const [start, end] = this.dateService.getIntersectionOfTowDatesIntervalComposedByDayTimeAndIsNight(this.shift, this.pointage);
      if (start === end === null) {
        this.width = this.shift.totalHeure * widthOfMinute;
      } else {
        this.width = this.dateService.getDiffInMinutes(end, start) * widthOfMinute;
      }
    } else {
      this.width = this.widthTotal;
    }
  }

  private calculateMarginsAndPositionsInTimeAxe(widthOfMinute: number): void {
    if (this.pointage) {
      // calculate delay / advance block widths for a ``pointage``
      this.widthLeft = Number(this.timeToPixel(Math.abs(this.pointage.arrives), widthOfMinute));
      this.widthRight = Number(this.timeToPixel(Math.abs(this.pointage.sortie), widthOfMinute));
      if (this.minutesWidht && this.parts && this.parts.length && this.parts[0] && this.parts[0].length && this.parts[0][0]) {
        const endCurrentShift = this.dateService.createDateFromHourAndNightValue(new Date(`${this.shift.dateJournee} ${this.shift.heureFin}`), this.shift.heureFinIsNight);
        const startNextShift = this.dateService.createDateFromHourAndNightValue(new Date(`${this.parts[0][0].shift.dateJournee} ${this.parts[0][0].shift.heureDebut}`), this.parts[0][0].shift.heureDebutIsNight);
        this.widthRight = this.dateService.getDiffInMinutes(startNextShift, endCurrentShift) * this.minutesWidht;
      }
    }

    // Display shift/absence/``pointage`` in the axe time by calculating margin left
    if (this.isPlanif) {
      this.left = Number(this.shift.heureDebut.substring(3, 5)) * widthOfMinute;
    } else if (this.pointage && (this.pointage.arrives > 0)) {
      this.left = Number(this.shift.heureDebut.substring(3, 5)) * widthOfMinute;
    }
  }

  private calculateTotalElementWidth(widthOfMinute: number): void {
    let day = new Date();
    if (this.isPlanif) {
      // this item is a shift
      if (this.shift.acheval) {
        if (this.shift.modifiable) {
          this.widthTotal = this.dateService.getDiffOn(this.dateService.createDateFromTime(new Date(day.setDate(day.getDate() + 1)), this.shift.heureFin), this.dateService.createDateFromTime(new Date(), this.shift.heureDebut), 'minutes');
        } else {
          this.widthTotal =
            this.widthTotal = this.dateService.getDiffOn( this.dateService.createDateFromTime(new Date(), this.shift.heureFin), new Date(this.sessionService.getDebutJournee().getTime()), 'minutes');
        }

      } else {
        this.widthTotal =
          this.shift.totalHeure * widthOfMinute;
      }

    } else {
      // calcul de largeur pointage pour pointage a cheval
      if (this.pointage.isAcheval === true) {
        if (this.pointage.heureFin !== null) {
          // si  d'heur de fin saisi calculer la largeur entre debut de journée et heur fin
          this.widthTotal = this.dateService.getDiffOn(this.dateService.createDateFromTime(new Date(), this.pointage.heureFin), new Date(this.sessionService.getDebutJournee().getTime()), 'minutes');
        } else {
          // si pas d'heur de fin  calculer la largeur entre debut de journée et date actuelle
          this.widthTotal = this.dateService.getDiffOn(new Date(), this.sessionService.getDebutJournee(), 'minutes');
        }
      } else {
        // this item is a ``pointage``
        this.widthTotal =
          this.pointage.tempsPointes * widthOfMinute;
      }
    }
    if (this.pointage) {
      if (this.pointage.arrives > 0) {
        this.widthTotal += (Math.abs(this.pointage.arrives) * widthOfMinute);
      }
      if (this.pointage.sortie < 0) {
        this.widthTotal += (Math.abs(this.pointage.sortie) * widthOfMinute);
      }
    }
  }

  private setColors(): void {
    this.color = this.GRAY;

    this.cssClassTiret = 'time-white';
    if (!this.isPlanif) {
      this.color = this.GREEN;
      this.cssClassDebut = '';
      this.cssClassFin = '';
      if (this.pointage.arrives !== 0 || this.pointage.sortie !== 0) {
        this.color = this.LIGHT_GREEN;
        this.cssClassTiret = this.GRAY_TIME;
        this.cssClassDebut = this.GREEN_TIME;
        this.cssClassFin = this.GREEN_TIME;
      }
      if (this.pointage.arrives < 0) {
        this.cssClassDebut = this.ORANGE_TIME;
      }
      if (this.pointage.arrives > 0) {
        this.cssClassDebut = this.RED_TIME;
      }
      if (this.pointage.sortie < 0) {
        this.cssClassFin = this.RED_TIME;
      }
      if (this.pointage.sortie > 0) {
        this.cssClassFin = this.ORANGE_TIME;
      }
    }
  }

  public startAbsenceData(pointage: any, shift: any): void {
    if (pointage.arrives > 0) {
      const data = {
        'dateJournee': pointage.dateJournee,
        'heureDebut': shift.heureDebut,
        'heureDebutIsNight': shift.heureDebutIsNight,
        'heureFin': pointage.heureDebut,
        'heureFinIsNight': pointage.heureDebutIsNight,
        'libelle': 'Retard',
        'totalMinutesPointage': pointage.tempsPointes,
        'arrivee': pointage.arrives,
        'sortie': pointage.sortie
      };
      data['totalMinutes'] = this.dateService.getTotalMinutes(data);
      this.clickedAbsence.emit(data);
    } else {
      this.clickedAbsence.emit(null);
    }

  }

  public endAbsenceData(pointage: any, shift: any): void {
    if (pointage.sortie < 0) {
      const data = {
        'dateJournee': pointage.dateJournee,
        'heureDebut': pointage.heureFin,
        'heureDebutIsNight': pointage.heureFinIsNight,
        'heureFin': shift.heureFin,
        'heureFinIsNight': shift.heureFinIsNight,
        'libelle': 'Départ anticipé',
        'totalMinutesPointage': pointage.tempsPointes,
        'arrivee': pointage.arrives,
        'sortie': pointage.sortie
      };
      data['totalMinutes'] = this.dateService.getTotalMinutes(data);
      this.clickedAbsence.emit(data);
    } else if (Array.isArray(pointage)) {
      const data = {
        'dateJournee': shift.dateJournee,
        'heureDebut': pointage[0],
        'heureDebutIsNight': pointage[0].heureFinIsNight, // to be corrected
        'heureFin': pointage[1],
        'heureFinIsNight': shift.heureFinIsNight,
        'libelle': 'Départ anticipé',
        'totalMinutesPointage': pointage[0].tempsPointes,
        // 'arrivee': pointage.arrives,
        // 'sortie': pointage.sortie
      };
      data['totalMinutes'] = this.dateService.getDiffOn(data['heureFin'], data['heureDebut'], 'minutes');
      this.clickedAbsence.emit(data);
    } else {
      this.clickedAbsence.emit(null);
    }
  }

  public innerPointingClicked(): void {
    this.clickedAbsence.emit(null);
  }

  private timeToPixel(time: any, widthOfMinute: number): string {
    return Number(time * widthOfMinute).toFixed(2);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pointage) {
      this.pointage = changes.pointage.currentValue;
      this.setMesures(this.minutesWidht);
      this.setColors();
    }
    if (changes.partitions) {
      this.parts = changes.partitions.currentValue;
      this.setMesures(this.minutesWidht);
      this.setColors();
    }
  }
  // Check if heure debut shift coincide avec heure debut pointage sur la meme colonne
  checkPointingIntersectionWithShift(): Boolean{
    let intersectionExistes = false;
      if(this.employe){
        this.employe.shifts.forEach((shift:any)=>{
          if(shift.idShift !== null && this.pointage.heureDebut.slice(0,2) === shift.heureDebut.slice(0,2)){
            intersectionExistes = true;
          }
        });
      }
    return intersectionExistes;
  }
  public getDuration(minuteWidht: number, part, dateService: DateService): number {
    if (part) {
      return dateService.getDiffInMinutes(part.interval[1], part.interval[0]) * minuteWidht;
    }
    return 0;
  }

}
