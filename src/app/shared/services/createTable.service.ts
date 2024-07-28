import * as JsStore from 'jsstore';
import {DATA_TYPE, IDataBase, ITable} from 'jsstore';
import {environment} from 'src/environments/environment';
import {NameOfTable} from '../model/enumeration/NameOfTable.model';

declare var require: any;

const getWorkerPath = () => {
  if (environment.production) {
    return require('file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.min.js');
  } else {
    return require('file-loader?name=scripts/[name].[hash].js!jsstore/dist/jsstore.worker.js');
  }
};

// This will ensure that we are using only one instance.
// Otherwise due to multiple instance multiple worker will be created.
export const idbCon = new JsStore.Connection(new Worker(getWorkerPath().default));
export const dbname = 'data_base_pointeuse';


const getDatabase = () => {
  const tblAnomalie: ITable = {
    name: NameOfTable.ANOMALIE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }, dateAnomalie: {
        dataType: DATA_TYPE.DateTime
      }, idPointage: {
        dataType: DATA_TYPE.Number
      }, idEmployee: {
        dataType: DATA_TYPE.Number
      }, idRestaurant: {
        dataType: DATA_TYPE.Number
      }, badgeEmployee: {
        dataType: DATA_TYPE.String
      }, nomEmploye: {
        dataType: DATA_TYPE.String
      }, prenomEmploye: {
        dataType: DATA_TYPE.String
      }, valeurContrainte: {
        dataType: DATA_TYPE.String
      }, libelleAnomalie: {
        dataType: DATA_TYPE.String
      }, valide: {
        dataType: DATA_TYPE.Boolean
      }, isPreAlarme: {
        dataType: DATA_TYPE.Boolean
      }
    }
  };
  const tblMessage: ITable = {
    name: NameOfTable.MESSAGE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      },
      idMessageReciever: {
        dataType: DATA_TYPE.Number
      },
      isViewed: {
        dataType: DATA_TYPE.Boolean
      }
    }
  };
  const tblPointage: ITable = {
    name: NameOfTable.POINTAGE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }, idEmployee: {
        dataType: DATA_TYPE.Number
      }, dateJournee: {
        dataType: DATA_TYPE.String
      }, idRestaurant : {
        dataType: DATA_TYPE.Number
      }

    }
  };
  const tblDecoupage: ITable = {
    name: NameOfTable.DECOUPAGE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }
    }
  };

  const tbTypePointage: ITable = {
    name: NameOfTable.TYPE_POINTAGE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      },
      id: {
        dataType: DATA_TYPE.Number
      },
      libelle: {
        dataType: DATA_TYPE.String
      },
      statut: {
        dataType: DATA_TYPE.Boolean
      }
    }
  };

  const tblCorrectionPointage: ITable = {
    name: NameOfTable.CORRECTION_POINTAGE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }, dayOfActivity: {
        dataType: DATA_TYPE.String
      }
    }
  };
  const tblShift: ITable = {
    name: NameOfTable.SHIFT,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }, employee: {
        dataType: DATA_TYPE.Object
      }, dateJournee: {
        dataType: DATA_TYPE.String
      }, idRestaurant : {
        dataType: DATA_TYPE.Number
      }

    }
  };
  const tblAbsence: ITable = {
    name: NameOfTable.ABSENCE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }
    }
  };
  const tblEmploye: ITable = {
    name: NameOfTable.EMPLOYEE,
    version : 2,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }, idEmployee: {
        dataType: DATA_TYPE.Number
      }, idRestaurant : {
        dataType: DATA_TYPE.Number
      }
    }
  };
  const tblRestaurant: ITable = {
    name: NameOfTable.RESTAURANT,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      }
    }
  };
  const tbSound: ITable = {
    name: NameOfTable.SOUNDS,
    columns: {
      idSound: {
        primaryKey: true,
        autoIncrement: false
      }
    },
    version: 2
  };

  const tblParametre: ITable = {
    name: NameOfTable.PARAMETRE,
    columns: {
      idFront: {
        primaryKey: true,
        autoIncrement: false
      },
      param: {
        dataType: DATA_TYPE.String
      }
    }
  };
  const dataBase: IDataBase = {
    name: dbname,
    tables: [tblAnomalie, tblMessage, tblPointage, tblDecoupage, tblCorrectionPointage, tblShift, tblAbsence, tblEmploye, tblRestaurant, tblParametre, tbTypePointage, tbSound]
  };
  return dataBase;
};

export const initJsStore = async () => {
  const dataBase = getDatabase();
  const isDbCreated = await idbCon.initDb(dataBase);

}


