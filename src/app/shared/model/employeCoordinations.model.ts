import {EmployeeModel} from './employee.model';
import {PointageModel} from './pointage.model';
import {ShiftModel} from './shift.model';

export class EmployeeCoordinations {
  public employee: EmployeeModel;
  public pointages: PointageModel[];
  public shifts: ShiftModel[];
  public pointageToUpdate?: PointageModel;
  public isCurrent?: boolean;

  constructor(employee: EmployeeModel, pointages: PointageModel[], isCurrent: boolean) {
    this.employee = employee;
    this.pointages = pointages;
    this.isCurrent = isCurrent;
  }

}
