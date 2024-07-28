import {StatusDemandeCongeEnumeration} from './enumeration/status.demande.conge.enumeration';
import {TypeEvenementModel} from './type.evenement.model';
import {DetailEvenement} from "./DetailEvenement.model";

export class AbsenceCongeModel {

  public idAbsenceConge: number;
  public dateDebut: string | Date;
  public dateFin: string | Date;
  public heureDebut: string | Date;
  public heureDebutValeurNuit: boolean;
  public heureFin: string | Date;
  public heureFinValeurNuit: boolean;
  public dureeHeure: number;
  public dureeJour: number;
  public periodeHoraire: boolean;
  public status: StatusDemandeCongeEnumeration;
  public typeEvenement: TypeEvenementModel;
  public idEmployee: number;
  public detailEvenements: DetailEvenement[] = [];
  constructor() {
  }

}
