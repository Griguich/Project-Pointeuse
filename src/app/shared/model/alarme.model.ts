/**
 * alarme.model
 */

export interface AlarmeModel {
  idFront: string;
  date_time: Date;
  status: boolean;
  methodName: Function;
}
