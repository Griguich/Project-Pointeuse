import {ContraintesSocialesModel} from './contraintes.sociales.model';

export class LoiGroupeTravailModel extends ContraintesSocialesModel {

  public valeurMajeurTempsPlein: string;
  public valeurMineurTempsPlein: string;
  public valeurMajeurTempsPartiel: string;
  public valeurMineurTempsPartiel: string;
  public isTime = false;
  public isValid = true;
  public isPeriod = false;
  public majeurBooleanValue: boolean;
  public mineurBooleanValue: boolean;

  public translatedLibelle: string;
  public valeurMajeurAfficher: string;
  public valeurMineurAfficher: string;
  public loiRef: any;
  public toolTipShowMajeur: boolean;
  public toolTipShowMineur: boolean;


  constructor() {
    super();
  }
}
