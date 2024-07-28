export class DecoupageHoraireModel {

  public idDecoupageHoraire: number;

  public valeurDimanche;
  public valeurDimancheIsNight: boolean;
  public valeurDimancheIsNew: boolean;
  public idFront: string;

  public valeurLundi;
  public valeurLundiIsNight: boolean;
  public valeurLundiIsNew: boolean;

  public valeurMardi;
  public valeurMardiIsNight: boolean;
  public valeurMardiIsNew: boolean;

  public valeurMercredi;
  public valeurMercrediIsNight: boolean;
  public valeurMercrediIsNew: boolean;

  public valeurJeudi;
  public valeurJeudiIsNight: boolean;
  public valeurJeudiIsNew: boolean;

  public valeurVendredi;
  public valeurVendrediIsNight: boolean;
  public valeurVendrediIsNew: boolean;

  public valeurSamedi;
  public valeurSamediIsNight: boolean;
  public valeurSamediIsNew: boolean;

  public hasCorrectValue: boolean;

  public isVisited: boolean;
  public canDelete: boolean;

  public phaseLibelle: string;

}
