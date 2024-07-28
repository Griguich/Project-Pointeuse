import {StatusDemandeCongeEnumeration} from './enumeration/status.demande.conge.enumeration';
import {TypeEvenementModel} from './type.evenement.model';

export class RestaurantGUI {

  // tslint:disable-next-line:variable-name
 private _codePointeuse : string;
 private _libelle : string;

  get codePointeuse(): string {
    return this._codePointeuse;
  }

  set codePointeuse(value: string) {
    this._codePointeuse = value;
  }

  get libelle(): string {
    return this._libelle;
  }

  set libelle(value: string) {
    this._libelle = value;
  }

  constructor(codePointeuse: string, libelle: string) {
    this._codePointeuse = codePointeuse;
    this._libelle = libelle;
  }
}
