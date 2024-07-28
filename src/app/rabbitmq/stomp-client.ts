import {RxStompService} from '@stomp/ng2-stompjs';
import {PointageModel} from '../shared/model/pointage.model';
import {Observable} from "rxjs";
import {Message} from "@stomp/stompjs";
import {SessionService} from "../shared/services/session.service";
import {Injectable} from "@angular/core";
@Injectable({providedIn: 'root'})
export class StompClient {
  constructor( private rxStompService: RxStompService,
               private sessionService: SessionService) {
  }
  public asyncPointage(pointages: PointageModel[]): void {
    this.rxStompService.publish({
      destination: '/amq/queue/listPointage', body: JSON.stringify(pointages), headers: {
      },
    });

  }

  public synchroPointageNotification(): Observable<Message> {
    return this.rxStompService.watch('/topic/' + this.sessionService.getIdRestaurant());
  }
  public connect(): void {
    this.rxStompService.activate();
  }
  public deactivate(): void {
    this.rxStompService.deactivate();
  }

}
