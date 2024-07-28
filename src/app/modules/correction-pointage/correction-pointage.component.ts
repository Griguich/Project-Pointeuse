import {Component, OnInit} from '@angular/core';
import {RhisTranslateService} from 'src/app/shared/services/rhis-translate.service';
import {CorrectionPointageService} from './service/correction-pointage.service';
import {CorrectionPointageModel} from 'src/app/shared/model/CorrectionPointage.model';
import {DateService} from 'src/app/shared/services/date.service';

@Component({
  selector: 'app-correction-pointage',
  templateUrl: './correction-pointage.component.html',
  styleUrls: ['./correction-pointage.component.scss']
})
export class CorrectionPointageComponent implements OnInit {
  public header: any[];
  public listCorrections: CorrectionPointageModel[];
  public currentDateJournee: string;
  public listVideMessage: string;

  constructor(private rhisTranslateService: RhisTranslateService,
     private correctionService: CorrectionPointageService,
     private dateService: DateService) { }

  ngOnInit() {
    this.currentDateJournee = this.dateService.setFullDateAsString(new Date());
    this.headerInitializer();
    this.getCorrectionPointage();
    this.listVideMessage = this.rhisTranslateService.translate('CORRECTION_POINTAGE.LISTE_VIDE_MESSAGE');

  }
  private headerInitializer() {
    this.header = [
      { title: 'employe', field: this.rhisTranslateService.translate('CORRECTION_POINTAGE.EMPLOYE') },
      { title: 'par', field: this.rhisTranslateService.translate('CORRECTION_POINTAGE.PAR') },
      { title: 'type', field: this.rhisTranslateService.translate('CORRECTION_POINTAGE.TYPE') },
      { title: 'ancienne_valeur', field: this.rhisTranslateService.translate('CORRECTION_POINTAGE.ANCIENNE_VALEUR') },
      { title: 'nouvelle_valeur', field: this.rhisTranslateService.translate('CORRECTION_POINTAGE.NOUVELLE_VALEUR') },
      { title: 'date_correction', field: this.rhisTranslateService.translate('CORRECTION_POINTAGE.DATE_CORRECTION') }
    ];
  }
  private getCorrectionPointage(): void {
    let sub = this.correctionService.getListCorrection().subscribe((result: CorrectionPointageModel[]) => {
      this.listCorrections = result;
    })

  }
}
