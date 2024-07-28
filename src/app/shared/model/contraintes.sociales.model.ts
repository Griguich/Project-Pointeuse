
export class ContraintesSocialesModel {

  private _idContraintesSociales: number;
  public libelle: string;
  public bloquante: boolean;
  public status: boolean;
  public codeName: string;

  constructor() {
  }

  get idContraintesSociales(): number {
    return this._idContraintesSociales;
  }

  set idContraintesSociales(value: number) {
    this._idContraintesSociales = value;
  }
}
