import {TypePointageModel} from './type-pointage.model';

export class PointageModel {

  idEmployee: number;
  idShift: number;
  idFront: string;
  dateJournee: string | Date;
  heureDebut: string | Date;
  heureDebutIsNight: boolean;
  heureFin: string | Date;
  heureFinIsNight: boolean;
  tempsPointes: number;
  typePointageRef?: TypePointageModel;
  modified: number;
  creationDate: string | Date;
  idRestaurant: number;
  // 0: no voucher was printed
  // 1: delay absence was printed
  // 2: departure absence was printed
  // 3: delay and departure absence are printed
  voucherPrintState?: 0 | 1 | 2 | 3;
  isAcheval ? = false;
  heureDebutAcheval?: string | Date;
  heureDebutAchevalIsNight?: boolean;
}

