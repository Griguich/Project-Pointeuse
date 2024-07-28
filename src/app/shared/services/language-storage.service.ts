import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageStorageService {

  constructor() { }

  public getDisplayLanguageSettings() {
    return localStorage.getItem('_language');
  }

  public setDisplayLanguageSettings(language: string): void {
    return localStorage.setItem('_language', language);
  }
  public getVocalLanguageSettings() {
    return localStorage.getItem('_VocalLanguage');
  }

  public setVocalLanguageSettings(vocalLanguage: string): void {
    return localStorage.setItem('_VocalLanguage', vocalLanguage);
  }

}
