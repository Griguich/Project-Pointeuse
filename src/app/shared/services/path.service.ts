import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PathService {
  private hostServerPointeuse: string;
  private hostLocalServer: string;
  private elkUrl: string;
  private delayMsBetweenhealthRequests: number;
  private enableMonitoring: boolean;
  private elasticSearchUsername: string;
  private elasticSearchPassword: string;
  private hostServerGdh: string ;
  private hostServerEmployee: string ;
  private hostServerPlanning: string ;
  private hostServerSecurity: string;
  private hostServerRapport: string;
  private rabbitMQ: object;
  private _rabbitMQ;
  private pointageQueue: string;
  private correctionQueue: string;

  get rabbitMQConf() {
    return this._rabbitMQ;
  }

  set rabbitMQConf(value) {
    this._rabbitMQ = value;
  }
  getRabbitMQ() {
    return this.rabbitMQ;
  }

  setRabbitMQ(value) {
    this.rabbitMQ = value;
  }
  getSychroPointageQueue() {
    return this.pointageQueue;
  }

  setSychroPointageQueue(value: string) {
    this.pointageQueue = value;
  }

  getSychroCorrectionQueue() {
    return this.correctionQueue;
  }

  setSychroCorrectionQueue(value: string) {
    this.correctionQueue = value;
  }
  public getHostServerSecurity(): string {
    return this.hostServerSecurity;
  }
  public setHostServerSecurity(hostServerSecurity: string): void {
    this.hostServerSecurity = hostServerSecurity;
  }

  public getHostServerRapport(): string {
    return this.hostServerRapport;
  }
  public setHostServerRapport(hostServerRapport: string): void {
    this.hostServerRapport = hostServerRapport;
  }

// to get server path planning
  public getPathPointeuse(): string {
    return this.hostServerPointeuse;
  }
  public getPathPlanning(): string {
    return this.hostServerPlanning;
  }
  public setPathPlanning(hostServerPlanning: string): void {
    this.hostServerPlanning = hostServerPlanning;
  }
  public getPathgdh(): string {
    return this.hostServerGdh;
  }
  public setPathgdh(hostServerGdh: string): void {
    this.hostServerGdh = hostServerGdh;
  }

  public getPathEmployee(): string {
    return this.hostServerEmployee;
  }
  public setPathEmployee(hostServerEmployee: string): void {
    this.hostServerEmployee = hostServerEmployee;
  }
  /**
   * to get local server path
   */
  public getPathLocalServer(): string {
    return this.hostLocalServer;
  }

  public setPathLocalServer(hostLocalServer: string): void {
    this.hostLocalServer = hostLocalServer;
  }

  public setPathPointeuse(hostServerPointeuse: string): void {
    this.hostServerPointeuse = hostServerPointeuse;
  }

  public getPathELKServer(): string {
    return this.elkUrl;
  }

  public setPathELKServer(elkURL: string): void {
    this.elkUrl = elkURL;
  }
  /**
   * to get the delay between health requests
   */
  public getdelayMsBetweenhealthRequests(): number {
    return this.delayMsBetweenhealthRequests;
  }

  public setdelayMsBetweenhealthRequests(delay: number): void {
    this.delayMsBetweenhealthRequests = delay;
  }

  public getenableMonitoring(): boolean {
    return this.enableMonitoring;
  }

  public setenableMonitoring(enableMonitoring: boolean): void {
    this.enableMonitoring = enableMonitoring;
  }

  public getElasticSearchUsername(): string {
    return this.elasticSearchUsername;
  }

  public setElasticSearchUsername(elasticSearchUsername: string): void {
    this.elasticSearchUsername = elasticSearchUsername;
  }

  public getElasticSearchPassword(): string {
    return this.elasticSearchPassword;
  }

  public setElasticSearchPassword(elasticSearchPassword: string): void {
    this.elasticSearchPassword = elasticSearchPassword;
  }
}
