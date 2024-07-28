import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../shared/services/JsStoreServices/generic-crud.service';
import {PathService} from '../../../shared/services/path.service';
import {AnomalieModel} from '../../../shared/model/anomalie.model';
import {Observable} from 'rxjs';
import {SessionService} from "../../../shared/services/session.service";

@Injectable({
  providedIn: 'root'
})
export class AnomalieService extends GenericCRUDRestService<AnomalieModel, String> {
  public ListIdEmployees: number[];

  constructor(private pathService: PathService, httpClient: HttpClient, private  sessionService: SessionService) {
    super(httpClient, `${pathService.getPathPlanning()}/anomalie`);
  }


  /**
   * recuperer toutes les anomalie par restaurant et date
   * @param idRestaurant
   * @param dateAnomalie
   */
  public getAllAnomalieByRestaurant(idRestaurant: number): Observable<AnomalieModel[]> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    return this.httpClient.get<AnomalieModel[]>(this.baseUrl + '/pointeuse/' + uuidRestaurant);
  }

  /**
   * modifier pointage
   * @param entity
   */
  public updatePointage(entity: AnomalieModel): Observable<AnomalieModel> {
    return super.update(entity, `/update`);
  }
}

