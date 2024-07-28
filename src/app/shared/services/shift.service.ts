import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from './JsStoreServices/generic-crud.service';
import {PathService} from './path.service';
import {ShiftModel} from '../model/shift.model';
import {Observable} from 'rxjs';
import {SessionService} from './session.service';
import {DateService} from './date.service';


@Injectable({
  providedIn: 'root'
})
export class ShiftService extends GenericCRUDRestService<ShiftModel, String> {

  constructor(private pathService: PathService, httpClinent: HttpClient, private sessionService: SessionService, private dateHelperService: DateService) {
    super(httpClinent, `${pathService.getPathPlanning()}/shift`);
  }

  /**
   * recuperer le list des shifts
   * @param :idRestaurant
   */
  public getListShiftByIdRestaurant(idRestaurant: number): Observable<ShiftModel[]> {
    const dateJournee = this.sessionService.getDateJournee();
    const newDate = new Date(dateJournee);
    newDate.setFullYear(Number(dateJournee.substring(0,4)),Number(dateJournee.substring(5,7)) - 1 ,Number(dateJournee.substring(8)));
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    const dateJourneeSynchro = this.dateHelperService.formatDateToScoreDelimiter(newDate);
    return this.httpClient.get<ShiftModel[]>( this.baseUrl + '/shiftInPointeuse/' + uuidRestaurant + '/' + dateJourneeSynchro);
  }

}
