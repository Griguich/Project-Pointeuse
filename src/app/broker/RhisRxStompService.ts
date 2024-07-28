import {Injectable} from '@angular/core';
import {SessionService} from '../shared/services/session.service';
import {RxStompService} from '@stomp/ng2-stompjs';
import {Observable} from 'rxjs';
import {Message} from '@stomp/stompjs';



@Injectable({
  providedIn: 'root'
})
export class RhisRxStompService {

  constructor(private rxStompService: RxStompService,
              private sessionService: SessionService) {
  }

/*  public getPointingNotification(): Observable<Message> {
    return this.rxStompService.watch('/topic/pointage.' + this.sessionService.getIdRestaurant());
  }

  public disconnect() {
    this.rxStompService.deactivate();
  }

  public reconnect() {
    this.rxStompService.activate();
  }

*/
}


