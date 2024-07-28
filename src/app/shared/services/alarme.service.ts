import * as fromAlarmActions from '../alarme/alarme-actions';
import {Injectable} from '@angular/core';
import {select, Store} from '@ngrx/store';
import * as fromRoot from '../alarme';
import {AlarmeModel} from '../model/alarme.model';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {DateService} from './date.service';

@Injectable({
  providedIn: 'root'
})
export class AlarmeService {

  public alarms: Observable<AlarmeModel[]>;

  /**
   * clock value stored in dateSevice, which is an observable that contains the current time (it will be like a clock inside our application)
   */
  get clock(): Observable<Date> {
    return this.dateService.clock;
  }

  /**
   * Dans le constructeur on recupere la liste des alarmes, et vu que notre service est singleton donc a chaque changement de la valeur de clock (chaque secondes) on lance la methode 'checkAlarme' pour chaque alarme.
   * Si Le retour de la methode 'checkAlarme' est !== null => l'heure de l'alarme est arrivée => on lance la methode a proprie
   * @param store
   * @param dateService
   */
  constructor(private store: Store<fromRoot.State>, private dateService: DateService) {
    this.alarms = this.store.pipe(select(fromRoot.getAlarms));

    combineLatest(this.alarms, this.clock).pipe(
      map(([alarms, clockTime]) => {
        return this.checkAlarm(alarms, clockTime);
      })
    ).subscribe((alarm) => {
      if (alarm) {
        this.executeMethode(alarm);
      }
    });

  }

  /**
   * Cette methode permet d'ajouter une alarme dans la liste des alarmes, pour ne pas avoir des doublons on supprime chaque alarme avec le même identifiant
   * @param id
   * @param dateTime
   * @param methodName
   */
  public setTimer(id: string, dateTime: Date, methodName: Function) {
    // remove previous alarmes in case of presence of same id
    this.store.dispatch(new fromAlarmActions.RemoveAlarm(id));
    this.store.dispatch(new fromAlarmActions.AddAlarm({
      idFront: id,
      date_time: dateTime,
      status: true,
      methodName: methodName,
    }));
  }

  /**
   * Cette methode permet de verifier si l'heure de l'alarme est venue
   * @param alarms
   * @param clockTime
   */
  private checkAlarm(alarms: AlarmeModel[], clockTime: Date): AlarmeModel | null {
    for (const alarm of alarms) {
      if (alarm.date_time <= clockTime && alarm.status) {
        return alarm;
      }
    }

    return null;
  }

  private executeMethode(alarm: AlarmeModel): void {
    alarm.methodName();
    this.store.dispatch(new fromAlarmActions.RemoveAlarm(alarm.idFront));
  }
}
