import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RhisTranslateService {

  constructor(private translateService: TranslateService) {
  }

  /**
   * Traduir un mot
   */
  translate(key) {
    let keyTranslated = '';
    let sub = this.translateService.get(key).subscribe(
      (translated: any) => {
        keyTranslated = translated;
      }
    );
    if (keyTranslated !== '') {
      sub.unsubscribe();
    }
    return keyTranslated;
  }

  /**
   * Get translation by a promise
   * @param: key
   */
  public get(key: string): Promise<string> {
    return this.translateService.get(key).toPromise();
  }

  /**
   * Get browser language
   */
  get browserLanguage(): string {
    return this.translateService.getBrowserLang();
  }

  /**
   * Set language
   * @param: lang
   */
  set language(lang: string) {
    this.translateService.use(lang);
  }

  /**
   * Get the current languages
   */
  get currentLang(): string {
    return this.translateService.currentLang;
  }

  /**
   * Configure the languages to be used and the used one
   * @param: languages
   * @param: defaultLang
   */
  configLanguage(languages: string [], defaultLang: string): void {
    this.translateService.addLangs(languages);
    this.translateService.setDefaultLang(defaultLang);
    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use(browserLang.match(/en|fr/) ? browserLang : defaultLang);
  }
}
