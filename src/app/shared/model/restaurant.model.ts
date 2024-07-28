import {EmployeeModel} from './employee.model';
import {ParametreNationauxModel} from './parametre.nationaux.model';

export class RestaurantModel {
  public idRestaurant: number;
  public idFront: string;
  public libelle: string;
  public matricule: string;
  public adresse: string;
  public codePostal: string;
  public telephone: string;
  public telephone2: string;
  public codeDebutMatricule: string;
  public numTVA: string;
  public siret: string;
  public codeAPE: string;
  public numURSSAF: string;
  public centreURSSAF: string;
  public pointRassemblement: string;
  public typeRestaurant: any;
  public defaultRestaurant: boolean;
  public AssociationPointeuse: boolean;
  public directeur: EmployeeModel;
  public codePointeuse: string;
  public macPointeuse: string;
  public uuid: string;


  // public users: UserRestaurantModel[];
  // public decoupageHoraires: DecoupageHoraireModel[];
  public pays: any;
  public parametreNationaux: ParametreNationauxModel;
  // public parametreGlobals: ParametreModel[];
  // public alerte: AlerteModel;
  public societe: any;
  public periodeRestaurant: any;
  public valeurDebutMois: number;
  public arrondiContratSup: boolean ;
  public typeEvenements: any;
  public jourFeriesRefs;
  constructor() {
    this.defaultRestaurant = false;
    this.valeurDebutMois = 1;
  }

}
