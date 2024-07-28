import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SessionService} from '../../../../shared/services/session.service';
import {RapportService} from '../../services/rapport.service';
import {RhisTranslateService} from '../../../../shared/services/rhis-translate.service';
import {DbJsStoreService} from "../../../../shared/services/JsStoreServices/dbJsStore.service";
import {InfoRestaurantJsStoreService} from "../../../../shared/services/JsStoreServices/infoRestaurantJsStore.service";

@Component({
  selector: 'app-affichage-rapports',
  templateUrl: './affichage-rapports.component.html',
  styleUrls: ['./affichage-rapports.component.scss']
})
export class AffichageRapportsComponent implements OnChanges {

  public reportViewer: any;

  public typeReport: string;

  public documentName: string;

  @Input() codeName: string;

  constructor(private sessionService: SessionService,
              private rapportService: RapportService,
              private rhisTranslateService: RhisTranslateService,
              private infoRestaurantJsStoreService: InfoRestaurantJsStoreService) {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.codeName && changes.codeName.currentValue) {
      this.codeName = changes.codeName.currentValue;
      this.generateRapport(this.codeName);
      this.typeReport = this.codeName;
    }
  }

  public generateRapport(type: string): void {
    switch (type) {
      case 'CORRECTION_RAPPORT': {
        const currentLangue = this.rhisTranslateService.browserLanguage;
        let sub = this.rapportService.createRapportCorrectionPointage(this.sessionService.getPdfCorrectionPointageSettings().idRestaurant,
          this.sessionService.getPdfCorrectionPointageSettings().dateJournee, currentLangue)
          .subscribe(response => {
            this.showDocument(response);
            sub.unsubscribe();
          });
        this.documentName = 'Rapport_des_corrections';
        break;
      }
    }
  }

  public async showDocument(data: any): Promise<void> {
    this.reportViewer = await this.rapportService.createDocument(data);
  }
}
