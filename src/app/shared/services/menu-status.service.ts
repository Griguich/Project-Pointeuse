import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuStatusService {

  private menuStateSubject = new Subject<boolean>();

  constructor() { }

  public menuStateTabletteStatus(): Observable<boolean> {
    return this.menuStateSubject.asObservable();
  }
}
