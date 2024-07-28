import {Component, OnInit} from '@angular/core';
import {SortEvent} from 'primeng/api';
import {ParametreModel} from "../../shared/model/parametre.model";
import {NotificationService} from "../../shared/services/notification.service";
import {RhisTranslateService} from "../../shared/services/rhis-translate.service";
import {DateService} from "../../shared/services/date.service";
import {ParameterJsStoreService} from "./services/parameter-js-store.service";
import { LanguageStorageService } from 'src/app/shared/services/language-storage.service';
import {SessionService} from "../../shared/services/session.service";

@Component({
  selector: 'rhis-parametre-globaux',
  templateUrl: './parametre-globaux.component.html',
  styleUrls: ['./parametre-globaux.component.scss']
})
export class ParametreGlobauxComponent implements OnInit {

  public listeParametres: ParametreModel[] = [];
  public defaultListeParametres: ParametreModel[] = [];
  public idRestaurant: any;
  public heightInterface: any;
  public header: { title: string; field: string; }[];
  SelectedDateOption: number;
  private readonly paramMinCheckCont = 'MINCHECKCONT';
  public PALIER1_CODE_NAME = 'PALIER1_SUP';
  public PALIER1_INDEX = -1;
  public PALIER2_CODE_NAME = 'PALIER2_SUP';
  public PALIER2_INDEX = -1;
  public JOUR_DECALAGE_CODE_NAME = 'nSocFrwDay';
  public JOUR_DECALAGE_INDEX = -1;
  public MIN_DAY_REF_CODE_NAME = 'MIN_DAY_REF';
  public MIN_DAY_REF_INDEX = -1;
  public languesList = [
    {label: 'FR', value: 'FR'},
    {label: 'EN', value: 'EN'},
    {label: 'ES', value: 'ES'},
    {label: 'DE', value: 'DE'},
    {label: 'NL', value: 'NL'},
    {label: 'AR', value: 'AR'},
    {label: 'PT', value: 'PT'},
  ];
  public option_Affichage_date = [
    {label: this.translator.translate('optionAffichageDate.DateCal'), value:'1' },
    {label: this.translator.translate('optionAffichageDate.DateJourAct'), value: '2' },
    {label:this.translator.translate('optionAffichageDate.Combo') , value: '3'},


  ];

  constructor(private paramService: ParameterJsStoreService,
              private translator: RhisTranslateService,
              private dateService: DateService,
              private notificationService: NotificationService,
              private sessionService: SessionService,

              private languageStorageService: LanguageStorageService) {

  }
  ngOnInit(): void {
    this.getAllParamsByRestaurant();
    this.initializeHeader();
  }
  /**
   * Create restaurant parameters table header
   */
  private initializeHeader(): void {
    this.header = [
      {title: this.translator.translate('PARAMS_GLOBAL.RUBRIQUE_LABEL'), field: 'rubrique'},
      {title: this.translator.translate('PARAMS_GLOBAL.PARAM_LABEL'), field: 'param'},
      {title: this.translator.translate('PARAMS_GLOBAL.DESCRIPTION_LABEL'), field: 'description'},
      {title: this.translator.translate('PARAMS_GLOBAL.VALUE_LABEL'), field: 'valeur'}
    ];
  }

  /**
   * Send parameters list changing
   */
  public detectChanges(param: ParametreModel) {
    if ((param.param === this.PALIER1_CODE_NAME || param.param === this.PALIER2_CODE_NAME)
      && (+this.listeParametres[this.PALIER2_INDEX].valeur < +this.listeParametres[this.PALIER1_INDEX].valeur)) {
      this.listeParametres[this.PALIER1_INDEX].wrongValue = true;
      this.listeParametres[this.PALIER2_INDEX].wrongValue = true;
    } else {
      this.listeParametres[this.PALIER1_INDEX].wrongValue = false;
      this.listeParametres[this.PALIER2_INDEX].wrongValue = false;
    }
    this.listeParametres[this.JOUR_DECALAGE_INDEX].wrongValue = (param.param === this.JOUR_DECALAGE_CODE_NAME) && (+this.listeParametres[this.JOUR_DECALAGE_INDEX].valeur > 6);
    this.listeParametres[this.MIN_DAY_REF_INDEX].wrongValue = (param.param === this.MIN_DAY_REF_CODE_NAME) && (+this.listeParametres[this.MIN_DAY_REF_INDEX].valeur < 1);
  }

  /**
   * Cette methode permet de lancer le service responsable de la recuperation de la liste des parametres
   */
  private getAllParamsByRestaurant(): void{
    this.paramService.getListParameter().then((data: ParametreModel[]) => {
        this.listeParametres = data;
        this.sortListParam();
        this.checkTimeAndSetIndexValueAndCreateDefaultList();
      },
      (err: any) => {
        // TODO notify of error
        console.log(err);
      });
  }

   /**
   * Sort restaurant parameters list
   * @param: event
   */
  public sortRows(event: SortEvent): void {
    this.listeParametres.sort((row1, row2) => {
      const val1 = row1[event.field];
      const val2 = row2[event.field];
      const result = val1.localeCompare(val2);
      return result * event.order;
    });
    this.listeParametres.sort(function (a, b) {
      if (a.rubrique === b.rubrique) {
        return a.param.localeCompare(b.param) * event.order;
      }
    });
  }

  /**
   * Cette methode permet d'appeler le service de mettre a jour les parametres
   */
  public saveUpdate():void {
    if (this.canSave()) {
      this.callWSToUpdate();
    }
  }

  /**
   * Cette methode permet de detecter s'il y a un changement sur la liste des parametres
   */
  public compareList(): boolean {
    let same = true;
    this.listeParametres.forEach((item: ParametreModel, index: number) => {
      if (JSON.stringify(this.defaultListeParametres[index]) !== JSON.stringify(this.listeParametres[index])) {
        same = false;
      }
    });
    return same;
  }

  public setBooleanValue(param: ParametreModel): void {
    param.valeur = (!(param.valeur === 'true')).toString();
    this.detectChanges(param);
  }

  public getOtherParamValue(paramName: string): any {
    if (paramName === this.PALIER1_CODE_NAME) {
      return +this.listeParametres[this.PALIER2_INDEX].valeur;
    } else if (paramName === this.PALIER2_CODE_NAME) {
      return +this.listeParametres[this.PALIER1_INDEX].valeur;
    }
  }

  public canSave(): boolean {
    let displayError = false;
    let minCheckCont = true;
    this.listeParametres.forEach(item => {
      displayError = displayError || item.wrongValue;
      if (item.param === this.paramMinCheckCont && (+item.valeur < 1 || item.valeur === '' )) {
        minCheckCont = false;
      }
    });

    if (displayError || !minCheckCont) {
      if (!minCheckCont) {
        this.notificationService.showMessage('error', 'PARAMS_GLOBAL.MINCHECKCONT');
        return false;
      }
      this.notificationService.showMessage('error', 'PARAMS_GLOBAL.CORRECT_WRONG_VALUES');
      return false;
    } else {
      return true;
    }
  }

  private checkTimeAndSetIndexValueAndCreateDefaultList(): void {
    for (let i = 0; i < this.listeParametres.length; i++) {
      this.listeParametres[i].wrongValue = false;
      if (this.dateService.isTimeValue(this.listeParametres[i].valeur)) {
        this.listeParametres[i].valeur = this.dateService.setTimeFormatHHMM(this.listeParametres[i].valeur);
        this.listeParametres[i].isTime = true;
      }
      if (this.listeParametres[i].param === this.PALIER1_CODE_NAME) {
        this.PALIER1_INDEX = i;
      } else if (this.listeParametres[i].param === this.PALIER2_CODE_NAME) {
        this.PALIER2_INDEX = i;
      } else if (this.listeParametres[i].param === this.JOUR_DECALAGE_CODE_NAME) {
        this.JOUR_DECALAGE_INDEX = i;
      } else if (this.listeParametres[i].param === this.MIN_DAY_REF_CODE_NAME) {
        this.MIN_DAY_REF_INDEX = i;
      }
    }
    this.defaultListeParametres = JSON.parse(JSON.stringify(this.listeParametres));
  }

  private sortListParam(): void {
    this.listeParametres.sort(function (a: ParametreModel, b: ParametreModel) {
      if (a.rubrique.toLowerCase() < b.rubrique.toLowerCase()) {
        return -1;
      }
      if (a.rubrique.toLowerCase() > b.rubrique.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    this.listeParametres.sort(function (a: ParametreModel, b: ParametreModel) {
      if (a.rubrique === b.rubrique) {
        return a.param.localeCompare(b.param);
      }
    });
  }

  private async callWSToUpdate(): Promise<void> {
    this.paramService.updateListParametre(this.listeParametres);
    const oldDisplayLang = this.getLangParamValue(this.defaultListeParametres, 'LANGUE_AFFICHAGE');
    const newDisplayLang = this.getLangParamValue(this.listeParametres, 'LANGUE_AFFICHAGE');

    if (oldDisplayLang !== newDisplayLang) {
      this.languageStorageService.setDisplayLanguageSettings(newDisplayLang.toLowerCase());
      this.changeDisplayLanguage(newDisplayLang);
    } else {
      this.notificationService.showSuccessMessage('PARAMS_GLOBAL.PARAM_NAT_UPDATED_SUCCESSFULLY');
    }
    const oldVocalLang = this.getLangParamValue(this.defaultListeParametres, 'LANGUE_SONS');
    const newVocalLang = this.getLangParamValue(this.listeParametres, 'LANGUE_SONS');
    if (oldVocalLang !== newVocalLang) {
      this.changeVocalLanguage(newVocalLang);
    }
    const oldDateOption = this.getLangParamValue(this.defaultListeParametres, 'AFFICHAGE_DATE');
    const newDateOption = this.getLangParamValue(this.listeParametres, 'AFFICHAGE_DATE');

    if (oldDateOption !== newDateOption) {
      this.changedateoption(newDateOption);
      this.sessionService.setDisplayDateOption(newDateOption)
    }
    this.checkTimeAndSetIndexValueAndCreateDefaultList();
     await this.delay(500);
      window.location.reload();
 }

  private delay(ms: number) : any{
    return new Promise(resolve => {
      let timeout6 = setTimeout(resolve, ms)
      clearTimeout(timeout6);
    });

  }

  private getLangParamValue(listeParametres: ParametreModel[], searchedParam : string): string{
    return listeParametres.find((param: ParametreModel)=> param.param === searchedParam).valeur;
 }
  private changeDisplayLanguage(selectedLanguage: string): void{
    this.translator.language = selectedLanguage.toLowerCase();
    setTimeout(() => {
      this.notificationService.showSuccessMessage('PARAMS_GLOBAL.PARAM_NAT_UPDATED_SUCCESSFULLY');
      window.location.reload();
    }, 300);
  }

  private changeVocalLanguage(newVocalLang: string): void{
    this.languageStorageService.setVocalLanguageSettings(newVocalLang.toLowerCase());
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }

  private changedateoption(newdateoption: string): void {
    this.sessionService.setDisplayDateOption(newdateoption);
    console.log("date"+ newdateoption);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  }
  getSelectedOptionIndex(event) {
    const selectedOptionIndex = this.option_Affichage_date.findIndex(option => option.value === event.value.value);
    console.log('Selected option index:', selectedOptionIndex);
  }
  getsaveddateoption(): string {
    return this.sessionService.getDisplayDateOption();
  }
}
