import {Injectable} from "@angular/core";
import {GenericCRUDRestService} from "../../../shared/services/JsStoreServices/generic-crud.service";
import {PathService} from "../../../shared/services/path.service";
import {HttpClient} from "@angular/common/http";
import {RapportModel} from "../../../shared/model/rapport.model";
import {Observable} from "rxjs";
import {SessionService} from "../../../shared/services/session.service";
import {InfoRestaurantJsStoreService} from "../../../shared/services/JsStoreServices/infoRestaurantJsStore.service";
import {RestaurantModel} from "../../../shared/model/restaurant.model";

@Injectable({
  providedIn: 'root'
})
export class RapportService extends GenericCRUDRestService<RapportModel, String> {

  private blob: any;
  private restaurant: RestaurantModel;
  constructor(private pathService: PathService, httpClinent: HttpClient,
              private sessionService: SessionService,
              private infoRestaurantJsStoreService: InfoRestaurantJsStoreService) {
    super(httpClinent, `${pathService.getPathPointeuse()}/rapport`);
    this.getUuid();
  }

  /**
   * recupere la liste des rapports
   */
  public getListRapports(): Observable<RapportModel[]> {
    return this.httpClient.get<RapportModel[]>(this.pathService.getPathEmployee() + '/report/rapportPointeuse');
  }

  public createRapportCorrectionPointage(idRestaurant: number, dateJournee: string, language: string): Observable<Object> {
    // console.log(this.restaurant.uuid);
    //  const uuidRestaurant = this.sessionService.uuidGenerator(+idRestaurant);
    return this.httpClient.get(this.pathService.getHostServerRapport() + '/rapportCorrectionPointage/?uuidRestaurant=' + this.restaurant.uuid + '&dateJournee=' + dateJournee + '&lang=' + language, {
      responseType: 'blob', observe: 'body'
    });
  }

  private async getUuid() {
    this.restaurant = await this.infoRestaurantJsStoreService.getRestaurantList()
      .then((restaurantsInfos: RestaurantModel[]) => {
        if (restaurantsInfos && restaurantsInfos.length) {
          return restaurantsInfos[0];
        }
        return null;
      });
  }

  public createDocument(blob: any): Promise<any> {
    this.setProperties(blob);
    return new Promise(resolve => {
      const fileReader = new FileReader();
      fileReader.onload = (event: any) => {
        const data = new Uint8Array(event.target.result);
        resolve(data);
      };
      fileReader.readAsArrayBuffer(blob);
    });
  }

  private setProperties(blob: any): void {
    this.blob = blob;
  }
}
