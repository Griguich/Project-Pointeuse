import {ContraintesSocialesModel} from './contraintes.sociales.model';
import {ValidationContrainteSocialeModel} from './validationContrainteSociale.model';

export class LoiPaysModel extends ContraintesSocialesModel {

  public valeurMajeurTempsPlein: string;
  public valeurMineurTempsPlein: string;
  public valeurMajeurTempsPartiel: string;
  public valeurMineurTempsPartiel: string;

  public valeurMajeurAfficher: string;
  public valeurMineurAfficher: string;
  public translatedLibelle: string;
  public mineurForbiddenChanges = false;
  public majeurForbiddenChanges = false;
  public loiPointeuse: boolean;
  public validationContrainteSociale: ValidationContrainteSocialeModel;
  public isValid: boolean;
  public isTime: boolean;


  constructor() {
    super();
  }
}
