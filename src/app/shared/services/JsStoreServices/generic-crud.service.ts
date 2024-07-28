import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PaginationArgs, PaginationPage} from '../../model/pagination.args';

export class GenericCRUDRestService<T, G> {

  constructor(protected httpClient: HttpClient, protected baseUrl: string) {
  }

  public add(entity: T | T[], apiUrl?: string): Observable<any> {
    return this.httpClient.post<T>(this.baseUrl + (apiUrl ? apiUrl : '/'), entity);
  }

  public update(entity: T, apiUrl?: string): Observable<T> {
    return this.httpClient.put<T>(this.baseUrl + (apiUrl ? apiUrl : '/'), entity);
  }

  public remove(id: G, apiUrl?: string): Observable<Response> {
    return this.httpClient.delete<Response>(this.baseUrl + (apiUrl ? apiUrl : '/') + id);
  }

  public getOneById(id: G, apiUrl?: string): Observable<T> {
    return this.httpClient.get<T>(this.baseUrl + (apiUrl ? apiUrl : '/') + id);
  }

  public getAll(apiUrl?: string): Observable<T[]> {
    return this.httpClient.get<T[]>(this.baseUrl + (apiUrl ? apiUrl : '/'));
  }

  public getAllWithPaginationAndFilter(paginationArgs: PaginationArgs, apiUrl?: string, filter?: any): Observable<PaginationPage<T>> {
    return this.httpClient.get<PaginationPage<T>>(this.baseUrl + apiUrl + `?page=${paginationArgs.pageNumber}&size=${paginationArgs.pageSize}${this.generateUrl(filter)}`);
  }

  private generateUrl(obj: any): string {
    let url = '';
    if (obj) {
      Object.entries(obj).forEach(entry => {
        if (entry) {
          url = url + '&' + entry[0] + '=' + entry[1];
        }
      });
    }
    return url;
  }
}
