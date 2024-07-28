import {Injectable} from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpParams
} from '@angular/common/http';
import {Observable, throwError, from} from 'rxjs';
import {catchError, flatMap, mergeMap, retryWhen, take} from 'rxjs/operators';
import {getToken} from "codelyzer/angular/styles/cssLexer";
import {SessionService} from "./session.service";
import {TokenPointeuseService} from "./token-pointeuse.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private session: SessionService,
              private tokenPointeuseService: TokenPointeuseService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const expiredToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhdXRvcmlzYXRpb24iLCJhdWQiOiIyIiwiaXNzIjoibWFoZXIuYmVubmFjZWZAcmhpcy1zb2x1dGlvbnMuY29tIiwiZXhwIjoxNjc5MzE1NDg1LCJhdXRob3JpdGllcyI6W119.ye7Rqf3OqPxKpwKejvSCL3rtTGrCFA2ZGr-an4sWMpA';

    return next.handle(req).pipe(
        catchError( (err: HttpErrorResponse) => {

                const newReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer_RH_IS ${this.session.getBearerToken()}`.replace(/"/g, '')
                    }
                  }
                );
                return next.handle(newReq);
              })
         
      );
  }


  private  getTokenPointeuseFromV2(token): Observable<string> {
    const param = {jwt: 'Bearer_RH_IS ' + token};
    const jwt =  this.tokenPointeuseService.getTokenForPointeuseAndSetToLocalStorage(param);
    this.session.setTokenPointeuse(jwt);
    return jwt;
  }
}
