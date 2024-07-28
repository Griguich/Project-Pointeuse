import {RapportContrat} from './enumeration/rapportContrat';

export class RapportModel {

  // idRapport?: number;
  // pathTemplate?: string;
  // description?: string;
  // categorie?: string;
  // lastUsed?: Date;
  // pathTemplateUnix?: string;
  // libelleFile?: string;
  // rapportContrat?: String[] = Object.keys(RapportContrat);
  // module?: string;
  // codeName?: string;
  public idRapport: number;
  public pathTemplate: string;
  public description: string;
  public categorie: string;
  public lastUsed: Date;
  public pathTemplateUnix: string;
  public libelleFile: string;
  public rapportContrat: String[] = Object.keys(RapportContrat);
  public module: string;
  public codeName: string;
  public paramsEnvoi?: boolean;
  public restaurants?: any[];
  public lib?: string;
  public uuidRapport?: string;
  public categorieType?: string;
}
