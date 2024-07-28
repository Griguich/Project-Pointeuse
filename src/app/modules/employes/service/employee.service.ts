import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../shared/services/JsStoreServices/generic-crud.service';
import {EmployeeModel} from '../../../shared/model/employee.model';
import {PathService} from '../../../shared/services/path.service';
import {Observable} from 'rxjs';
import {SessionService} from '../../../shared/services/session.service';
import {DateService} from '../../../shared/services/date.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends GenericCRUDRestService<EmployeeModel, String> {
  public ListIdEmployees: number[];

  constructor(private pathService: PathService, httpClinent: HttpClient, private sessionService: SessionService, private dateHelperService: DateService) {
    super(httpClinent, `${pathService.getPathEmployee()}/employee`);
  }


  /**
   * recupere les employes actif
   * @param :idRestaurant
   */
  public getEmployeActifAndAbsenceByIdWithRestaurant(idRestaurant: number): Observable<any> {
    const dateJournee = this.sessionService.getDateJournee();
    const newDate = new Date(dateJournee);
    this.dateHelperService.initializeDate(newDate);
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    newDate.setFullYear(Number(dateJournee.substring(0,4)),Number(dateJournee.substring(5,7)) - 1 ,Number(dateJournee.substring(8)));
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(newDate);
    return this.httpClient.get(this.baseUrl + '/employeActifAndAbsencePointeuse/' + uuidRestaurant + '/' + dateChoisit);
  }

  /**
   * recupere les employes actif pretes/ les shifts / les pointages
   * @param :idRestaurant
   */
  public   getEmployePreteActifAndShiftAndPointageByIdRestaurantAndDateJournee(idRestaurant): Observable<any> {
    const dateJournee = this.sessionService.getDateJournee();
    const newDate = new Date(dateJournee);
    this.dateHelperService.initializeDate(newDate);
    newDate.setFullYear(Number(dateJournee.substring(0,4)),Number(dateJournee.substring(5,7)) - 1 ,Number(dateJournee.substring(8)));
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(newDate);
    return this.httpClient.get(this.baseUrl + '/employePreteActifAndAbsenceForPointeuse/' + uuidRestaurant + '/' + dateChoisit);
  }


}
