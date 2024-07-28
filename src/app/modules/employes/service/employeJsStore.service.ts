import {Injectable} from '@angular/core';
import {NameOfTable} from 'src/app/shared/model/enumeration/NameOfTable.model';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';
import {PaginationArgs} from "../../../shared/model/pagination.args";
import {SessionService} from "../../../shared/services/session.service";

@Injectable({
  providedIn: 'root'
})
export class EmployeJsStoreService extends DbJsStoreService<EmployeeModel> {
  public tableName = NameOfTable.EMPLOYEE;

  constructor(private sessionService: SessionService) {
    super();
  }

  public addEmployee(entity: EmployeeModel): Promise<number | EmployeeModel[]> {
    return super.add(this.tableName, entity);
  }

  public addALLEmployees(entity: EmployeeModel[]): Promise<number | EmployeeModel[]> {
    return super.addAll(this.tableName, entity);
  }

  public clear(): Promise<any> {
    return super.clear(this.tableName);
  }

  public getEmployesList(): Promise<EmployeeModel[] | never> {
    return super.getAll(this.tableName)
      .then((employees: EmployeeModel[]) => {
        return employees;
      });
  }

  public getEmployeesByPage(paginationArgs: PaginationArgs): Promise<EmployeeModel[]> {
    return this.connection.select({
      from: this.tableName,
      limit: paginationArgs.pageSize,
      skip: paginationArgs.pageSize * paginationArgs.pageNumber
    });
  }

  public getById(entityIdEmploye: number): Promise<EmployeeModel[]> {
    return super.getByIdEmploye(this.tableName, entityIdEmploye);
  }
  public getEmployesByIdEmployee(idEmploye: number): Promise<EmployeeModel | never> {
    return super.getByIdEmploye(this.tableName, idEmploye).then();
  }

  public deleteEmployeePrete(tableName: string, idRestaurant: number) {
    return super.deleteEmployeePrete(tableName, idRestaurant);
  }
}
