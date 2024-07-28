/**
 * alarme-actions
 */

import {Action} from '@ngrx/store';
import {AlarmeModel} from "../model/alarme.model";

export enum AlarmActionTypes {
  AddAlarm = 'Add Alarm',
  RemoveAlarm = 'Remove Alarm',
}

export class AddAlarm implements Action {
  readonly type = AlarmActionTypes.AddAlarm;

  constructor(public payload: AlarmeModel) {
  }
}

export class RemoveAlarm implements Action {
  readonly type = AlarmActionTypes.RemoveAlarm;

  constructor(public payload: string) {
  }
}

export type AlarmeActions =
  AddAlarm |
  RemoveAlarm;
