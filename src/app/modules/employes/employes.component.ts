import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {EmployeeModel} from "../../shared/model/employee.model";
import {RhisTranslateService} from "../../shared/services/rhis-translate.service";
import {EmployeJsStoreService} from "./service/employeJsStore.service";
import {EmployeeService} from "./service/employee.service";
import {SessionService} from "../../shared/services/session.service";
import Keyboard from 'simple-keyboard';

@Component({
  selector: 'rhis-employes',
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.scss']
})
export class EmployesComponent implements OnInit, AfterViewInit, OnDestroy {

  public listEmployees: EmployeeModel[];
  public listEmployeesOrigin: EmployeeModel[];
  public header: any[];
  public employeIdList: number[] = [];
  public aucunMessage = '';
  public heightInterface: any;
  public envoiMessageSelectedEmployee = false;
  public envoiMessageSelectedEmployeeAll = false;
  public searchText: string = '';
  public rechercheNomOrPrenom: string;
  public displayClavier1 = false;

  private keyboard: Keyboard;
  isMobile: boolean;
  public scrHeight: any;
  public scrWidth: any;
  public sizeScreenSmall: any;
  private readonly smallScreen = 991;

  constructor(private router: Router,
              private employeeService: EmployeeService,
              private employeJsStoreService: EmployeJsStoreService,
              private rhisTranslateService: RhisTranslateService,
              private sessionService: SessionService) {
  }

  ngOnInit() {
    this.getScreenSize();
    this.rechercheNomOrPrenom = this.rhisTranslateService.translate('EMPLOYEE.SEARCH_PLACEHOLDER');
    this.header = [
      {title: 'Badge', field: this.rhisTranslateService.translate('EMPLOYEE.BADGE')},
      {title: 'NOM', field: this.rhisTranslateService.translate('EMPLOYEE.NOM')},
      {title: 'PRENOM', field: this.rhisTranslateService.translate('EMPLOYEE.PRENOM')},
      {title: 'NUM_TELEPH', field: this.rhisTranslateService.translate('EMPLOYEE.NUM_TELEPH')}
    ];
    this.getEmployes();
    this.aucunMessage = this.rhisTranslateService.translate('EMPLOYEE.AUCUN_MESSAGE');
    if (+this.sessionService.getEmploye() === 0) {
      this.router.navigateByUrl('/');
    }
  }

  private getEmployes() {
    this.employeJsStoreService.getEmployesList().then((result: EmployeeModel[]) => {
      this.listEmployees = result;
      this.listEmployeesOrigin = [...this.listEmployees];
      this.sessionService.nbrTotEmp(this.listEmployees.length)
    });
  }


  /**
   * redirection vers la page message Audio
   */
  public messageVocaleClicked() {
    this.router.navigateByUrl('/messages/messagesAudio');
  }

  /**
   * redirection vers la page message texte
   */
  public messageTexteClicked() {
    this.router.navigateByUrl('/messages/messagesTexte');
  }

  /**
   * redirection vers la page message Banderole
   */
  public messageBanderoleClicked() {
    this.router.navigateByUrl('/messages/messagesBanderole');
  }

  /**
   *  recuperer les employées sélectionés
   * @param: employe
   */
  public getCheckedEmpoye(employe: EmployeeModel, index: number): void {
    this.isAllChecked();
    if (employe.isSelected) {
      this.employeIdList.splice(this.employeIdList.indexOf(employe.idEmployee), 1);
      this.listEmployees[index].isSelected = false;
    } else {
      this.employeIdList.push(employe.idEmployee);
      this.listEmployees[index].isSelected = true;
      this.isAnyChecked();
    }
    this.employeeService.ListIdEmployees = this.employeIdList;
    if (this.employeeService.ListIdEmployees.length !== 0) {
      this.envoiMessageSelectedEmployee = true;
    } else {
      this.envoiMessageSelectedEmployee = false;
    }
  }

  public checkAllEmployees(): void {
    if (this.isAllChecked()) {
      let index;
      this.listEmployees.forEach((employe: EmployeeModel) => {
        index = this.employeIdList.indexOf(employe.idEmployee);
        this.employeIdList.splice(index, 1);
        employe.isSelected = false;
      });
    } else {
      this.listEmployees.forEach((employe: EmployeeModel) => {
        if (!employe.isSelected) {
          this.employeIdList.push(employe.idEmployee);
          employe.isSelected = true;
        }
      });
    }
    this.employeeService.ListIdEmployees = this.employeIdList;
  }

  public isAllChecked(): boolean {
    let isAllChecked = true;
    this.listEmployees.forEach((employe: EmployeeModel) => {
      if (!employe.isSelected) {
        isAllChecked = false;
      }
    });
    if (isAllChecked === true) {
      this.envoiMessageSelectedEmployeeAll = true;
    } else {
      this.envoiMessageSelectedEmployeeAll = false;
    }
    return isAllChecked;
  }

  public isAnyChecked(): boolean {
    let isAllChecked = false;
    this.listEmployees.forEach((employe: EmployeeModel) => {
      if (employe.isSelected) {
        isAllChecked = true;
      }
    });
    return isAllChecked;
  }

  applyFilter(filterValue: string) {
    let filterValueLower = filterValue.toLowerCase();
    if (!filterValue) {
      // Return the original list of employees if filterValue is empty
      this.listEmployees =this.listEmployeesOrigin;
    } else {
      this.listEmployees = this.listEmployees.filter((employee) =>
        employee.nom.toLowerCase().includes(filterValueLower) ||
        employee.prenom.toLowerCase().includes(filterValueLower));
    }
  }

  /************************************** clavier virtuel ****************************/
  private onChange = (input: string) => {
    this.searchText = input;
    this.applyFilter(this.searchText);
  };

  /**
   * pour activer et désactiver le majuscule avec le shit ou capslock
   */
  private onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') this.handleShift();
  };

  private handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";
    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  };


  ngAfterViewInit() {
    this.searchText = "";
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button)
    });
  }

  /**
   * display keyboard when textarea is clicked
   */
  public displayClavierMessage1() {
    if (!this.sizeScreenSmall) {
      this.displayClavier1 = !this.displayClavier1;
    }
  }

  ngOnDestroy() {
    if (this.keyboard) {
      this.keyboard.destroy();
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    this.sizeScreenSmall = this.scrWidth <= this.smallScreen;
  }


}
