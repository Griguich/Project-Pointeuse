import {Injectable} from '@angular/core';
import {DbJsStoreService} from "./dbJsStore.service";
import {SoundModel} from "../../model/sound.model";
import {NameOfTable} from "../../model/enumeration/NameOfTable.model";

@Injectable({
  providedIn: 'root'
})
export class SoundJsStoreService extends DbJsStoreService<SoundModel> {

  public tableName = NameOfTable.SOUNDS;

  constructor() {
    super();
  }

  public getSound() {
    return super.getAll(this.tableName)
      .then((sounds: SoundModel[]) => {
        return sounds;
      })
  }

  public addSound(sound: SoundModel): Promise<any> {
    return super.add(this.tableName, sound);
  }

  public deleteSound(idFront: string) {
    return super.delete(this.tableName, idFront);
  }

}
