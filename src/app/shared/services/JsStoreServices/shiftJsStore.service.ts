import {Injectable} from '@angular/core';
import {NameOfTable} from 'src/app/shared/model/enumeration/NameOfTable.model';
import {ShiftModel} from '../../model/shift.model';
import {DbJsStoreService} from './dbJsStore.service';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShiftJsStoreService extends DbJsStoreService<ShiftModel> {

  private synchronisedSubject = new Subject<any>();

  public tableName = NameOfTable.SHIFT;

  constructor() {
    super();
  }

  public addShift(entity: any) {
    return super.add(this.tableName, entity);
  }

  public getShiftList() {
    return super.getAll(this.tableName)
      .then((shifts: ShiftModel[]) => {
        return shifts;
      })
  }

  public getByDateJournee(dateJournee: string): Promise<ShiftModel[]> {
    return this.connection.select<ShiftModel>({
      from: this.tableName,
      where: {
        dateJournee: dateJournee
      }
    })
  }

  public clearData() {
    return super.clear(this.tableName);
  }

  public setSynchronisedListShift(synchronised: boolean): void {
    this.synchronisedSubject.next(synchronised);
  }

  public getSynchronisedListShift(): Observable<any> {
    return this.synchronisedSubject.asObservable();
  }
}
