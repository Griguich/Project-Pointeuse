import {EmployeeModel} from './employee.model';

export class BadgeModel {

  public idBadge: number;
  public code: string;
  public dateDisponible: any;
  public commentaire: string;
  public employee: EmployeeModel;


  constructor() {
    this.init();
  }

  init() {
    this.commentaire = '';
    this.code = '';
  }


}
