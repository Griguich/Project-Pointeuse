import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdbService {
  private dbPromise;

  constructor() {
  }


  /**
   * Add an Item in IDB
   * @param target : table name
   * @param value : item to add
   */
  addItems(target: string, value: any) {
    this.dbPromise.then((db: any) => {
      const tx = db.transaction([target], 'readwrite');
      tx.objectStore(target).put(value);
      return tx.complete;
    });
  }
  /**
   * Update an Item in IDB
   * @param target : table name
   * @param value: item to update
   */
  updateItem(target: string, value: any) {
    this.dbPromise.then((db: any) => {
      const tx = db.transaction([target], 'readwrite');
      tx.objectStore(target).put(value);
      return tx.complete;
    });
  }
  /**
   * Delete an Item from IDB
   * @param target : table name
   * @param key: item to delete
   */
  deleteItems(target: string, key: any) {
    this.dbPromise.then((db: any) => {
      const tx = db.transaction(target, 'readwrite');
      const store = tx.objectStore(target);
      store.delete(key);
      return tx.complete;
    });
  }
  /**
   * Get all data from IDB
   * @param target : table name
   */
  getAllData(target: string): Promise<any> {
    return this.dbPromise.then((db: any) => {
      const tx = db.transaction(target, 'readonly');
      const store = tx.objectStore(target);
      return store.getAll();
    });
  }
}
