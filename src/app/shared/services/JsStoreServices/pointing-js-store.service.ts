import {Injectable} from '@angular/core';
import {DbJsStoreService} from "./dbJsStore.service";
import {PointageModel} from "../../model/pointage.model";
import {NameOfTable} from "../../model/enumeration/NameOfTable.model";

@Injectable({
  providedIn: 'root'
})
export class PointingJsStoreService extends DbJsStoreService<PointageModel> {

  constructor() {
    super();
  }

  public getPointingByEmployee(idEmployee: number): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        idEmployee: idEmployee
      }
    });
  }

  public getPointingByDate(date: string): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        dateJournee: date
      }
    });
  }
}
