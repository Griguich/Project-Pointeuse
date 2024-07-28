import {Injectable} from '@angular/core';
import {DbJsStoreService} from './dbJsStore.service';
import {NameOfTable} from '../../model/enumeration/NameOfTable.model';
import {ParametreModel} from "../../model/parametre.model";

@Injectable({
  providedIn: 'root'
})
export class ParameterJsStoreService extends DbJsStoreService<any> {

  constructor() {
    super();
  }

  public addParameter(entity: any): any {
    return super.add(NameOfTable.PARAMETRE, entity);
  }


  public getListParameter(): any {
    return super.getAll(NameOfTable.PARAMETRE)
      .then((result: ParametreModel[]) => {
        return result;
      });
  }

  public getParamatreByParam(param: string): Promise<ParametreModel[]> {
    return this.connection.select<ParametreModel>({
      from: NameOfTable.PARAMETRE,
      where: {
        param: param
      }
    });
  }

  public clearData() {
    return super.clear(NameOfTable.PARAMETRE);
  }
}
