import {Component, OnInit} from '@angular/core';
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import {MessageModel} from "../../../shared/model/message.model";
import {SessionService} from "../../../shared/services/session.service";
import {MessageJsStoreService} from "../service/messageJsStore.service";

@Component({
  selector: 'rhis-historiques',
  templateUrl: './historiques.component.html',
  styleUrls: ['./historiques.component.scss']
})
export class HistoriquesComponent implements OnInit {
  public messages: MessageModel[] = [];
  public showMessagePopUp = false;
  public showMessageTitle: string;
  public selectedMessage: MessageModel = new MessageModel();
  public shortMessage = '';

  constructor(private rhisTranslateService: RhisTranslateService,
              private MessageJsStoreService: MessageJsStoreService,
              private sesionService: SessionService) {
  }

  /**
   * recupere la liste des message par restaurant
   */
  private getMessages() {
    this.MessageJsStoreService.getMessages().then((listMessage: MessageModel[]) => {
      this.getMessagesByEmploye(listMessage);
    });
  }

  /**
   * recupere la liste des messages non vu par l'employé
   * @param: listMesage
   */
  private getMessagesByEmploye(listMesage: MessageModel[]): void {
    listMesage.forEach((message: MessageModel) => {
      if ((message.idMessageReciever === +this.sesionService.getEmploye()) && !message.isViewed) {
        this.messages.push(message);
      }
    });
  }


  /**
   * afficher un message
   * @param: message
   */
  public showMessage(message: MessageModel) {
    message.isViewed = true;
    this.MessageJsStoreService.updateMessage(message);
    this.selectedMessage = message;
    this.showMessagePopUp = true;
    this.showMessageTitle = this.rhisTranslateService.translate('MESSAGE.MESSAGE_RECUE');
  }

  ngOnInit() {
    this.getMessages();
  }

  public closeShowMessagePopUp() {
    this.showMessagePopUp = false;
  }
}
