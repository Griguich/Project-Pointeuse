import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from './JsStoreServices/generic-crud.service';
import {DecoupageHoraireModel} from '../model/decoupage.horaire.model';
import {PathService} from './path.service';
import {Observable} from "rxjs";
import {SessionService} from "./session.service";


@Injectable({
  providedIn: 'root'
})
export class DecoupageHoraireService extends GenericCRUDRestService<DecoupageHoraireModel, Number> {

  // private uri = 'http://127.0.0.1:2004/decoupage';

  constructor(private pathService: PathService, httpClinent: HttpClient, private sessionService: SessionService) {
    super(httpClinent, `${pathService.getPathPointeuse()}/pointeuse/decoupage`);
  }


  /**
   * recupere le decoupage horaire
   * @param :idRestaurant
   */
  public getDecoupageHoraire(idRestaurant): Observable<DecoupageHoraireModel[]> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    return this.httpClient.get<DecoupageHoraireModel[]>(this.pathService.getPathPlanning() + '/decoupage/horaire/pointeuse/' + uuidRestaurant);
  }


}
