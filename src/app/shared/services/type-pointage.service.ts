import {GenericCRUDRestService} from "./JsStoreServices/generic-crud.service";
import {Injectable} from "@angular/core";
import {TypePointageModel} from "../model/type-pointage.model";
import {HttpClient} from "@angular/common/http";
import {PathService} from "./path.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TypePointageService extends GenericCRUDRestService<TypePointageModel, number> {

  constructor(private pathService: PathService, httpClient: HttpClient) {
    super(httpClient, 'typePointage');
  }

  public getActiveTypePointage(): Observable<TypePointageModel[]> {
    return this.httpClient.get<TypePointageModel[]>(`${this.pathService.getPathEmployee()}/${this.baseUrl}/pointeuse/active/all`);
  }
}


