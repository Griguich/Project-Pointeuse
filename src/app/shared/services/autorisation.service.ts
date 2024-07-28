import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AutorisationService {
  private userAuthorized = new Subject<boolean>();

  constructor() {
    this.userAuthorized.next(false);

  }

  public setUserAuthorized(userLoggedIn: boolean): void {
    this.userAuthorized.next(userLoggedIn);
  }

  public getUserAuthorized(): Observable<boolean> {
    return this.userAuthorized.asObservable();
  }
}
