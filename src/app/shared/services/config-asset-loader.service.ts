import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PathService} from './path.service';
import {Title} from '@angular/platform-browser';

@Injectable({providedIn: 'root'})
export class ConfigAssetLoaderService {

  private readonly CONFIG_URL = 'assets/config/config.json';
  private configuration: Observable<any>;

  constructor(private http: HttpClient, private  pathService: PathService, private title: Title) {
  }

  public loadConfigurations(): Promise<any> {
    if (!this.configuration) {
      this.configuration = this.http.get(this.CONFIG_URL);
    }
    return this.configuration.toPromise().then(config => {
      this.pathService.setPathgdh(config.hostServerGdh);
      this.pathService.setHostServerSecurity(config.hostServerSecurity);
      this.pathService.setPathEmployee(config.hostServerEmployee);
      this.pathService.setPathPlanning(config.hostServerPlanning);
      this.pathService.setHostServerRapport(config.hostServerRapport);
      this.pathService.setPathPointeuse(config.hostLocalServer);
      this.pathService.setPathLocalServer(config.hostLocalServer);
      this.pathService.setPathELKServer(config.elkUrl);
      this.pathService.setdelayMsBetweenhealthRequests(config.delayMsBetweenhealthRequests);
      this.pathService.setenableMonitoring(config.enableMonitoring);
      this.pathService.setElasticSearchUsername(config.elasticSearchUsername);
      this.pathService.setElasticSearchPassword(config.elasticSearchPassword);
      this.title.setTitle(config.title);
      this.pathService.rabbitMQConf = config._rabbitMQ;
      this.pathService.setSychroPointageQueue(config.pointageQueue);
      this.pathService.setRabbitMQ(config.rabbitMQ);
      this.pathService.setSychroCorrectionQueue(config.correctionQueue);
    });
  }

}
