import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CorrectionPointageModel} from 'src/app/shared/model/CorrectionPointage.model';
import {GenericCRUDRestService} from "../../../shared/services/JsStoreServices/generic-crud.service";
import {PathService} from "../../../shared/services/path.service";
import {Observable} from "rxjs";
import {SessionService} from "../../../shared/services/session.service";
import {DateService} from "../../../shared/services/date.service";

@Injectable({
  providedIn: 'root'
})
export class CorrectionPointageService extends GenericCRUDRestService<CorrectionPointageModel, string> {

  constructor(private pathService: PathService, public httpClient: HttpClient,
              private dateHelperService: DateService,
              private sessionService: SessionService) {
    super(httpClient, `${pathService.getPathPointeuse()}/correctionPointage`);
  }


// Recupère list correction du JSON pour tester l'interface
  public getListCorrection() {
    return this.httpClient.get<CorrectionPointageModel[]>(
      'assets/data/correction.json'
    );
  }


  /**
   * enregistrer les corrections
   * @param pointages
   */
  public updateCorrectionPointages(correctionPointages: CorrectionPointageModel[], isRegularly: number): Observable<any> {
    const dateChoisit = this.dateHelperService.formatDateToScoreDelimiter(this.dateHelperService.getCorrectDateJournee());
    const uuidRestaurant = this.sessionService.uuidGenerator(+this.sessionService.getIdRestaurant());
    //recuperer le time zone du client
    const timeZone = new Date().getTimezoneOffset();
    return this.httpClient.post(this.pathService.getPathgdh() + '/correctionPointage' + '/' + uuidRestaurant + '/' + dateChoisit + '/' + isRegularly + '/' +  timeZone, correctionPointages);
  }
}
