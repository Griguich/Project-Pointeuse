import {Injectable} from '@angular/core';
import {MessageModel} from '../../../shared/model/message.model';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../../shared/services/path.service';
import {GenericCRUDRestService} from '../../../shared/services/JsStoreServices/generic-crud.service';
import {Observable} from "rxjs";
import {SessionService} from "../../../shared/services/session.service";

@Injectable({
  providedIn: 'root'
})
export class MessageService extends GenericCRUDRestService<MessageModel, String> {

  constructor(private http: HttpClient, private pathService: PathService, private sessionService: SessionService) {
    super(http, `${pathService.getPathEmployee()}/message`);
  }


  /**
   * Recupérer la liste des messages par restaurant
   * @param idRestaurant
   */
  public getMessagesByRestaurant(idRestaurant: number): Observable<MessageModel[]> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    return this.httpClient.get<MessageModel[]>(this.baseUrl + '/byRestaurant/' + uuidRestaurant);
  }

  /**
   * sauvgarder tous les messages
   * @param messages
   */
  public saveAllMessages(messages: MessageModel[]) {
    return this.httpClient.post(this.baseUrl, messages);
  }

}
