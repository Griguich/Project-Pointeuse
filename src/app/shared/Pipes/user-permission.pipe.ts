import { Pipe, PipeTransform } from '@angular/core';
import {EmployeeModel} from "../model/employee.model";

@Pipe({
  name: 'userPermission'
})
export class UserPermissionPipe implements PipeTransform {

  transform(personalizedAccess: string, codeEcran: string, isManager: boolean): boolean {
    return isManager ? true : personalizedAccess.includes(codeEcran.toLowerCase()) ;
  }

}
