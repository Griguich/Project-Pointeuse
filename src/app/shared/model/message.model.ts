import {TypeMessage} from "./enumeration/TypeMessage.model";

export class MessageModel {
  public idFront: string;
  public idMessage: number;
  public contenuMessage: string;
  public messageAudio: Blob;
  public dateCreation: Date;
  public typeMessage: TypeMessage;
  public isViewed: boolean;
  public idMessageOwner: number;
  public fullNameMessageOwner: string;
  public idMessageReciever: number;
}
