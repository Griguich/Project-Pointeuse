import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {SessionService} from '../shared/services/session.service';
import {PathService} from '../shared/services/path.service';

export class ELKBody {
  pointeuse_id;
  pointeuse_name;
  response_time;
  httpResponseStatus;
  timestamp;

}

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private backendUrl:string;
  private elkUrl:string;
  private delayMs:number;
  private idRestaurant:string;
  private restaurantName:string;
  private enableMonitoring:boolean;
  private elasticSearchUsername:string;
  private elasticSearchPassword:string;
  private checkConnectionELK:boolean;
  private hostServerPointeuse:string;

  constructor(private http: HttpClient,private  pathService: PathService,private sessionService: SessionService) {
    this.backendUrl=pathService.getPathPointeuse();
    this.elkUrl=pathService.getPathELKServer();
    this.delayMs=pathService.getdelayMsBetweenhealthRequests();
    this.enableMonitoring=pathService.getenableMonitoring();
    this.elasticSearchUsername=pathService.getElasticSearchUsername();
    this.elasticSearchPassword=pathService.getElasticSearchPassword();
    this.checkConnectionELK=false;
    this.hostServerPointeuse=pathService.getPathPointeuse();
  }

  private checkHealthBackend():void {

    let startDate=Date.now();

   let sub = this.http.get(this.backendUrl + "/health", {observe: 'response'})
     .subscribe((res) => {
       this.indexDataInElasticsearch(startDate, Date.now() - startDate, res.status);
       sub.unsubscribe();
     }, (error: any) => {
       this.indexDataInElasticsearch(startDate, Date.now() - startDate, error.status);
     });


  }

  private indexDataInElasticsearch(startDate:number,responseTime:number,httpStatusCode:number):void {
    let body:ELKBody=new ELKBody();
    body.pointeuse_id=1;
    body.pointeuse_name=this.restaurantName;
    body.response_time=responseTime;
    body.httpResponseStatus=httpStatusCode;
    body.timestamp=startDate;


    let sub = this.http.post<any>(this.elkUrl + "/pointeuses-000001/_doc", body,
      {
        headers: new HttpHeaders({
          "Authorization": "Basic " + btoa(this.elasticSearchUsername + ":" + this.elasticSearchPassword),
          'Content-Type': 'application/json',
        })
      }
    ).subscribe((res) => {
      if (res.result == "created") this.checkConnectionELK = true;
      else this.checkConnectionELK = false;
      sub.unsubscribe();
    }, (error: any) => {
      console.log(error);
      this.checkConnectionELK = false;
    });

  }

  public checkHealth(): void {
    if (this.enableMonitoring == false ||
      this.hostServerPointeuse.localeCompare("https://pointeuse.myrhis.fr/pointeuse") != 0) return;
    setInterval(() => {
      this.idRestaurant = this.sessionService.getIdRestaurant();
      this.restaurantName = this.sessionService.getRestaurantName();
      if (this.idRestaurant != null)
        this.checkHealthBackend();

    }, this.delayMs);
  }

  //returns true if the connection with elasticsearch server works else returns false
  public getCheckConnectionELK():boolean{
    if(this.enableMonitoring==false)return false;
    this.checkHealthBackend();
    return this.checkConnectionELK;
  }
}
