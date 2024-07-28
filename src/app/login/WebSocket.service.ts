import { Injectable } from '@angular/core';
import { SessionService } from '../shared/services/session.service';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {RhisTranslateService} from '../shared/services/rhis-translate.service';
import {RestaurantDataService} from '../shared/services/restaurant-data.service';
import {ConfirmationService} from 'primeng/api';
import { DateService } from '../shared/services/date.service';
import { SynchronisationService } from '../shared/services/synchronisation.service';
import { MyrhisIdleSerice } from '../shared/services/myrhis.idle.serice';
import { RestaurantService } from '../shared/services/restaurant.service';
import { ShiftJsStoreService } from '../shared/services/JsStoreServices/shiftJsStore.service';
import { NotificationService } from '../shared/services/notification.service';
import { PointeuseRoutingService } from '../shared/services/PointeuseRoutingService';
import { S } from '@fullcalendar/core/internal-common';

@Injectable({
  providedIn: 'root'
})


export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  public codeRestaurant: string;
  public syncEnCours = false;
  public date_synchro!: Date ;
  public popupSynchronisation = false;
  public value = 0;
  private dbName = 'data_base_pointeuse';
  private storeNameEmployee = 'Employee';
  private storeNamePointage = 'Pointage';
  test :boolean = true ;
  public employeesWithPointages: {
    pointages: {
        id: string;
        heureDebut: string;
        heureFin: string;
        tempsPointer: string;
        dateJournee: string;
    }[];
    id: string;
    nom: string;
    prenom: string;
    badgeCode: string;
    
}[]


public employeesWithcorections :{

  nom : string;
  prenom : string;
  pointageTime : string;
  dayOfActivity : string;

}[] 




  webSocketService: any;

  constructor(public sessionService: SessionService,
    private rhisTranslateService: RhisTranslateService,
    private confirmationService: ConfirmationService,
    private dateService: DateService,
    private synchronisationService: SynchronisationService,
    private myrhisIdleSerice: MyrhisIdleSerice,
    private restaurantDataService: RestaurantDataService,
    private shiftJsStoreService: ShiftJsStoreService,
    private notificationService: NotificationService,
    private pointeuseRouter: PointeuseRoutingService,
    ) {
      this.initDb();
  }

  connect() {
    this.codeRestaurant = this.sessionService.getCodeRestaurant();
    this.socket$ = new WebSocketSubject('ws://localhost:8080/websocket?id_restaurant='+this.codeRestaurant);

    this.socket$.subscribe(
      (message) => {
        //console.log('Raw message from server:', message); // Log the raw message
        try {
          const parsedMessage = JSON.parse(message); // Attempt to parse JSON
         
          
          if (parsedMessage.action == 'action 1') {
            const _LastSync = localStorage.getItem('_LastSync');
            const _DebutJournee = localStorage.getItem('_DebutJournee');
            const _finJournee = localStorage.getItem('_finJournee');
            const _NbrAbsence = localStorage.getItem('_NbrAbsence');
            const _DateProchFermeture = localStorage.getItem('_DateProchFermeture');
            const _DateProchOuverture = localStorage.getItem('_DateProchOuverture');
            const _DateProchDeblocage = localStorage.getItem('_DateProchDeblocage');
            const _NbrAnomalie = localStorage.getItem('_NbrAnomalie');
            const _totalEMP = localStorage.getItem('_totalEMP');
            const _totalEmpPointed = localStorage.getItem('_totalEmpPointed');
            const _totalDurationPlanned = localStorage.getItem('_totalDurationPlanned');
            const totalPoint = localStorage.getItem('_totalPoint');

            message = JSON.stringify({ restaurant_id: parsedMessage.reciever, action: 'action 1 good', 
              LastSync : _LastSync, DebutJournee:_DebutJournee , finJournee:_finJournee ,NbrAbsence:_NbrAbsence,DateProchefermeture :_DateProchFermeture,
              DateProcheOuverture :_DateProchOuverture ,DateProcheDeblocage :_DateProchDeblocage,NbrAnomalie:_NbrAnomalie ,totalEmp:_totalEMP,
              totalEmpPointed:_totalEmpPointed ,totalDurationPlanned :_totalDurationPlanned ,totalPoint: totalPoint
             })
            this.socket$.next(message);
            console.log("action 1 is good",message)
      }

          if (parsedMessage.action == 'action 2') {
          const _totalEMP = localStorage.getItem('_totalEMP');
          message = JSON.stringify({ restaurant_id: parsedMessage.restaurant_id, action: 'action 2 good', _totalEMP: _totalEMP })
          this.socket$.next(message);
          console.log("action 2 is good",message)
      }
          if (parsedMessage.action == 'action 3') {
          this.date_synchro = parsedMessage.date_synchro ;
       
          this.synchronization();
          console.log("synchro good")
      }
          if (parsedMessage.action == 'block/unblock') {
          this.blockUnblock();
          console.log("block/unblock good")
      }   
      
      if(parsedMessage.action == 'open_pointeuse'){
        this.getDataForOuverturePointeuse(parsedMessage.id_restaurant)
        console.log("successfully opened ")
      }

      if(parsedMessage.action == 'synchro_plannig'){
        this.synchronization_plannig()
        console.log("upload data good")
      }


      if (parsedMessage.action == 'employee_liste' || parsedMessage.action == 'test_badging' ) {
        this.display_data().then(employeesWithPointages => {
          const payload = {
            restaurant_id: parsedMessage.reciever,
            action: 'employees_with_pointages',
            employeesWithPointages: JSON.stringify(employeesWithPointages)
        };
      
          this.socket$.next(JSON.stringify(payload));
          console.log("Sending employees with pointages:", payload);
        }).catch(error => {
          console.error('Error fetching employee data:', error);
        });
      }


      if (parsedMessage.action == 'corection_liste') {
        this.display_correction_pointage().then(employeesWithcorections => {
          const payload = {
            restaurant_id: parsedMessage.reciever,
            action: 'employees_with_corections',
            employeesWithcorections: JSON.stringify(employeesWithcorections)
        };
      
          this.socket$.next(JSON.stringify(payload));
          console.log("Sending employees with corections:", payload);
        }).catch(error => {
          console.error('Error fetching employee data:', error);
        });
      }


      if (parsedMessage.action == 'test_badging' ) {
        this.display_data().then(employeesWithPointages => {
          const payload = {
            restaurant_id: parsedMessage.reciever,
            action: 'verify_badging',
            employeesWithPointages: JSON.stringify(employeesWithPointages)
        };
      
          this.socket$.next(JSON.stringify(payload));
          console.log("Sending employees with pointages:", payload);
        }).catch(error => {
          console.error('Error fetching employee data:', error);
        });
      }
      
      
          
      
          
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
  }

  sendMessage(message) { // Adjust message type as needed
    this.socket$.next(JSON.stringify(message)); // Convert message to JSON string
  }

  public dateJournee = this.dateService.getCorrectDateJournee();


  public async synchronization(): Promise<void> {
    const dateChoisit: Date = this.dateService.getCorrectDateJournee(this.date_synchro); 
    const syncPointages: boolean = true; // Always true
  
    if (syncPointages) {
      await this.synchronisationService.synchroniseRegulary(syncPointages, this.dateService.dateToShortForm(dateChoisit), 1);
          this.dateJournee = new Date(this.dateService.getCorrectDateJournee().setDate(this.dateService.getCorrectDateJournee().getDate() - 1));
          this.sessionService.setLastSync((new Date()).toLocaleString());
          this.sessionService.setLastSyncType(1);
    } else {
      this.sessionService.setLastSync((new Date()).toLocaleString());
      this.sessionService.setLastSyncType(1);
     
     
    }
  }

  public async synchronization_plannig(): Promise<void> {
    const dateChoisit: Date = new Date()
    const syncPointages: boolean = true; // Always true
    
    if (syncPointages) {
      this.synchroniseProceed();
      await this.synchronisationService.synchroniseRegulary(syncPointages, this.dateService.dateToShortForm(dateChoisit), 1);
          this.dateJournee = new Date(this.dateService.getCorrectDateJournee().setDate(this.dateService.getCorrectDateJournee().getDate() - 1));
          this.sessionService.setLastSync((new Date()).toLocaleString());
          this.sessionService.setLastSyncType(1);
    } else {
      this.sessionService.setLastSync((new Date()).toLocaleString());
      this.sessionService.setLastSyncType(1);
     
     
    }
  }

  public async synchroniseProceed(): Promise<void> {
    this.myrhisIdleSerice.stopIdle();
    let syncValues = [];
    this.value = 0;
    // tslint:disable-next-line:max-line-length
    this.syncEnCours = !!(true || true|| true || true);
    
      await this.restaurantDataService.getEmployeeActifAndSaveToLocalBase(+this.sessionService.getIdRestaurant());
    
   
      await this.restaurantDataService.getShiftAndSaveToLocalBase(+this.sessionService.getIdRestaurant());
    
    let languageHasChanged = false;
    
      
      await this.restaurantDataService.getParametreList(+this.sessionService.getIdRestaurant());
     
      
    


    this.shiftJsStoreService.setSynchronisedListShift(true);

    syncValues.push({
      syncEnCours: true,
      syncResult: this.sessionService.getSyncEmployesProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.EMPLOYE_PROGRESS')
    });
    syncValues.push({
      syncEnCours: true,
      syncResult: this.sessionService.getSyncParamProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PARAM_PROGRESS')
    });
    syncValues.push({
      syncEnCours: true,
      syncResult: this.sessionService.getSyncPointageProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.POINTAGE_PROGRESS')
    });
    syncValues.push({
      syncEnCours: true,
      syncResult: this.sessionService.getSyncPlanningProgress(),
      syncText: this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.PLANNING_PROGRESS')
    });

    syncValues = syncValues.filter((syncValue: any) => syncValue.syncEnCours);
    if (this.syncEnCours) {
      let i = 0;
      const interval = setInterval(async () => {
        const element: Element = document.querySelectorAll('div.ui-progressbar-label.ng-star-inserted')[0];
        const element2: Element = document.querySelectorAll('div.ui-progressbar-value')[0];

        if (i < syncValues.length && syncValues[i].syncEnCours) {
          if (syncValues[i].syncResult === null) {
            (element as HTMLElement).innerHTML = syncValues[i].syncText;
          } else if (syncValues[i].syncResult) {
            this.value = this.value + Math.floor((100 / syncValues.length));
            (element as HTMLElement).innerHTML = syncValues[i].syncText;
            (element2 as HTMLElement).style.background = 'rgb(45, 199, 109)';
            i++;
          } else {
            if (this.sessionService.getSyncPointageProgress() === false) {
              (element as HTMLElement).innerHTML = this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.ECHECK_SYNC_POINTAGE');
              (element2 as HTMLElement).style.background = '#dc3545';
              this.value = this.value + Math.floor((100 / syncValues.length));
              i++;
            } else if (syncValues[i].syncText !== this.rhisTranslateService.translate('POPUP_SYNCHRONISATION.POINTAGE_PROGRESS')) {
              (element as HTMLElement).innerHTML = syncValues[i].syncText;
              (element2 as HTMLElement).style.background = '#dc3545';
              this.value = this.value + Math.floor((100 / syncValues.length));
              i++;
            }

          }
        } else {
          i++;
        }
        if (i > syncValues.length) {
          this.value = 100;
          (element as HTMLElement).innerHTML = '';
          if (syncValues.find((syncValue: any) => !syncValue.syncResult)) {
            (element2 as HTMLElement).style.background = '#dc3545';
          } else {
            (element2 as HTMLElement).style.background = 'rgb(45, 199, 109)';
            (element as HTMLElement).innerHTML = '100%';
          }
          this.popupSynchronisation = false;
          clearInterval(interval);
          this.sessionService.setSyncPointageProgress(null);
          this.sessionService.setSyncCorrectionsProgress(null);
          this.sessionService.setSyncParamProgress(null);
          this.sessionService.setSyncEmployesProgress(null);
          this.sessionService.setSyncPlanningProgress(null);
          await this.myrhisIdleSerice.startIdle();
          if (languageHasChanged) {
            window.location.reload();
          }
        }
      }, 2000);
    }
  }

  private async getDataForOuverturePointeuse(idRestaurant: number) {
    await this.restaurantDataService.getInfoToPointeuse(idRestaurant);
    await this.restaurantDataService.setDateJourneeAndOuvertureFermetureTimer();
  }
  
  
  public blockUnblock(): void {
    this.sessionService.getPointeuseState() ?
    this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('POINTEUSE.BLOCK')) :
    this.notificationService.showSuccessMessage(this.rhisTranslateService.translate('POINTEUSE.UNBLOCK'));
    this.sessionService.setPointeuseState(!this.sessionService.getPointeuseState());
  }

  //liste des employer sous kuber

  private initDb(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeNameEmployee)) {
        db.createObjectStore(this.storeNameEmployee, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(this.storeNamePointage)) {
        db.createObjectStore(this.storeNamePointage, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
    };

    request.onsuccess = (event) => {
      console.log('IndexedDB initialized successfully');
    };
  }

  public fetchData(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(this.storeNameEmployee, 'readonly');
        const store = transaction.objectStore(this.storeNameEmployee);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = (event) => {
          console.error('Error fetching Employee data:', event);
          reject(event);
        };
      };
    });
  }

  public fetchPointages(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(event);
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(this.storeNamePointage, 'readonly');
        const store = transaction.objectStore(this.storeNamePointage);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };

        getAllRequest.onerror = (event) => {
          console.error('Error fetching Pointage data:', event);
          reject(event);
        };
      };
    });
  }

  public display_data(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.fetchData().then(employeeData => {
        const employees = employeeData.map(employee => ({
          id: employee.idEmployee,
          nom: employee.nom,
          prenom: employee.prenom,
          badgeCode: employee.badge ? employee.badge.code : '',
        }));

        this.fetchPointages().then(pointageData => {
          const pointages = pointageData.map(pointage => ({
            id: pointage.idEmployee,
            heureDebut: pointage.heureDebut,
            heureFin: pointage.heureFin,
            tempsPointer: pointage.tempsPointer,
            dateJournee: pointage.dateJournee
          }));

          const employeesWithPointages = employees.map(employee => ({
            ...employee,
            pointages: pointages.filter(pointage => pointage.id === employee.id)
          }));

          this.employeesWithPointages = employeesWithPointages; // Store the result

          console.log('Employees with pointages:', this.employeesWithPointages);
          resolve(employeesWithPointages);
        }).catch(error => {
          console.error('Error fetching pointage data:', error);
          reject(error);
        });

      }).catch(error => {
        console.error('Error fetching employee data:', error);
        reject(error);
      });
    });
  }


  public fetchCorrections(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
  
      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject(event);
      };
  
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('Correction_Pointage', 'readonly');
        const store = transaction.objectStore('Correction_Pointage');
        const getAllRequest = store.getAll();
  
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
        };
  
        getAllRequest.onerror = (event) => {
          console.error('Error fetching Correction data:', event);
          reject(event);
        };
      };
    });
  }
  
  public display_correction_pointage(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.fetchCorrections().then(correctionData => {
        const employeesWithcorections = correctionData.map(correction => ({
          nom: correction.nomEmployee,
          prenom: correction.prenomEmployee,
          pointageTime: correction.pointageTime,
          dayOfActivity: correction.dayOfActivity
        }));
        
        this.employeesWithcorections = employeesWithcorections;
        console.log('Corrections:', employeesWithcorections);
        resolve(employeesWithcorections);
      }).catch(error => {
        console.error('Error fetching correction data:', error);
        reject(error);
      });
    });
  }
  
}
