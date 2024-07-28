import {AfterViewInit, Component, OnInit} from '@angular/core';
import Keyboard from "simple-keyboard";
import {RhisTranslateService} from "../shared/services/rhis-translate.service";
// @ts-ignore
import {
  AbstractControl,
  FormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {AuthenticationService} from './service/authentication.service';
import {Router} from "@angular/router";
import {SessionService} from "../shared/services/session.service";
import {RestaurantModel} from "../shared/model/restaurant.model";
import {RestaurantService} from "../shared/services/restaurant.service";
import {AnomalieJsStoreService} from "../modules/anomalie/service/anomalieJsStore.service";
import {DateService} from "../shared/services/date.service";
import {AnomalieModel} from "../shared/model/anomalie.model";
import {ShiftJsStoreService} from "../shared/services/JsStoreServices/shiftJsStore.service";
import {ShiftModel} from "../shared/model/shift.model";

@Component({
  selector: 'app-connexion-technicien',
  templateUrl: './connexion-technicien.component.html',
  styleUrls: ['./connexion-technicien.component.scss']
})
export class ConnexionTechnicienComponent implements AfterViewInit {
  public badCredential = false;
  public isSubmitted = false;
  public isMobile: boolean;
  public notAuthorized = false;

  RestaurentList: Array<RestaurantModel> = [];
  public inputNumberValue: number;
  public loginForm = this.formBuilder.group(
    {
      email: new UntypedFormControl('', [Validators.required, this.emailValidator()]),
      password: new UntypedFormControl('', [Validators.required]),
    }
  );
  displaySpinner: any;
  private keyboard: Keyboard;
  private keyBoardInput: string;
  private restaurantService: RestaurantService;

  public isMobileDetector: boolean;
  public champObligatoireEmail = false;
  public champObligatoirePassword = false;

  inputName = "";
  inputs = {
    mail: "",
    pwd: ""
  };

  public displayKeyboard = false;

  constructor(private rhisTranslateService: RhisTranslateService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private sessionService: SessionService,
              private anomaliJsStoreService: AnomalieJsStoreService,
              private dateService: DateService,
              private shiftJsStoreService: ShiftJsStoreService,
              private formBuilder: FormBuilder) {
  this.isMobileDetector = sessionService.getMobile();
  }

  /************************************** clavier virtuel ****************************/

  /**
   * pour activer et désactiver le majuscule avec le shit ou capslock
   */
  private onKeyPress = (button: string) => {
    if (button === '{shift}' || button === '{lock}') this.handleShift();
  }

  ngAfterViewInit() {
    // tslint:disable-next-line:no-unused-expression
    this.sessionService.getBearerToken() != null ? this.sessionService.deletetoken() : null;

  }

  onInputFocus = (event: any) => {
    this.inputName = event.target.id;
    if (!this.keyboard) {
      this.keyboard = new Keyboard({
        debug: true,
        inputName: this.inputName,
        onChange: (input) => this.onChange(input),
        onKeyPress: (button) => this.onKeyPress(button),
        preventMouseDownDefault: true // If you want to keep focus on input
      });
      this.keyboard.replaceInput(this.inputs);
    } else {
      this.keyboard.setOptions({
        inputName: this.inputName
      });
    }
  };

  setInputCaretPosition = (elem: any, pos: number) => {
    if (elem.setSelectionRange) {
      elem.focus();
      elem.setSelectionRange(pos, pos);
    }
  };

  onChange = (input: string) => {
    this.inputs[this.inputName] = input;
    let caretPosition = this.keyboard.caretPosition;
    if (caretPosition !== null)
      this.setInputCaretPosition(
        document.querySelector(`#${this.inputName}`),
        caretPosition
      );
  };

  onInputChange = (event: any) => {
    this.keyboard.setInput(event.target.value, event.target.id);
  };

  displayKeyboardInput() {
    this.displayKeyboard = !this.displayKeyboard;
  }

  public async onLogin(): Promise<void> {
    let shifts: any[];
    let totalShift = 0;
    this.champObligatoireEmail = false;
    this.champObligatoireEmail = false;
    if (this.loginForm.valid) {
      this.displaySpinner = true;
      this.isSubmitted = true;
      this.loginForm.value.email = this.loginForm.value.email.toLowerCase();
      let sub = this.authenticationService.loginV2(this.loginForm.value)
        .subscribe(async (res: any) => {
          if (this.sessionService.getRestaurant()) {
            await this.anomaliJsStoreService.getAnomalieBydate(this.dateService.setTimeNull(this.dateService.getCorrectDateJournee())).then((result: AnomalieModel[]) => {
              if (result.length) {
                this.sessionService.setNbrAnomalie(result.length.toString());
              }
            });
            shifts = await this.shiftJsStoreService.getByDateJournee(this.sessionService.getDateJournee());
            if (shifts.length) {
              await shifts.forEach((item: ShiftModel) => {
                if (item.employee) {
                  totalShift += item.totalHeure;
                }
              });
            }
          }
          this.sessionService.setTotEmpPlaned(totalShift / 60);
          this.sessionService.setBearerToken(res.body);
          if (this.sessionService.getIsTechnicien()) {
            this.sessionService.isConnected = true;
            sub.unsubscribe();
            this.displaySpinner = true;
          }
          this.sessionService.setManagerEmail(this.loginForm.value.email);
          // this.navigatebyDroit(this.loginForm.value.email);
          this.router.navigateByUrl('/code');
        }, err => {
          this.sessionService.deleteBearerToken()
          if (err.status === 500) {
            this.badCredential = false;
          } else if (err.status === 400) {
            this.notAuthorized = true;
          }
          this.displaySpinner = false;
        });
      if (this.loginForm.value.password.length !== 0 && this.loginForm.value.email.length !== 0) {
        this.champObligatoireEmail = false;
        this.champObligatoirePassword = false;
      }
    }  else {
      if (this.loginForm.value.password.length === 0) {
        this.champObligatoirePassword = true;
      }
      if (this.loginForm.value.email === '') {
        this.champObligatoireEmail = true;
        if (this.loginForm.value.password.length !== 0) {
          this.champObligatoireEmail = false;
        }
      }
      if (this.loginForm.value.email === '' && this.loginForm.value.password === '') {
        this.champObligatoireEmail = true;
        this.champObligatoirePassword = true;
      }
      if (this.loginForm.value.password.length !== 0 && this.loginForm.value.email.length !== 0) {
        this.champObligatoireEmail = false;
        this.champObligatoirePassword = false;
      }
    }
  }



  /************************************** clavier virtuel ****************************/


  /**
   * pour activer et désactiver le majuscule avec le shit ou capslock
   */

  private handleShift = () => {
    let currentLayout = this.keyboard.options.layoutName;
    let shiftToggle = currentLayout === "default" ? "shift" : "default";
    this.keyboard.setOptions({
      layoutName: shiftToggle
    });
  }

  private async navigatebyDroit(email) {
    const list: number[] = this.permissionConverter(await this.restaurantService.getListDroit(email).toPromise());
    // check if user has modification access
    if (list.indexOf(1) !== -1) {
      this.router.navigateByUrl('/code');

    }
  }
  public permissionConverter(permission) {
    let n = +parseInt(permission, 10).toString(2);

    const ListPermissions = ([]);
    let decimal = 0;
    let p = 0;
    while ((n !== 0)) {
      {
        // tslint:disable-next-line:no-bitwise
        decimal = (Math.round((n % 10) * Math.pow(2, p)) | 0);

        ListPermissions.push(decimal);
        n = (n / 10 | 0);
        p++;
      }
    }


    return ListPermissions;
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const valid = pattern.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }
}
