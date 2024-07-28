import {Injectable} from '@angular/core';
import * as uuid from 'uuid';
import {BehaviorSubject} from "rxjs";

// @ts-ignore
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  
  isConnected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  dateJournee$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  journee$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  constructor() {
    this.init();
  }

  private init() {
    this.initIsConnected();
    this.initDateJournee();
    this.initJournee();
  }

  private initIsConnected() {
    const isConnected = localStorage.getItem('_isConnected') === 'true';
    this.isConnected$.next(isConnected);
  }

  private initDateJournee() {
    const dateJournee = localStorage.getItem('_dateJournee');
    this.dateJournee$.next(dateJournee);
  }

  private initJournee() {
    const journee = localStorage.getItem('_journee');
    this.journee$.next(journee);
  }


  //
  getDateJournee() {
    return this.dateJournee$.value;
  }

  set isConnected(value: boolean) {
    localStorage.setItem('_isConnected', String(value));
    const isConnected = localStorage.getItem('_isConnected') === 'true';
    this.isConnected$.next(isConnected);
  }

  public getrefreshAfterMise(): string {
    return localStorage.getItem('refreshMise');
  }

  public setrefreshAfterMise(value) {
    localStorage.setItem('refreshMise' , value);
  }

  public getRefreshToken(): string {
    return atob(localStorage.getItem('refresh'));
  }

  public setRefreshToken(refresh: string): void {
    localStorage.setItem('refresh', btoa(refresh));
  }

  public getRefreshTimer(): string {
    return atob(localStorage.getItem('refreshTimer'));
  }

  public setRefreshTimer(refreshTimer: string): void {
    localStorage.setItem('refreshTimer', btoa(refreshTimer));
  }

  public getEmploye() {
    return atob(localStorage.getItem('_EmpI#'));
  }

  public setEmploye(employeId) {
    localStorage.setItem('_EmpI#', btoa(employeId));
  }

  public getIsManager() {
    return localStorage.getItem('_isManager') === 'true';
  }

  public setIsManager(isManager: boolean) {
    localStorage.setItem('_isManager', String(isManager));
  }
  public getpersonalizedAccess() {
    return atob(localStorage.getItem('personalizedAccess'));
  }

  public setpersonalizedAccess(personalizedAccess: string) {
    localStorage.setItem('personalizedAccess', btoa(personalizedAccess));
  }

  public setBandrole(message) {
    localStorage.setItem('_Band#', btoa(message));

  }

  public setManagerEmail(email) {
    localStorage.setItem('_managerEmail', btoa(email));

  }

  public getManagerEmail(): string {
    return atob(localStorage.getItem('_managerEmail'));

  }

  public setDateJournee(dateJournee: Date): void {
    // tslint:disable-next-line:max-line-length
    const date = dateJournee.getFullYear() + '-' + (dateJournee.getMonth() + 1).toString().padStart(2, '0') + '-' + dateJournee.getDate().toString().padStart(2, '0');
    localStorage.setItem('_dateJournee', date);
    this.dateJournee$.next(date);
  }

  public setJournee(journee): void {
    localStorage.setItem('_journee', journee);
    this.journee$.next(journee)

  }

  public getJournee(): string {
    return localStorage.getItem('_journee');

  }

  public getBandrole() {
    return atob(localStorage.getItem('_Band#'));
  }

  public getPointeuseState(): boolean {
    return localStorage.getItem('_State#') === 'true';
  }

  public setPointeuseState(state: any) {
    localStorage.setItem('_State#', state);
  }
  public getEmployeFullName() {
    return atob(localStorage.getItem('_FullName#'));
  }

  public setEmployeFullName(fullName: string) {
    localStorage.setItem('_FullName#', btoa(fullName));
  }

  public getIdRestaurant() {
    return atob(localStorage.getItem('_Restaurant#'));
  }

  public getRestaurant() {
    return localStorage.getItem('_Restaurant#');
  }

  public setIdRestaurant(RestaurantId) {
    localStorage.setItem('_Restaurant#', btoa(RestaurantId));
  }

  public getCodeRestaurant() {
    return atob(localStorage.getItem('_CodeRestaurant'));
  }

  public setCodeRestaurant(codeRestaurant: string) {
    localStorage.setItem('_CodeRestaurant', btoa(codeRestaurant));
  }

  public getRestaurantName() {
    return atob(localStorage.getItem('_RestaurantName'));
  }

  public setRestaurantName(restauratName: string) {
    localStorage.setItem('_RestaurantName', btoa(restauratName));
  }

  public getBadge(): string {
    return atob(localStorage.getItem('_CodeB#'));
  }

  public setBadge(codeBadge: string): void {
    localStorage.setItem('_CodeB#', btoa(codeBadge));
  }

  public getIsTechnicien(): boolean {
    return localStorage.getItem('_isTech') === 'true';
  }


  public setIsTechnicien(IsTechnicien: boolean): void {
    localStorage.setItem('_isTech', String(IsTechnicien));
  }

  public getBearerToken() {
    return localStorage.getItem('token');
  }

  public getBearerTokenForV2() {
    return localStorage.getItem('T120');
  }
  public deleteBearerToken() {
    return localStorage.removeItem('T120');
  }

  public setBearerToken(token) {
    return localStorage.setItem('T120', token);
  }

  public getTokenPointeuse() {
    return localStorage.getItem('T120');
  }

  public setTokenPointeuse(token) {
    return localStorage.setItem('token', token);
  }

  public getAutorisation(): boolean {
    return localStorage.getItem('_Auth#') === 'true';
  }

  public setAutorisation(value: boolean) {
    localStorage.setItem('_Auth#', String(value));
  }

  public setPdfCorrectionPointageSettings(settings: {
    idRestaurant: number,
    dateJournee: string,
  }): void {
    return localStorage.setItem('pdfCorrectionPointage', JSON.stringify(settings));
  }

  public getPdfCorrectionPointageSettings(): {
    idRestaurant: number,
    dateJournee: string
  } {
    return JSON.parse(localStorage.getItem('pdfCorrectionPointage'));
  }

  public getMobile(): boolean {
    const details = navigator.userAgent;
    const regexp = /android|iphone|mobile|ipad/i;
    return regexp.test(details);
  }

  public uuidGenerator(id: number): string {
    const uuidString = uuid.v4();
    return uuidString.substring(0, 10) + ((id + 5555) * 133) + uuidString.substring(10, 20);
  }

  public setSyncPointageProgress(syncPointages: boolean): void {
    return localStorage.setItem('syncPointages', JSON.stringify(syncPointages));
  }

  public getSyncPointageProgress(): boolean {
    return JSON.parse(localStorage.getItem('syncPointages'));
  }

  public setSyncEmployesProgress(syncEmployes: boolean): void {
    return localStorage.setItem('syncEmployes', JSON.stringify(syncEmployes));
  }

  public getSyncEmployesProgress(): boolean {
    return JSON.parse(localStorage.getItem('syncEmployes'));
  }

  public setSyncCorrectionsProgress(syncCorrections: boolean): void {
    return localStorage.setItem('syncCorrections', JSON.stringify(syncCorrections));
  }

  public getSyncCorrectionsProgress(): boolean {
    return JSON.parse(localStorage.getItem('syncCorrections'));
  }

  public setSyncParamProgress(syncParam: boolean): void {
    return localStorage.setItem('syncParam', JSON.stringify(syncParam));
  }

  public getSyncParamProgress(): boolean {
    return JSON.parse(localStorage.getItem('syncParam'));
  }

  public setSyncPlanningProgress(syncPlanning: boolean): void {
    return localStorage.setItem('syncPlanning', JSON.stringify(syncPlanning));
  }

  public getSyncPlanningProgress(): boolean {
    return JSON.parse(localStorage.getItem('syncPlanning'));
  }

  public setTimeToReload(timeToReload: number): void {
    return localStorage.setItem('timeToReload', JSON.stringify(timeToReload));
  }

  public getTimeToReload(): number {
    return +JSON.parse(localStorage.getItem('timeToReload'));
  }

  public setForceReload(forceReload: boolean): void {
    return localStorage.setItem('timeToReload', JSON.stringify(forceReload));
  }

  public getForceReload(): boolean {
    return JSON.parse(localStorage.getItem('forceReload'));
  }

  public setDebutJournee(journee: Date): void {
    localStorage.setItem('_DebutJournee', journee.toString());

  }

  public setDroitModification(yesWeCan: boolean): void {
    localStorage.setItem('_canModifie', JSON.stringify(yesWeCan));

  }

  public setDroitAssociation(yesWeCan: boolean): void {
    localStorage.setItem('_canAssociate', JSON.stringify(yesWeCan));

  }

  public setstate(yesWeCan: boolean): void {
    localStorage.setItem('associated', JSON.stringify(yesWeCan));

  }

  public getDroitModification(): boolean {
    return JSON.parse(localStorage.getItem('_canModifie'));
  }

  public getDroitAssociation(): boolean {
    return JSON.parse(localStorage.getItem('_canAssociate'));
  }

  public getDebutJournee(): Date {
    return new Date(localStorage.getItem('_DebutJournee'));
  }

  public getFinJournee(): Date {
    return new Date(localStorage.getItem('_finJournee'));
  }

  public getOuvertureInter(): Date {
    return new Date(localStorage.getItem('_ouverturJournee'));
  }

  public setOuvertureInter(journee: Date): void {
    localStorage.setItem('_ouverturJournee', journee.toString());
  }

  public setIsTimePointerEntreeSortie(IsTimePointerEntreeSortie: number): void {
    return localStorage.setItem('_isTimePointerEntreeSortie', JSON.stringify(IsTimePointerEntreeSortie));
  }

  public getIsTimePointerEntreeSortie(): number {
    return +JSON.parse(localStorage.getItem('_isTimePointerEntreeSortie'));
  }
  public setDisplayDateOption(option: string): void {
    localStorage.setItem('_affichage_date', option);
  }
  public getDisplayDateOption() {
    return localStorage.getItem('_affichage_date');
  }

  public setSyncPretsProgress(syncPointages: boolean): void {
    return localStorage.setItem('syncPrets', JSON.stringify(syncPointages));
  }


  public deletetoken(): void {
    return localStorage.removeItem('token');

  }

  setFinJournee(journee: Date): void {
    localStorage.setItem('_finJournee', journee.toString());

  }

  getLastSync() {
    return localStorage.getItem('_LastSync');

  }
  getLastSyncType() {
    let val = localStorage.getItem('_LastSyncType');
    switch (val) {
      case '1':
        return 'manuelle';
      case '0':
        return 'regulier';
      default:
        return 'noSyncType'
    }
  }

  setLastSync(journee: string): void {
    localStorage.setItem('_LastSync', journee.toString());

  }
  setLastSyncType(type: number): void {
    localStorage.setItem('_LastSyncType', String(type));

  }

  setTotalPointe(totalPointingHours: string) {
    localStorage.setItem('_totalPoint', totalPointingHours);

  }

  getTotalPointe(): string {
    return localStorage.getItem('_totalPoint');

  }

  setNbrTotEmp(length: number) {
    localStorage.setItem('_totalEMP', String(length));

  }

  getnbrTotEmp() {
    return localStorage.getItem('_totalEMP');

  }
  public getSyncPretsProgress(): boolean {
    return JSON.parse(localStorage.getItem('syncPrets'));
  }

  public getVolume(): number {
    const volume = localStorage.getItem('volume');
    if (volume) {
      return +volume;
    } else {
      return 50;
    }
    //return +(localStorage.getItem('volume'));

  }
  setIsFirstTime(isFirstTimeAssociation: any) {
    localStorage.setItem('popupShown', isFirstTimeAssociation);
  }
  setTotEmpPlaned(totalDuration: any) {
    localStorage.setItem('_totalDurationPlanned', totalDuration);
  }
  getTotEmpPlaned(): any {
    return +(localStorage.getItem('_totalDurationPlanned'));

  }

  getIsFirstTime() {
    return localStorage.getItem('popupShown');
  }
  setNbrTotempPointe(val: number) {
    localStorage.setItem('_totalEmpPointed', String(val));

  }

  getNbrTotempPointe(): any {
    return Number(localStorage.getItem('_totalEmpPointed'));

  }
  setVolume(value: number) {
    localStorage.setItem('volume', String(value));

  }
  nbrTotEmp(length: number) {
    localStorage.setItem('_totalEMP', String(length));

  }

  setDateProchFermeture(value:Date){
    localStorage.setItem('_DateProchFermeture',value.toString());
  }
  setDateProchOuverture(value:Date){
    localStorage.setItem('_DateProchOuverture',value.toString());
  }
  setDateProchDeblocage(value:Date){
    localStorage.setItem('_DateProchDeblocage',value.toString());
  }
  setNbrAnomalie(value:string){
    localStorage.setItem('_NbrAnomalie',value.toString());
  }
  setNbrAbsence(value:number){
    localStorage.setItem('_NbrAbsence',value.toString());
  }
  getDateProchFermeture(): Date {
    return new Date(localStorage.getItem('_DateProchFermeture'));
  }
  getDateProchOuverture(): Date {
    return new Date(localStorage.getItem('_DateProchOuverture'));
  }
  getDateProchDeblocage(): Date {
    return new Date(localStorage.getItem('_DateProchDeblocage'));
  }
  getNbrAnomalie():any{
    return localStorage.getItem('_NbrAnomalie');
  }
  getNbrAbsence():any{
    return localStorage.getItem('_NbrAbsence');
  }
  public getIsOuvertureDone() {
    return localStorage.getItem('_isOuvertureDone') === 'true';
  }
  public setIsOuvertureDone(isManager: boolean) {
    localStorage.setItem('_isOuvertureDone', String(isManager));
  }
  public getLastDateOuverturePointeuse() {
    return localStorage.getItem('lastOuverturePointeuse');
  }
  public setLastDateOuverturePointeuse(date: Date) {
    localStorage.setItem('lastOuverturePointeuse', String(date));
  }
  public setAllPointagesInLocalStorage(data: string) {
    localStorage.setItem('listPointage', data);
  }
  public getAllPointagesFromLocalStorage() {
    return localStorage.getItem('listPointage');
  }
  public setAllCorrectionPointagesInLocalStorage(data: string) {
    localStorage.setItem('listCorrectionPointage', data);
  }
  public getAllCorrectionPointagesFromLocalStorage() {
    return localStorage.getItem('listCorrectionPointage');
  }

  public setSynchronisation_ok(synch_ok: string) {
    localStorage.setItem('Synchro_ok', synch_ok);
  }
  public getSynchronisation_ok() {
    return localStorage.getItem('Synchro_ok');
  }
  
  public setSynchronisation_failed(synch_failed: string) {
    localStorage.setItem('Synchro_failed', synch_failed);
  }
  public getSynchronisation_failed() {
    return localStorage.getItem('Synchro_failed');
  }
}
