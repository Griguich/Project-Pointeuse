import {Injectable} from '@angular/core';
import {GenericCRUDRestService} from './JsStoreServices/generic-crud.service';
import {HttpClient} from '@angular/common/http';
import {PathService} from './path.service';
import {RestaurantModel} from '../model/restaurant.model';
import {Observable} from 'rxjs';
import {SessionService} from './session.service';
import {AnomalieModel} from "../model/anomalie.model";
import {RestaurantGUI} from "../model/RestaurantGUI.model";
import {ServiceStatus} from "../model/serviceGUI";

@Injectable({providedIn: 'root'})
export class RestaurantService extends GenericCRUDRestService<RestaurantModel, number> {

  constructor(private http: HttpClient, private pathService: PathService, private sessionService: SessionService) {
    super(http, `${pathService.getPathPointeuse()}/restaurant`);
  }

  // public getCodePointeuseByMacAdress(macPointeuse: string): Observable<any> {
  //   return this.http.get(this.pathService.getPathEmployee() + '/restaurant/byMacPointeuse/' + macPointeuse);
  // }

  public getRestauratByCodePointeuse(codePointeuse: string): Observable<any> {
    return this.http.get(this.pathService.getPathEmployee()  + '/restaurant/byCodePointeuse/' + codePointeuse);
  }
  public linkMacPointeuseToRestaurant(macPointeuse: string, codePointeuse: string): Observable<any> {
    return this.http.get(this.pathService.getPathEmployee() + '/restaurant/' + macPointeuse + '/link/' + codePointeuse);
  }

  public deletePointeuseRestaurantAssociation(codePointeuse: string): Observable<any> {
    return this.http.get(this.pathService.getPathEmployee() + '/restaurant/initialize/' + codePointeuse);
  }
 public confirmAssociation(codePointeuse: string): Observable<any> {
    return this.http.get(this.pathService.getPathEmployee() + '/restaurant/confirmassociation/' + codePointeuse);
  }

  public isRestaurantAssocitedToAnotherPointeuse(coderesto: string): Observable<any> {
    return this.http.get(this.pathService.getPathEmployee() + '/restaurant/isAssoicieted/' + coderesto);
  }

  public launchImportNCRFiles(idRestaurant: number): Observable<void> {
    const uuidRestaurant = this.sessionService.uuidGenerator(idRestaurant);
    return this.http.get<void>(this.pathService.getPathPlanning() + '/icaisse/interfaceCaisseNCR/' + uuidRestaurant);
  }

  public getRestaurants(email: string): Observable<RestaurantGUI[]> {
    return this.http.get<RestaurantGUI[]>(this.pathService.getHostServerSecurity() + '/user/listrestaurants/' + email);
  }
  public getListDroit(email: string): Observable<string[]> {
    return this.http.get<string[]>(this.pathService.getHostServerSecurity() + '/user/droitList/' + email);
  }

  public getListDroitForUser(email: string): Observable<string[]> {
    return this.http.get<string[]>(this.pathService.getHostServerSecurity() + '/droit/droitList/' + email);
  }
public downloadInstallationFiles(): Observable<ServiceStatus> {
    return  this.http.get<ServiceStatus>(this.baseUrl + '/download/');
  }

  public changeStatusRestaurant(idRestaurant: number): Observable<any> {
    return this.http.get<any>(this.pathService.getPathEmployee() + '/restaurant/associationRestaurant/' + idRestaurant);
  }

  public changePointeuse_association_date(dateAssociation: string, uuidRestaurant: string): Observable<any> {
    return this.http.get<any>(this.pathService.getPathEmployee() + '/restaurant/pointeuse_association_date/' + dateAssociation + '/' + uuidRestaurant);
  }
}
