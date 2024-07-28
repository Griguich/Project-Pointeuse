import {EmployeeModel} from '../employee.model';
import {PointageModel} from '../pointage.model';
import {ShiftModel} from '../shift.model';


export class EmployePointeuseDTO {
  public employeeList?: EmployeeModel[] = [];
  public pointageList?: PointageModel[] = [];
  public shiftList?: ShiftModel[] = [];
}
