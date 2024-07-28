import {Injectable} from "@angular/core";
import {DbJsStoreService} from "./dbJsStore.service";
import {NameOfTable} from "../../model/enumeration/NameOfTable.model";
import {TypePointageModel} from "../../model/type-pointage.model";

@Injectable({
  providedIn: 'root'
})
export class TypePointageJsStoreService extends DbJsStoreService<TypePointageModel> {

  constructor() {
    super();
  }

  public addAll(entities: TypePointageModel[]): Promise<TypePointageModel[] | number> {
    return super.addAll(NameOfTable.TYPE_POINTAGE, entities);
  }

  public getAll(): Promise<TypePointageModel[]> {
    return super.getAll(NameOfTable.TYPE_POINTAGE);
  }

  public getOneByLibelle(libelle: string): Promise<TypePointageModel[]> {
    return this.connection.select<TypePointageModel>({
      from: NameOfTable.TYPE_POINTAGE,
      where: {
        libelle: libelle
      }
    });
  }

  public getOneById(id: number): Promise<TypePointageModel[]> {
    return this.connection.select<TypePointageModel>({
      from: NameOfTable.TYPE_POINTAGE,
      where: {
        id: id
      }
    });
  }

  public clearData(): Promise<any> {
    return super.clear(NameOfTable.TYPE_POINTAGE);
  }
}
