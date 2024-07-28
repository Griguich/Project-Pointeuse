import {Injectable} from '@angular/core';
import {NameOfTable} from 'src/app/shared/model/enumeration/NameOfTable.model';
import {RestaurantModel} from '../../model/restaurant.model';
import {DbJsStoreService} from './dbJsStore.service';
import {PointageModel} from "../../model/pointage.model";

@Injectable({
  providedIn: 'root'
})
export class InfoRestaurantJsStoreService extends DbJsStoreService<RestaurantModel> {
  public tableName = NameOfTable.RESTAURANT;

  constructor() {
    super();
  }

  public addRestaurant(entity: any) {
    this.clearData();
    return super.add(this.tableName, entity);
  }

  public getRestaurantList() {
    return super.getAll(this.tableName)
      .then((restaurants: RestaurantModel[]) => {
        return restaurants;
      })
  }

  public clearData(): Promise<any> {
    return super.clear(NameOfTable.RESTAURANT);
  }
}
