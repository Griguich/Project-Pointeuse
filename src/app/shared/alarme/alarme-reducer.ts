/**
 * alarme-reducer
 */
import {AlarmeModel} from '../model/alarme.model';
import {AlarmActionTypes, AlarmeActions} from './alarme-actions';

export interface State {
  alarms: AlarmeModel[];
}

const initialState: State = {
  alarms: [],
};

export function reducer(state = initialState, action: AlarmeActions): State {
  switch (action.type) {
    case AlarmActionTypes.AddAlarm:
      const dateTime = action.payload.date_time;
      const now = new Date();
      const status = dateTime.getTime() - now.getTime() >= 0;
      const newAlarm = {
        idFront: action.payload.idFront,
        date_time: dateTime,
        status: status,
        methodName: action.payload.methodName,
      };

      return {
        alarms: [...state.alarms, newAlarm]
      };

    case AlarmActionTypes.RemoveAlarm: {
      const alarms = state.alarms.filter((alarm: AlarmeModel) => alarm.idFront !== action.payload);

      return {
        alarms
      };
    }

    default:
      return state;
  }
}

export const getAlarms = (state: State) => state.alarms;
