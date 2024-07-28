import {Injectable} from "@angular/core";
import {DbJsStoreService} from "../../../shared/services/JsStoreServices/dbJsStore.service";
import {NameOfTable} from "../../../shared/model/enumeration/NameOfTable.model";
import {RapportModel} from "../../../shared/model/rapport.model";

@Injectable({
  providedIn: 'root'
})
export class RapportJsStoreService extends DbJsStoreService<RapportModel> {
  public tableName = NameOfTable.RAPPORTS;

  constructor() {
    super();
  }

  public addRapport(entity: RapportModel): Promise<number | RapportModel[]> {
    return super.add(this.tableName, entity);
  }

  public clear(): Promise<any> {
    return super.clear(this.tableName)
  }

  public getRapportsList(): Promise<RapportModel[] | never> {
    return super.getAll(this.tableName)
      .then((rapports: RapportModel[]) => {
        return rapports;
      })
  }

}
