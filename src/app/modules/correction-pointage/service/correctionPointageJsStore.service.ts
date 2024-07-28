import {Injectable} from '@angular/core';
import {NameOfTable} from '../../../shared/model/enumeration/NameOfTable.model';
import {CorrectionPointageModel} from '../../../shared/model/CorrectionPointage.model';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';

@Injectable({
  providedIn: 'root'
})
export class CorrectionPointageJsStoreService extends DbJsStoreService<CorrectionPointageModel> {

  public tableName = NameOfTable.CORRECTION_POINTAGE;

  constructor() {
    super();
  }

  //Récupération de la liste des corections à partir de l'indexed DB
  public getCorrectionList(): Promise<CorrectionPointageModel[] | never> {
    return super.getAll(this.tableName)
      .then((corrections: CorrectionPointageModel[]) => {
        return corrections;
      })
  }

  public getdailyCorrections(dateJourne: string): Promise<any> {
    return this.connection.select<CorrectionPointageModel>({
      from: NameOfTable.CORRECTION_POINTAGE,
      where: {
        dayOfActivity: dateJourne,
      }
    });
  }

  public addCorrection(correctionPointage: CorrectionPointageModel): Promise<number | CorrectionPointageModel[]> {
    return super.add(this.tableName, correctionPointage);
  }
}
