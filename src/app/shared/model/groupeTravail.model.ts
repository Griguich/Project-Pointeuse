import {LoiEmployeeModel} from './loi.employee.model';
import {LoiGroupeTravailModel} from './loi.groupe.travail.model';

export class GroupeTravailModel {

  public idGroupeTravail: number;
  public libelle;
  public tauxhoraire: number;
  public idFront: string;

  // represente represente si le groupe de travail fait partie du planning
  // equiper ou non
  public plgEquip;

  // represente si le groupe de travail fait partie du planning manager ou non
  public plgMgr;

  // represente si le groupe de travail fait partie du planning hetesse ou non
  public plghot;

  // represente si le groupe de travail fait partie du planning fixe ou non
  public plgFixe;

  // definisse le type d’emplo
  public codeEmploi;

  // definisse le niveau de chaque type de un emploi
  public niveau: number;
  // represente le code qui est affiche dans le GDH
  public codeGdh;

  // permet de savoir si le type de un emploi est productif
  public mainOeuvre;

  // permet de savoir si le groupe de travail a des lois specifiques ou non
  public hasLaws: boolean;
  public statut: boolean;

  // il ne peut y avoir qu'un seul groupe de travail coché directeur par restaurant
  public  directeur: boolean;

  public  pointeuse: boolean ;
  public disabledCheckBoxDirecteur = false;
  public loiGroupeTravails: LoiGroupeTravailModel[] = [];
  public personalizedAccess: string;



}
