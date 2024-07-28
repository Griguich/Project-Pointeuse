import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../shared/services/JsStoreServices/generic-crud.service';
import {PathService} from '../../../shared/services/path.service';
import {PointageModel} from '../../../shared/model/pointage.model';
import {Observable} from 'rxjs';
import {SessionService} from "../../../shared/services/session.service";

@Injectable({
  providedIn: 'root'
})
export class PlanningService extends GenericCRUDRestService<PointageModel, String> {
  constructor(private pathService: PathService, httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathgdh()}/pointage`);
  }

  /**
   * recuperer le list des shifts
   * @param :idRestaurant
   */
  public getListPointageByIdRestaurant(idRestaurant: number): Observable<PointageModel[]> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    return this.httpClient.get<PointageModel[]>(`${this.pathService.getPathgdh()}` + '/pointage/' + uuidRestaurant);
  }

  public updatePointage(entity: PointageModel): Observable<PointageModel> {
    return super.update(entity, `/update`);
  }
}
