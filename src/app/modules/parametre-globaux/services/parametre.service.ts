import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ParametreModel} from "../../../shared/model/parametre.model";
import {GenericCRUDRestService} from "../../../shared/services/JsStoreServices/generic-crud.service";
import {PathService} from "../../../shared/services/path.service";
import {DateService} from "../../../shared/services/date.service";
import {SessionService} from "../../../shared/services/session.service";

@Injectable({
  providedIn: 'root'
})
export class ParametreService extends GenericCRUDRestService<ParametreModel, number> {

  constructor(private http: HttpClient,
              private pathService: PathService,
              httpClient: HttpClient,
              private dateService: DateService,
              private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathEmployee()}/pointeuse/parametre`);
  }

  public getAllParametreByIdRestaurat(idRestaurant: number): Observable<any> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    return this.httpClient.get(this.pathService.getPathEmployee() + '/params/all/parametrePointeuse/' + uuidRestaurant);
  }


  public updateParamsByRestaurant(listeParametres: ParametreModel[], idRestaurant: number): Observable<ParametreModel[]> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    this.setStringFromDate(listeParametres);
    return this.httpClient.put<ParametreModel[]>(this.pathService.getPathEmployee() + '/params/forPointeuse/' + uuidRestaurant, listeParametres);
  }

  private setStringFromDate(listeParametres: ParametreModel[]): void {
    listeParametres.forEach((item: ParametreModel) => {
      if (item.valeur instanceof Date) {
        item.valeur = this.dateService.setStringFromDate(item.valeur);
      }
    });
  }
}
