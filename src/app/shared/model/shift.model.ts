import {EmployeeModel} from './employee.model';

export class ShiftModel {
  public  idShift;
  public idFront: string;

  public heureDebut;

  public heureDebutIsNight;

  public heureFin;

  public heureFinIsNight;

  public dateJournee;

  public totalHeure;

  public nombreEmployeeRequis;

  public shiftPrincipale;

  public heureDebutModifier;

  public heureDebutModifierIsNight;

  public heureFinModifier;

  public heureFinModifierIsNight;

  public  employee: EmployeeModel;

  public idPlanning;
  public idRestaurant;
  public sign = false;


  public  heureDebutCheval;

  public  heureFinCheval;

  public  heureDebutChevalIsNight;

  public  heureFinChevalIsNight;

  public  acheval;

  public  modifiable
  public toStringa(): string {
    return `ShiftModel {
      idShift: ${this.idShift},
      idFront: ${this.idFront},
      heureDebut: ${this.heureDebut},
      heureDebutIsNight: ${this.heureDebutIsNight},
      heureFin: ${this.heureFin},
      heureFinIsNight: ${this.heureFinIsNight},
      dateJournee: ${this.dateJournee},
      totalHeure: ${this.totalHeure},
      nombreEmployeeRequis: ${this.nombreEmployeeRequis},
      shiftPrincipale: ${this.shiftPrincipale},
      heureDebutModifier: ${this.heureDebutModifier},
      heureDebutModifierIsNight: ${this.heureDebutModifierIsNight},
      heureFinModifier: ${this.heureFinModifier},
      heureFinModifierIsNight: ${this.heureFinModifierIsNight},
      employee: ${this.employee},
      idPlanning: ${this.idPlanning},
      idRestaurant: ${this.idRestaurant},
      sign: ${this.sign},
      heureDebutCheval: ${this.heureDebutCheval},
      heureFinCheval: ${this.heureFinCheval},
      heureDebutChevalIsNight: ${this.heureDebutChevalIsNight},
      heureFinChevalIsNight: ${this.heureFinChevalIsNight},
      acheval: ${this.acheval},
      modifiable: ${this.modifiable}
    }`;
  }
}
