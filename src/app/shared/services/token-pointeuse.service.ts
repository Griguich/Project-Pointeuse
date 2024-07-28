import { Injectable } from '@angular/core';
import {PathService} from "./path.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TokenPointeuseService {

  constructor(private pathService: PathService,
              private httpClient: HttpClient) { }


  /**
   * get Token for pointeuse
   */
  public getTokenForPointeuseAndSetToLocalStorage(token): Observable<any> {
    return this.httpClient.post(this.pathService.getHostServerSecurity() + '/user/tokenPointeuse', token);
  }
}
