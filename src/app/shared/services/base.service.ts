import {idbCon} from "./createTable.service";


export class BaseService {

  get connection() {
    return idbCon;
  }

}
