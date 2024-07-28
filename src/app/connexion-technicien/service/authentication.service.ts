import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {PathService} from '../../shared/services/path.service';
import {GenericCRUDRestService} from '../../shared/services/JsStoreServices/generic-crud.service';
import {UserModel} from '../../shared/model/user.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends GenericCRUDRestService<UserModel, String> {
  public host;
  constructor(private http: HttpClient, private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, `${pathService.getPathPointeuse()}/techConnexion`);
    this.host = this.pathService.getHostServerSecurity();
  }

  public login(data): Observable<any> {
    return this.http.post(this.pathService.getHostServerSecurity(), data, {observe: 'response'});
  }

  public loginV2(data): Observable<any> {
    // option observe pour récuperer toute la reponse http et non sa convertion json
    return this.http.post(this.pathService.getHostServerSecurity() + '/user/techConnexion', data, {observe: 'response'});
  }
}
