import {TypePointageModel} from "./type-pointage.model";

export interface CorrectionPointageModel {
  idCorrectionPointagePointeuse: number;
  pointageIdFront: string;
  idFront: string;
  idEmployee: number;
  idManager: number;
  dayOfActivity: string | Date;
  entityAction: string;
  pointageTime: string;
  newValue: string | Date;
  newValueIsNight: boolean;
  oldValue: string | Date;
  oldValueIsNight: boolean;
  dateModification: string | Date;
  nomEmployee: string;
  prenomEmployee: string;
  employeeCodeBadge: string;
  nomManager: string;
  prenomManager: string;
  oldTypePointage: TypePointageModel;
  newTypePointage: TypePointageModel;
  idRestaurant: number;
}
