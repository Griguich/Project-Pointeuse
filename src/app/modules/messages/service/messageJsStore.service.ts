import {Injectable} from '@angular/core';
import {NameOfTable} from '../../../shared/model/enumeration/NameOfTable.model';
import {MessageModel} from '../../../shared/model/message.model';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';

@Injectable({
  providedIn: 'root'
})
export class MessageJsStoreService extends DbJsStoreService<MessageModel> {

  public tableName = NameOfTable.MESSAGE;

  constructor() {
    super();
  }

  public getMessages() {
    return super.getAll(this.tableName)
      .then((messages: MessageModel[]) => {
        return messages;
      })
  }

  public addMessage(message: MessageModel): Promise<any> {
    return super.add(this.tableName, message);
  }

  public deleteMessage(idFront: string) {
    return super.delete(this.tableName, idFront);
  }

  public updateMessage(message: MessageModel) {
    return super.update(this.tableName, message.idFront, message);
  }

  public getMessageByIdReciever(idReciever: number) {
    return this.connection.select<MessageModel>({
      from: NameOfTable.MESSAGE,
      where: {
        idMessageReciever: idReciever,
        isViewed: false
      }
    });
  }

}
