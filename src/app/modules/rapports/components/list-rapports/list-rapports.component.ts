import {Component, OnInit} from '@angular/core';
import {RapportModel} from '../../../../shared/model/rapport.model';
import {RapportService} from '../../services/rapport.service';
import {SessionService} from '../../../../shared/services/session.service';
import {RapportStateService} from '../../../../shared/services/rapport-state.service';

@Component({
  selector: 'app-list-rapports',
  templateUrl: './list-rapports.component.html',
  styleUrls: ['./list-rapports.component.scss']
})
export class ListRapportsComponent implements OnInit {

  public heightInterface: any;

  public listRapport: RapportModel[] = [];

  public showPopupRapport = false;

  public selectedRapport: RapportModel;

  public displaySelectedRapport = false;
  public popUpStyle = {
    width: 400,
    height: 700
  };

  constructor(private rapportService: RapportService,
              private sessionService: SessionService,
              private rapportStateService: RapportStateService) {
  }

  ngOnInit() {
    this.getListRapports();
    this.rapportStateService.getRapportState().subscribe(_ => this.displaySelectedRapport = false);
  }

  public showActionPopup(rapport: RapportModel): void {
    this.selectedRapport = rapport;
    this.showPopupRapport = true;
  }

  public launchGenerateRapport(event: any): void {
    this.showPopupRapport = false;
    this.sessionService.setPdfCorrectionPointageSettings({
      idRestaurant: event.idRestaurant,
      dateJournee: event.dateJournee
    });
    this.displaySelectedRapport = true;
  }

  private getListRapports(): void {
    let sub = this.rapportService.getListRapports().subscribe(
      (data: RapportModel[]) => {
        this.listRapport = data;
        sub.unsubscribe();
      }, (err: any) => {
        console.log('error', err);
      }
    );

  }
}
