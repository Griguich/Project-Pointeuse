import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from './JsStoreServices/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from './path.service';
import {SessionService} from './session.service';
import {RestaurantService} from './restaurant.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MacPointeuseService extends GenericCRUDRestService<String, number> {

  constructor(private http: HttpClient, private pathService: PathService, private sessionService: SessionService, private restaurantService: RestaurantService) {
    super(http, `${pathService.getPathLocalServer()}/mac`);
  }

  public getMacPointeuse(): Observable<any> {
    return this.httpClient.get(this.baseUrl);
  }
}
