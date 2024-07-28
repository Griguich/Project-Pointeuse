import {AbsenceCongeModel} from './absence.conge.model';
import {BadgeModel} from './badge.model';
import {Sexe} from './enumeration/Sexe.model';
import {StituationFamiliale} from './enumeration/SituationFamiliale.model';
import {GroupeTravailModel} from './groupeTravail.model';
import {LoiEmployeeModel} from './loi.employee.model';
import {LoiPaysModel} from './loi.pays.model';
import {EtatPretEnumeration} from "./enumeration/etatPret.enum";
import {RestaurantDePretEnumeration} from "./enumeration/RestaurantPret.enum";


export class EmployeeModel {
  public idEmployee;
  public idFront: string;
  public matricule;
  public email;
  public restaurantId;
  public idRestaurant;
  public sexe: any;
  public nom;
  public prenom;
  public adresse;
  public nomJeuneFille;
  public situationFamiliale;
  public dateNaissance;
  public codePostal;
  public ville;
  public numTelephone;
  public numPortable;
  public dateEntree;
  public dateSortie;
  public dateRemise;
  public dateRestitution;
  public motifSortie;
  public statut = false;
  public majeur;
  public etat;
  public carte;
  public hebdoCourant;
  public complAdresse;
  public hasLaws: boolean;
  public badge: BadgeModel;
  public sexeEnumeration: String[] = Object.keys(Sexe);
  public situationFamilialEnumeration: String[] = Object.keys(StituationFamiliale);
  public finValiditeSejour;
  public finValiditeAutorisationTravail;


  // cette variable sera utilisé pour afficher le nom et le prenom de l'employee dans le dropdown
  public displayedName: string;
  public groupeTravail: GroupeTravailModel;
  public absenceConges: AbsenceCongeModel[] = [];
  public loiSpecifiques: LoiEmployeeModel[] = [];
  public loiPointeuse: LoiPaysModel [] = [] ;
  // calcule des differences des heures dans le shift fixe
  public totalRowTime;
  public fullName ;
  public disablePlanningManagerOrLeaderOrFixe = false;
  public isSelected = false;

  public prete ? = false;
  public etatPret ?: EtatPretEnumeration;
  public restaurantDePret ?: RestaurantDePretEnumeration = RestaurantDePretEnumeration.AUCUN;


}
