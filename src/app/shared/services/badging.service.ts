import {Injectable} from '@angular/core';
import {PointingService} from "../../modules/pointage/service/pointing.service";
import {SessionService} from "./session.service";
import {EmployeeModel} from "../model/employee.model";
import {EmployeJsStoreService} from "../../modules/employes/service/employeJsStore.service";
import {ContrainteSocialeService} from "./contrainte-sociale.service";
import {BehaviorSubject} from "rxjs";
import {ParametreModel} from "../model/parametre.model";
import {ParameterJsStoreService} from "./JsStoreServices/parameter-js-store.service";

@Injectable({
  providedIn: 'root'
})
export class BadgingService {


  constructor(private pointingService: PointingService,
              private sessionService: SessionService,
              private employeJsStoreService: EmployeJsStoreService,
              private constraintService: ContrainteSocialeService,
              private parameterJsStoreParameter: ParameterJsStoreService
  ) {
  }

  public getCodeBadgeAndCodeRestaurant(cardCode: string): { codeBadge: string, codeRestaurant: string } {
    let codeBadge = cardCode.substr(2, 3);
    codeBadge = (codeBadge.startsWith('0') ? codeBadge.substr(1, 2) : codeBadge);
    codeBadge = codeBadge.startsWith('0') ? codeBadge.substr(1, 1) : codeBadge;
    const codeRestaurant = cardCode.substr(5, 5);
    return {codeBadge: codeBadge, codeRestaurant: codeRestaurant}
  }

  public verifyRestaurant(codeRestaurant: string): boolean {
    return codeRestaurant === this.sessionService.getCodeRestaurant();
  }

  public verifyBadgeExist(codeBadge: string): Promise<EmployeeModel> {
    return this.employeJsStoreService.getEmployesList()
      .then((employees: EmployeeModel[]) => {
        return employees.find((employee: EmployeeModel) => {
          if (employee.badge && employee.badge.code === codeBadge) {
            return true;
          } else {
            return null;
          }
        });
      });
  }


  private messageSource = new BehaviorSubject(-1);
  pointingstate = this.messageSource.asObservable();


  public changePointingState(message: number): void {
    this.messageSource.next(message)
  }

  public async getBadgingState(idEmployee: number, checkFirstPointingInDay: boolean): Promise<any> {
    const pointages = await this.pointingService.getPointingByEmployee(idEmployee);
    return this.constraintService.getLastPointingParameters(pointages, checkFirstPointingInDay);
  }

  /*
  cette methode permet de verifier si le parametre d'affichage de clavier exite ou non et retourne son valeur
  si le parametre n'existe pas retourne true (fonctionnement normal)
   */
  public async verifyShowKeyBoardParameter(): Promise<boolean> {
    const showKeyBoardParam: ParametreModel = (await this.parameterJsStoreParameter.getParamatreByParam('CLAVIER_BADGE')).pop();
    if (!showKeyBoardParam) {
      return true
    }
    return showKeyBoardParam.valeur === 'true';
  }

}
