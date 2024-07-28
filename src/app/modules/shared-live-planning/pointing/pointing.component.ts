import {Directive, HostListener} from '@angular/core';
import {PointingService} from '../../pointage/service/pointing.service';
import {Router} from '@angular/router';
import {SessionService} from '../../../shared/services/session.service';
import {RestaurantService} from '../../../shared/services/restaurant.service';
import {RestaurantModel} from '../../../shared/model/restaurant.model';
import {RestaurantDataService} from '../../../shared/services/restaurant-data.service';
import {InfoRestaurantJsStoreService} from '../../../shared/services/JsStoreServices/infoRestaurantJsStore.service';
import {MacPointeuseService} from "../../../shared/services/mac-pointeuse.service";
import {Subject} from "rxjs";
import {BadgingService} from "../../../shared/services/badging.service";
import {UserActionDetectorService} from "../../../shared/services/user-action-detector.service";
import {PointageModel} from "../../../shared/model/pointage.model";
import {NotificationService} from "../../../shared/services/notification.service";
import {EmployeeModel} from "../../../shared/model/employee.model";
import {ParametreModel} from "../../../shared/model/parametre.model";
import {ParameterJsStoreService} from "../../parametre-globaux/services/parameter-js-store.service";
import {RestaurantDePretEnumeration} from "../../../shared/model/enumeration/RestaurantPret.enum";


@Directive()
export class PointingComponent {

  private userActivity: any;
  public badgeCode: any;
  //variable temporaire
  private mac: string;
  public constraintsMessage: string;
  public card: string = '';
  public badge: string = '';
  public key: any;
  public isEnterPointing: boolean;
  public lastPointing: PointageModel;
  public showPointingButtons = false;
  public isBadgeEnteredManually = false;
  private listParameter: ParametreModel[] = [];
  private usesStoreCode = 'USESTORECODE';
  private cardLength = 11;
  private cardFormRegex = '^%([0-9]{9})(\\?|\\%).*$';
  private isOnline = true;
  constructor(public pointingService: PointingService,
              public router: Router,
              public sessionService: SessionService,
              public restaurantService: RestaurantService,
              public restaurantDataService: RestaurantDataService,
              public infoRestaurantJsStoreService: InfoRestaurantJsStoreService,
              public macPointeuse: MacPointeuseService,
              public badgingService: BadgingService,
              public userActionService: UserActionDetectorService,
              public notificationService: NotificationService,
              public parameterJsStoreParameter: ParameterJsStoreService) {
   //this.getmac()
    this.pointingService.checkRestaurantInfos();
  }


  public getMac(): void {
  let sub = this.macPointeuse.getMacPointeuse().subscribe(() => {
    sub.unsubscribe();
  }, error => {
    if (error.status === 200) {
      this.mac = error.error.text;
    } else {
      this.mac = this.restaurantDataService.makeString();
    }
    this.verifyCodePointeuse();
    sub.unsubscribe();
  });

  }

  /**
   * permet de verifié si le code pointeuse exist sinon le recupérer
   */
  private verifyCodePointeuse(): void {
    if (btoa(this.sessionService.getIdRestaurant()) === 'null') {
      let sub = this.restaurantService.getRestauratByCodePointeuse(this.sessionService.getCodeRestaurant()).subscribe((restaurant: RestaurantModel) => {
        if (!restaurant) {
          this.router.navigateByUrl('administrateur');
        } else {
          restaurant.idFront = this.restaurantDataService.makeString();
          this.sessionService.setIdRestaurant(restaurant.idRestaurant);
          this.sessionService.setCodeRestaurant(restaurant.codePointeuse);
          this.sessionService.setRestaurantName(restaurant.libelle);
          this.infoRestaurantJsStoreService.addRestaurant(restaurant);
          this.pointingService.restaurant = restaurant;
          this.restaurantDataService.getInfoToPointeuse(restaurant.idRestaurant);
          this.sessionService.setIdRestaurant(restaurant.idRestaurant);
          this.sessionService.setCodeRestaurant(restaurant.codePointeuse);
          this.sessionService.setRestaurantName(restaurant.libelle);
        }
        sub.unsubscribe();
      }, err => {
        this.router.navigateByUrl('administrateur');
      });

    }
  }

  public async checkPointing(codeBadge?: string): Promise<void> {
    this.pointingService.updateMessage('');
    await this.pointingService.getManager(codeBadge);
    await this.redirectToPlanning();
    this.sessionService.isConnected = true;
  }
  /**
   * recdirection vers vue live plannings
   */
  public async redirectToPlanning(): Promise<void> {
    this.userActionService.setUserLoggedIn(true);
    await this.router.navigateByUrl(`plannings`);
  }

  private userInactive: Subject<any> = new Subject();

  /**
   * permet de detecter le passage de badge, recuperer le code badge et verifier sa forme
   * @param event
   */
    // Flag pour éviter de gérer plusieurs événements keypress en même temps
  private isHandlingKeyPress = false;

// listener pour l'événement 'keypress' sur le document (detection de passage de badge)
  @HostListener('document:keypress', ['$event'])
  public async handleKeyboardEvent(event: KeyboardEvent): Promise<void> {
    // Si nous gérons déjà un événement keypress, ou si nous ne sommes pas à l'URL racine, stop
    if (this.isHandlingKeyPress || this.router.url !== '/') {
      return;
    }

    this.isHandlingKeyPress = true;

    try {
      // Concaténaton du code du badge
      this.badge += event.key;

      // Matche le badge avec l'expression régulière pour extraire le code de badge
      const badgeMatch = this.badge.match('.*%([0-9]{9})(\\?|\\%).*');
      if (!badgeMatch) return;

      // Gérez le badge extrait
      await this.handleBadge(badgeMatch[1]);
    } finally {
      // Réinitialisez le flag pour permettre de gérer le prochain événement keypress
      this.isHandlingKeyPress = false;
    }
  }

// Méthode pour gérer le code badge extrait
  private async handleBadge(badgeCode: string): Promise<void> {
    if (this.restaurantDataService.isInfoRestaurantIsEmpty()) {
      await this.restaurantDataService.getInfoRestaurant()
    }
    await this.restaurantDataService.checkIfIndexedDBIsDeletedAfterPassBadge();

    await this.getListParameter();

    this.setTimeout();

    // Mettez à jour la variable badge avec le code de badge extrait
    this.badge = `%${badgeCode}%`;

    // Si le badge a été saisi manuellement, stop !
    if (this.isBadgeEnteredManually) return;

    // Si le badge ne correspond pas à l'expression régulière de la carte, réinitialisez les données du badge et affichez un message d'erreur 'badge invalid'
    if (!this.badge.match(this.cardFormRegex)) {
      this.resetBadgeData();
      this.notificationService.showErrorMessage('PLANNING_PAGE_PRINCIPALE.INVALID_BADGE');
      return;
    }

    // Obtenez les codes de badge et de restaurant
    const badgingCodes = this.badgingService.getCodeBadgeAndCodeRestaurant(this.badge);

    const storeCodeParameter = await this.listParameter.find(
      (parameter: ParametreModel) => parameter.param === this.usesStoreCode
    );

    // Si le restaurant n'est pas vérifié et que le paramètre de code de magasin est vrai, affichez un message d'erreur et réinitialisez les données du badge
    if (!this.badgingService.verifyRestaurant(badgingCodes.codeRestaurant) && storeCodeParameter.valeur === 'true') {
      this.notificationService.showErrorMessage('PLANNING_PAGE_PRINCIPALE.INVALID_RESTAURANT');
      this.resetBadgeData();
      return;
    }

    // Vérifiez si le badge existe
    const employee = await this.badgingService.verifyBadgeExist(badgingCodes.codeBadge);
    if (!employee) {
      this.notificationService.showErrorMessage('PLANNING_PAGE_PRINCIPALE.NOT_AFFECTED');
      this.resetBadgeData();
      return;
    }

    // Si l'employé est prêté et que le restaurant de prêt est le restaurant A, affichez un message d'erreur
    if (employee.prete && employee.restaurantDePret === RestaurantDePretEnumeration.RestaurantA) {
      this.notificationService.showErrorMessage('PLANNING_PAGE_PRINCIPALE.INVALID_BADGE_PRET');
      return;
    }

    this.sessionService.setIsTimePointerEntreeSortie(new Date().getTime());
    const pointageEntreeSortie = new Date(this.sessionService.getIsTimePointerEntreeSortie());
    pointageEntreeSortie.setMilliseconds(0);
    pointageEntreeSortie.setSeconds(0);
    this.sessionService.setIsTimePointerEntreeSortie(pointageEntreeSortie.getTime());

    this.setSeesionData(employee);
    this.showPointingButtons = true;
    [this.lastPointing, this.isEnterPointing] = await this.badgingService.getBadgingState(employee.idEmployee, true);
    // Changez l'état de pointage pointahe entré ou sortie
    this.badgingService.changePointingState(this.isEnterPointing ? 1 : 0);
    // Vérifiez le pointage
    await this.checkPointing(badgingCodes.codeBadge);
  }

// Méthode pour réinitialiser les données du badge
  private resetBadgeData() {
    this.badgeCode = '';
    this.badge = '';
    this.card = '';
  }



  private setTimeout(): void {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), 1000);
  }

  @HostListener('window:keypress')
  public refreshUserState(): void {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }


  public setSeesionData(employee: EmployeeModel): void {
    this.sessionService.setEmploye(employee.idEmployee);
    this.sessionService.setBadge(employee.badge.code);
    this.sessionService.setEmployeFullName(employee.prenom + ' ' + employee.nom);
  }

  private async getListParameter(): Promise<void> {
    this.listParameter = await this.parameterJsStoreParameter.getListParameter();
  }

}
