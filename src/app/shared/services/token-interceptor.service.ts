import { PathService } from './path.service';
import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {SessionService} from "./session.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private session: SessionService,
              private pathService: PathService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   const token = this.session.getBearerToken();
   if (request.url === this.pathService.getPathELKServer() + "/pointeuses-000001/_doc")
     return next.handle(request);
   else if (token && !request.url.includes('/tokenPointeuse')) {
     request = request.clone({
       setHeaders: {
         Authorization: `Bearer_RH_IS ${this.session.getBearerToken()}`.replace(/"/g, '')
       }
     });
     return next.handle(request);
   } else {
     return next.handle(request);
   }

 }

}
