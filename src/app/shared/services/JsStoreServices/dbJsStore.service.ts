import {BaseService} from '../base.service';


export class DbJsStoreService<T> extends BaseService {
  /**
   * Get all data from IDB
   * @param target : table name
   */
  public getAll(tableName) {
    return this.connection.select<T>({
      from: tableName
    });
  }

  /**
   * add item
   * @param tableName
   * @param entity
   */
  public add(tableName, entity: T) {
    return this.connection.insert<T>({
      into: tableName,
      return: true, // as id is autoincrement, so we would like to get the inserted value
      values: [entity]
    });
  }

  /**
   * Add a list of entities in one time
   * @param tableName
   * @param entities
   */
  public addAll(tableName, entities: T[]) {
    return this.connection.insert<T>({
      into: tableName,
      return: true, // as id is autoincrement, so we would like to get the inserted value
      values: entities
    });
  }

  /**
   * Delete an Item from IDB
   * @param tableName
   * @param entityIdFront
   */
  public delete(tableName, entityIdFront: string) {
    return this.connection.remove({
      from: tableName,
      where: {
        idFront: entityIdFront
      }
    });
  }

  /**
   * Update an Item in IDB
   * @param tableName
   * @param updateValue
   */
  public update(tableName, idFront, updateValue: T) {
    return this.connection.update({
      in: tableName,
      where: {
        idFront: idFront
      },
      set: updateValue
    });
  }

  /**
   * get entity by idFront
   * @param tableName
   * @param entityIdFront
   */
  public getByIdFront(tableName, entityIdFront: number) {
    return this.connection.select<T>({
      from: tableName,
      where: {
        idFront: entityIdFront
      }
    });
  }

  /**
   * get entity by id Employé
   * @param tableName
   * @param entityIdEmploye
   */
  public getByIdEmploye(tableName: string, entityIdEmploye: number) {
    return this.connection.select<T>({
      from: tableName,
      where: {
        idEmployee: entityIdEmploye
      }
    });
  }

  /**
   * cleare table
   * @param tableName
   */
  public async clear(tableName) {
    return await this.connection.clear(tableName);
  }

  /**
   * get count
   * @param tableName
   */
  public async getCount(tableName,date) {
    return await
      this.connection.count({
        from: tableName,
        where:  {
          dateAnomalie : date
        }
      });
  }

  public  deleteEmployeePrete(tableName, idRestaurant) {
    return this.connection.remove({
      from: tableName,
      where: {
        idRestaurant: {
          '!=' : idRestaurant
        }
      }
    });
  }

}
