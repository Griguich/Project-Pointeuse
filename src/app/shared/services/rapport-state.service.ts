import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RapportStateService {
  private rapportState = new Subject();

  public setRapportState(): void {
    this.rapportState.next();
  }

  public getRapportState(): Observable<any> {
    return this.rapportState.asObservable();
  }
}
