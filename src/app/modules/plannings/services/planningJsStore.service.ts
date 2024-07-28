import {Injectable} from '@angular/core';
import {NameOfTable} from '../../../shared/model/enumeration/NameOfTable.model';
import {DbJsStoreService} from '../../../shared/services/JsStoreServices/dbJsStore.service';
import {EmployeeModel} from 'src/app/shared/model/employee.model';
import {PointageModel} from 'src/app/shared/model/pointage.model';
import {ContrainteSocialeService} from 'src/app/shared/services/contrainte-sociale.service';
import {RestaurantModel} from 'src/app/shared/model/restaurant.model';
import {DateService} from '../../../shared/services/date.service';
import {ParameterJsStoreService} from "../../../shared/services/JsStoreServices/parameter-js-store.service";
import {SessionService} from "../../../shared/services/session.service";

@Injectable({
  providedIn: 'root'
})
export class PlanningJsStoreService extends DbJsStoreService<any> {
  private restaurantInfos: RestaurantModel;

  constructor(private constraintService: ContrainteSocialeService,
              private dateService: DateService, private parameterJsStoreService: ParameterJsStoreService,
              private sessionService: SessionService
  ) {
    super();
  }

  public addPointage(entity: any) {
    return super.add(NameOfTable.POINTAGE, entity);
  }

  public getListPointage() {
    return super.getAll(NameOfTable.POINTAGE)
      .then((result: PointageModel[]) => {
        return result;
      });
  }

  public getPointagesByDateJournee(dateJounee: string) {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        dateJournee: dateJounee,
        idRestaurant : +this.sessionService.getIdRestaurant()
      }
    });
  }

  /**
   * recuperer  pointages par id FRont
   * @param idFront
   */
  public getPointagesByIdFront(idFront: string): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        idFront: idFront
      }
    });
  }

  public  deletePlanningPreteByEmployees(tableName, idEmployees: number[]) {
    return this.connection.remove({
      from: tableName,
      where: {
        idEmployee: {
          in: idEmployees
        }
      }
    });
  }

  public getPointagesByDateJourneeAndIdEmployee(dateJounee: string, idEmployees: number[]): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
      where: {
        dateJournee: dateJounee,
        idEmployee: {
          in: idEmployees
        }
      }
    });
  }

  public getAllPointage(): Promise<PointageModel[]> {
    return this.connection.select<PointageModel>({
      from: NameOfTable.POINTAGE,
    });
  }


  public deletePointage(idFront: string): Promise<number> {
    return super.delete(NameOfTable.POINTAGE, idFront);
  }

  public deleteAllPointageFromIndexedDb() {
    return super.clear(NameOfTable.POINTAGE);
  }

  public async deleteAllPointageBefore2Months(): Promise<void> {
    const date = new Date();
    const dateMinusTwoMonths = new Date(date.getFullYear(), date.getMonth() - 2, date.getDate());
    const pointageList = await this.getAllPointage();
    if (pointageList.length) {
      pointageList.forEach(pointage => {
        const d = new Date(pointage.dateJournee);
        if (this.dateService.isBefore(d, dateMinusTwoMonths)) {
          super.delete(NameOfTable.POINTAGE, pointage.idFront);
        }
      });
    }

  }

  public updatePointage(pointageToUpdate: PointageModel): Promise<number> {
    return super.update(NameOfTable.POINTAGE, pointageToUpdate.idFront, pointageToUpdate);
  }

  private async checkRestaurantInfos() {
    if (!this.restaurantInfos) {
      this.restaurantInfos = await super.getAll(NameOfTable.RESTAURANT)
        .then((restaurantsInfos: RestaurantModel[]) => {
          if (restaurantsInfos && restaurantsInfos.length) {
            return restaurantsInfos[0];
          }
          return null;
        });
      this.constraintService.setParameters(this.restaurantInfos);
    }
  }

  public async verifySocialConstrainte(pointageToUpdate: PointageModel, employe: EmployeeModel, heurDebModified: boolean, heureFinModified: boolean, dateJournee: Date, isUpdate: boolean): Promise<any> {
    await this.checkRestaurantInfos();
    // Récupérer les pointages de l'employé
    const coordiantions = {employee: employe, pointages: [], pointageToUpdate: pointageToUpdate};
    return super.getByIdEmploye(NameOfTable.POINTAGE, coordiantions.employee.idEmployee)
      .then((pointages: PointageModel[]) => {
        const indexPointageToUpdate = pointages.findIndex((pointage: PointageModel) => pointage.idFront === pointageToUpdate.idFront);
        indexPointageToUpdate>-1?pointages.splice(indexPointageToUpdate, 1, pointageToUpdate):true;
        return {
          employee: employe,
          pointages: pointages,
          pointageToUpdate: pointageToUpdate
        };
      })
      .then(async (coordinations: { employee: EmployeeModel, pointages: PointageModel[], pointageToUpdate: any }) => {
        coordinations.pointages = this.setEndHourForNonTerminatedPointagesWithDateJournee(coordinations, dateJournee, isUpdate);
        let contraintIndex = 0;
        if (coordinations.employee && heurDebModified && heureFinModified) {
          let inVerification = [];
          if (!coordinations.pointageToUpdate.isAcheval) {
            inVerification = await this.checkInPointing(coordinations);
          } else {
            inVerification.push({contrainteMessage: '', isRespected: true});
          }
          const outVerification = this.checkOutPointing(coordinations);
          const allConstraintes = inVerification.concat(outVerification);
          allConstraintes.forEach(constraint => {
            contraintIndex++;
            if (contraintIndex === 12) {
              constraint.contrainteMessage = constraint.contrainteMessage;

            } else {
              constraint.contrainteMessage = constraint.contrainteMessage.split(/[0-9]+/)[0].split(':')[0];
            }
          });
          return allConstraintes;
        } else if (coordinations.employee && heurDebModified) {
          const inVerification = await this.checkInPointing(coordinations);
          inVerification.forEach(constraint => {
            contraintIndex++;
            if (contraintIndex === 12) {
              constraint.contrainteMessage = constraint.contrainteMessage;

            } else {
              constraint.contrainteMessage = constraint.contrainteMessage.split(/[0-9]+/)[0].split(':')[0];
            }
          });
          return inVerification;
        } else {
          const outVerification = await this.checkOutPointingDoneByManager(coordinations);
          outVerification.forEach(constraint => {
            contraintIndex++;
            if (contraintIndex === 12) {
              constraint.contrainteMessage = constraint.contrainteMessage;

            } else {
              constraint.contrainteMessage = constraint.contrainteMessage.split(/[0-9]+/)[0].split(':')[0];
            }
          });
          return outVerification;
        }
      });
  }

  public setEndHourForNonTerminatedPointagesWithDateJournee(coordinations: { employee: EmployeeModel, pointages: PointageModel[], pointageToUpdate: any }, dateJournee: Date, isUpdate: boolean): PointageModel[] {
    if (!isUpdate || (isUpdate && (coordinations.pointageToUpdate.heureFin != null))) {
      coordinations.pointages.forEach((pointage: PointageModel) => {
        if (!pointage.heureFin) {
          pointage.heureFin = this.dateService.setStringFromDate(new Date());
          pointage.heureFinIsNight = !this.dateService.isSameDateOn(new Date(), dateJournee, 'days');
        }
      });
    }
    return coordinations.pointages;
  }

  private async checkInPointing(coordinations: any): Promise<any[]> {
    const inVerification = [];
    for (let pointage of coordinations.pointages) {
      pointage.dateJournee = pointage.isAcheval && pointage.dateJournee === this.dateService.getYesterDay(this.sessionService.getDateJournee()) ? this.sessionService.getDateJournee() : pointage.dateJournee;
    }
    inVerification.push(this.constraintService.verifyMinNightDelay(coordinations), this.constraintService.verifyMaxNbDayNumber(coordinations),
      this.constraintService.verifyMaxNbDayNumber2(coordinations), this.constraintService.verifyMaxDelayPerDay(coordinations),
      this.constraintService.verifyMaxDelayWorkPerWeek(coordinations), this.constraintService.verifyMaxNbShift(coordinations),
      this.constraintService.verifyValidWorkingHours(coordinations), this.constraintService.verifyMinPauseDelay(coordinations),
      this.constraintService.verifyMaxDelayWorkPerMonth(coordinations), this.constraintService.verifyMinFreeDayAndMinWeeklyRestDays(coordinations),
      this.constraintService.verifyCheckAbsenceHours(coordinations), this.constraintService.verifyMinHoursForCoupur(coordinations),
      await this.constraintService.verifyMaxDelayWorkPerDay(coordinations), await this.constraintService.MaxDelayWithoutPause(coordinations));
    return inVerification;
  }

  private checkOutPointing(coordinations: any): any[] {
    const outVerification = [];
    outVerification.push(this.constraintService.verifyMinShiftDelay(coordinations));
    return outVerification;
  }

  private async checkOutPointingDoneByManager(coordinations: any): Promise<any[]> {
    const outVerification = [this.constraintService.verifyMinPauseDelayDoneByManager(coordinations)];
    outVerification.push(this.constraintService.verifyMinShiftDelay(coordinations), this.constraintService.verifyMinHoursForCoupur(coordinations),
      this.constraintService.verifyMinNightDelay(coordinations),
      this.constraintService.verifyMaxNbDayNumber(coordinations),
      this.constraintService.verifyMaxNbDayNumber2(coordinations), this.constraintService.verifyMaxDelayPerDay(coordinations),
      this.constraintService.verifyMaxDelayWorkPerWeek(coordinations), this.constraintService.verifyMaxNbShift(coordinations),
      this.constraintService.verifyValidWorkingHours(coordinations), this.constraintService.verifyMinPauseDelay(coordinations),
      this.constraintService.verifyMaxDelayWorkPerMonth(coordinations), this.constraintService.verifyMinFreeDayAndMinWeeklyRestDays(coordinations),
      this.constraintService.verifyCheckAbsenceHours(coordinations),
      await this.constraintService.verifyMaxDelayWorkPerDay(coordinations), await this.constraintService.MaxDelayWithoutPause(coordinations));
    return outVerification;
  }
}
