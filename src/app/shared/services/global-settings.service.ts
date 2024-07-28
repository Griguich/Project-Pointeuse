import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
// FIXME rename it to MenuStatesService
export class GlobalSettingsService {

  constructor() {
  }
  private menuStateSubject = new Subject<boolean>();
  private menuWidthSubject = new Subject<number>();
  public menuIsOpen = false;
  public menuWidh: number;

  public toggleMenu(toggled: boolean) {
    this.menuStateSubject.next(toggled);
  }

  public onToggleMenu(): Observable<boolean> {
    return this.menuStateSubject.asObservable();
  }

  public sendMenuWidth(menuWdith: number) {
    this.menuWidthSubject.next(menuWdith);
  }

  public getMenuWidth(): Observable<number> {
    return this.menuWidthSubject.asObservable();
  }
}
