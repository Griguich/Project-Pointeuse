import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {SessionService} from "./session.service";

@Injectable({
  providedIn: 'root'
})
export class AutorisationPointageService {

  constructor(private sessionService: SessionService) {
  }

  private autorisation = new BehaviorSubject(this.sessionService.getAutorisation());
  autorisationState = this.autorisation.asObservable();

  setState(message) {
    this.autorisation.next(message)
  }

}
