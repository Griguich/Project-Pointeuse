import {Injectable} from '@angular/core';
import {NameOfTable} from '../../../shared/model/enumeration/NameOfTable.model';
import {AnomalieModel} from '../../../shared/model/anomalie.model';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';
import {EmployeeModel} from '../../../shared/model/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AnomalieJsStoreService extends DbJsStoreService<AnomalieModel> {

  tableName = NameOfTable.ANOMALIE;

  /**
   * get anomalies by date
   * @param date
   */
  public getAnomalieBydate(date: Date) {
    return this.connection.select<AnomalieModel>({
      from: this.tableName,
      where: {
        dateAnomalie: date
      }
    });
  }

  /**
   * ajouter anomalie
   * @param entity
   */
  public addAnomalie(entity: AnomalieModel): Promise<number | AnomalieModel[]> {
    return super.add(this.tableName, entity);
  }

  /**
   * get count of anomalies
   */
  public getCountAnomalie(date: Date | string): Promise<Number> {
    return super.getCount(this.tableName, date);
  }

  /**
   * modifier anomalie
   */
  public updateAnomalie(anomalie: AnomalieModel) {
    return super.update(this.tableName, anomalie.idFront, anomalie);
  }

  public deleteAnomalie(anomalie: AnomalieModel): Promise<number> {
    return super.delete(this.tableName, anomalie.idFront);
  }

  public deleteAnomalieForEmploye(employee: EmployeeModel): Promise<number> {
    return this.connection.remove({
      from: this.tableName,
      where: {
        idEmployee: employee.idEmployee
      }
    });
  }
}
