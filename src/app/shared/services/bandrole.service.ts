import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {SessionService} from "./session.service";

@Injectable({
  providedIn: 'root'
})
export class BandroleService {

  constructor(private sessionService: SessionService) {
  }

  private messageSource = new BehaviorSubject(this.sessionService.getBandrole());
  currentMessage = this.messageSource.asObservable();


  changeMessage(message: string) {
    this.messageSource.next(message)
  }

}
