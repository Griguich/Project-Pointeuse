import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GenericCRUDRestService} from '../../../shared/services/JsStoreServices/generic-crud.service';
import {PointageModel} from '../../../shared/model/pointage.model';
import {PathService} from '../../../shared/services/path.service';
import {Observable} from 'rxjs';
import {SessionService} from '../../../shared/services/session.service';
import {DateService} from '../../../shared/services/date.service';
import {RxStompService} from '@stomp/ng2-stompjs';

@Injectable({
  providedIn: 'root'
})
export class PointingHttpService extends GenericCRUDRestService<PointageModel, string> {

  constructor(private pathService: PathService, public httpClient: HttpClient,
              private sessionService: SessionService,
              private dateHelperService: DateService,
              private rxStompService: RxStompService) {
    super(httpClient, `${pathService.getPathPointeuse()}/pointage`);
  }

  /**
   * sauvgarder tous les pointages
   * @param messages
   */
  public updatePointages(pointages: PointageModel[], isRegularly: number, dateJournee: string): Observable<any> {
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(this.dateHelperService.getCorrectDateJournee(new Date(dateJournee)) );
    const uuidRestaurant = this.sessionService.uuidGenerator(+this.sessionService.getIdRestaurant());
    return this.httpClient.post(this.baseUrl + '/' + uuidRestaurant + '/' + dateChoisit + '/' + isRegularly, pointages);
  }

  // public lancerSychronisation(pointages: PointageModel[], isRegularly: number, dateJournee: string): void {
  //   const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(new Date(dateJournee));
  //   const uuidResta = this.sessionService.uuidGenerator(+this.sessionService.getIdRestaurant());
  //   if (pointages.length > 0) {
  //     this.rxStompService.publish({
  //       destination: this.pathService.sychroPointageQueue, body: JSON.stringify(pointages), headers: {
  //         uuidRestaurant: uuidResta,
  //         stringDate: dateChoisit,
  //         isRegularly: '' + isRegularly
  //       },
  //     });
  //   }
  // }

// 10/01/2023
  public updatePointagesV2(pointages: PointageModel[], isRegularly: number, dateJournee: string): Observable<any> {
     const newDate = new Date(dateJournee);
    newDate.setFullYear(Number(dateJournee.substring(0,4)),Number(dateJournee.substring(5,7)) - 1 ,Number(dateJournee.substring(8)));
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(newDate);
    const uuidRestaurant = this.sessionService.uuidGenerator(+this.sessionService.getIdRestaurant());
    return this.httpClient.post(this.pathService.getPathgdh() + '/pointage/updateList/' + uuidRestaurant + '/' + dateChoisit + '/' + isRegularly, pointages);
  }

  /**
   * sauvgarder tous les pointages apres la fermture de pointeuse
   *  pointages
   */
  public updatePointagesAfterClosePointeuse(pointages: PointageModel[]): Observable<any> {
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(new Date(this.sessionService.getDateJournee()));
    const uuidRestaurant = this.sessionService.uuidGenerator(+this.sessionService.getIdRestaurant());
    return this.httpClient.post(this.pathService.getPathgdh() + '/pointage/closePointeuse/' + uuidRestaurant + '/' + dateChoisit , pointages);
  }
}
