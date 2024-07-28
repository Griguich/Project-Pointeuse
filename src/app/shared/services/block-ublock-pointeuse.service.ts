import {Injectable} from '@angular/core';
import {SessionService} from "./session.service";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BlockUblockPointeuseService {

  constructor(private sessionService: SessionService) {
  }

  private messageSource = new BehaviorSubject(true);
  currentState = this.messageSource.asObservable();


  setState(message) {
    this.messageSource.next(message)
  }

}
