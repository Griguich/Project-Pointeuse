import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {RhisTranslateService} from "../../../shared/services/rhis-translate.service";
import {AnomalieModel} from "../../../shared/model/anomalie.model";
import {DateService} from "../../../shared/services/date.service";
import {AnomalieJsStoreService} from "../service/anomalieJsStore.service";
import {SessionService} from "../../../shared/services/session.service";
import {CheckingSocialConstraintsRegularlyService} from '../../../shared/services/checking-social-constraints-regularly.service';

@Component({
  selector: 'rhis-anomalie',
  templateUrl: './anomalie.component.html',
  styleUrls: ['./anomalie.component.scss']
})
export class AnomalieComponent {
  public listAnomalie: AnomalieModel[] = [];
  public header: any[];
  public aucunMessage = '';
  public title: string;
  public popupValidateAnomalie = false;
  public heightInterface: any;
  /**
   * Pop up style
   */
  public popUpStyle = {
    height: 200
  };
  public anomalie : AnomalieModel;
  public textOfValidateAnomalie: string;
  constructor(public router: Router,
              public rhisTranslateService: RhisTranslateService,
              public dateService: DateService,
              public anomaliJsStoreService: AnomalieJsStoreService,
              public sessionService: SessionService,
              private checkingSocialConstraintsRegularlyService: CheckingSocialConstraintsRegularlyService) {
  }

  ngOnInit() {
    this.getListAnomalieByDate(this.dateService.getCorrectDateJournee());
    this.title = this.dateService.setFullDateAsString(new Date());

    this.header = [
      {title: 'Employe', field: this.rhisTranslateService.translate('ANOMALIE.EMPLOYE')},
      {title: 'label', field: this.rhisTranslateService.translate('ANOMALIE.ANOMALIE')},
      {title: 'valeur_contrainte', field: this.rhisTranslateService.translate('ANOMALIE.VALEUR')},
      {title: 'valide', field: this.rhisTranslateService.translate('ANOMALIE.VALIDE')},
    ];
    this.aucunMessage = this.rhisTranslateService.translate('ANOMALIE.AUCUN_MESSAGE');
  }


  public getListAnomalieByDate(date) {
    this.anomaliJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(date)).then((result: AnomalieModel[]) => {
      this.listAnomalie = result;
    });
  }

  /**
   * afficher le popup pour valider l'anomalie
   * @param anomalie
   */
  public showPopupValidateAnomalie(anomalieDisplay: AnomalieModel) {
    if (!anomalieDisplay.valide) {
      this.textOfValidateAnomalie= this.rhisTranslateService.translate('ANOMALIE.TEXTE_POPUP')+ anomalieDisplay.libelleAnomalie +'?';
      this.popupValidateAnomalie = true;
      this.anomalie = anomalieDisplay;
    }
  }
  /**
   * fermer le pupup
   */
  public closePopup() {
    this.popupValidateAnomalie = false;
  }

  /**
   * valider anomalie
   */
  public async validateAnomalie(): Promise<void> {
    this.anomalie.valide = true;
    await this.anomaliJsStoreService.updateAnomalie(this.anomalie);
    this.popupValidateAnomalie = false;
    this.isAnyAnomalienotValidated().then((check: boolean) => {
      if (!check) {
        this.checkingSocialConstraintsRegularlyService.stopPreAlarme();
        this.checkingSocialConstraintsRegularlyService.stopAudio();
      }
    })
  }

  /**
   * permet de verifier s'il ya des anomalies non validé
   */
  private async isAnyAnomalienotValidated(): Promise<boolean> {
    const anomalieList: AnomalieModel[] = await this.anomaliJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee()));
    return anomalieList.some((anomalie: AnomalieModel) => anomalie.valide === false)
  }
}
