import {Injectable} from '@angular/core';
import {NameOfTable} from 'src/app/shared/model/enumeration/NameOfTable.model';
import {DecoupageHoraireModel} from '../../model/decoupage.horaire.model';
import {DbJsStoreService} from './dbJsStore.service';

@Injectable({
  providedIn: 'root'
})
export class DecoupageHoraireJsStoreService extends DbJsStoreService<DecoupageHoraireModel> {
  public tableName = NameOfTable.DECOUPAGE;

  constructor() {
    super();
  }

  public addDecoupage(entity: any) {
    return super.add(this.tableName, entity);
  }

  public getListDecoupage() {
    return super.getAll(this.tableName)
      .then((decoupages: DecoupageHoraireModel[]) => {
        return decoupages;
      })
  }

  public clearData() {
    return super.clear(this.tableName);
  }
}
