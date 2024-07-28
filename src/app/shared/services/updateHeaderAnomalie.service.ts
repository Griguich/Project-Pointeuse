import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {AnomalieModel} from "../model/anomalie.model";

@Injectable({
  providedIn: 'root'
})
export class UpdateHeaderAnomalieService {

  constructor() {
  }

  private listGuiAnomalieSubject = new BehaviorSubject([]);
  listGuiAnomalie = this.listGuiAnomalieSubject.asObservable();

  public setListGuiAnomalie(listGuiAnomalie: AnomalieModel[]) {
    this.listGuiAnomalieSubject.next(listGuiAnomalie);
  }

}
