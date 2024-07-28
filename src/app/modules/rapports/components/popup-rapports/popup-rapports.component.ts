import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RapportModel} from '../../../../shared/model/rapport.model';
import {DateService} from "../../../../shared/services/date.service";
import {SessionService} from "../../../../shared/services/session.service";

@Component({
  selector: 'app-popup-rapports',
  templateUrl: './popup-rapports.component.html',
  styleUrls: ['./popup-rapports.component.scss']
})
export class PopupRapportsComponent implements OnInit {

  public selectedRapport: RapportModel;
  public RAPPORT_CORRECTION = 'CORRECTION_RAPPORT';
  public selectedDate: Date;

  @Input()
  public set initSelectedRapport(selectedRapport: RapportModel) {
    this.selectedRapport = selectedRapport;
    this.selectedDate = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
  }

  @Output()
  public generateRapportEvent = new EventEmitter();

  constructor(private dateService: DateService, public sessionService: SessionService) {
  }

  ngOnInit() {
  }

  public generateRapport(): void {
    switch (this.selectedRapport.codeName) {
      case this.RAPPORT_CORRECTION: {
        this.generateRapportEvent.emit({
          idRestaurant: this.sessionService.getIdRestaurant(),
          dateJournee: this.dateService.formatToShortDate(this.selectedDate)
        });
        break;
      }
    }
  }

}
