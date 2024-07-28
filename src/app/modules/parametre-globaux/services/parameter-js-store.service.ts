import {Injectable} from '@angular/core';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';
import {NameOfTable} from '../../../shared/model/enumeration/NameOfTable.model';
import {DateService} from "../../../shared/services/date.service";
import {ParametreModel} from "../../../shared/model/parametre.model";

@Injectable({
  providedIn: 'root'
})
export class ParameterJsStoreService extends DbJsStoreService<any> {
  tableName = NameOfTable.PARAMETRE;
  constructor(private dateService: DateService) {
    super();
  }

  public addParameter(entity: any): any {
    return super.add(NameOfTable.PARAMETRE, entity);
  }


  public getListParameter(): any {
    return super.getAll(this.tableName)
      .then((result: ParametreModel[]) => {
        return result;
      });
  }

  /**
   * modifier list parametre anomalie
   */
  public updateListParametre(parammetreList: ParametreModel[]) {
    parammetreList.forEach((parametre: ParametreModel) => {
      if (parametre.valeur instanceof Date) {
        parametre.valeur = this.dateService.setStringFromDate(parametre.valeur);
      }
      return super.update(this.tableName, parametre.idFront, parametre);
    });
  }
}
