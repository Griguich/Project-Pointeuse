/**
 * index
 */

import {ActionReducerMap, createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromAlarm from './alarme-reducer';

export interface State {
  alarm: fromAlarm.State;
}

export const reducers: ActionReducerMap<State> = {
  alarm: fromAlarm.reducer,
};

export const getAlarmState = createFeatureSelector<fromAlarm.State>('alarm');

export const getAlarms = createSelector(
  getAlarmState,
  fromAlarm.getAlarms
);
