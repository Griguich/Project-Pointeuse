import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  private isOnline$ = new BehaviorSubject<boolean>(window.navigator.onLine);
  constructor() {
    this.listenToOnlineStatus();
  }

  private listenToOnlineStatus(): void {
    window.addEventListener('online', () => this.isOnline$.next(true));
    window.addEventListener('offline', () => this.isOnline$.next(false));
  }

  public onlineState(): Observable<boolean> {
    return this.isOnline$.asObservable();
  }
}
