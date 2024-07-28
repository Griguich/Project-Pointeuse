import {Injectable} from "@angular/core";
import {DEFAULT_INTERRUPTSOURCES, Idle} from "@ng-idle/core";
import {Keepalive} from "@ng-idle/keepalive";
import {Observable, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ParametreModel} from "../model/parametre.model";
import {ParameterJsStoreService} from "../../modules/parametre-globaux/services/parameter-js-store.service";

@Injectable({
  providedIn: 'root'
})
export class MyrhisIdleSerice {


  private lastPing?: Date = null;

  private timeOutSubject = new Subject<any>();
  private destroy: Subject<void> = new Subject<void>();

  private timeOut = 'TIMEOUT_POINTEUSE';
  private timeOutWarningCountdownSubject = new Subject<number>();

  constructor(private idle: Idle, private keepalive: Keepalive, private parameterJsStoreParameter: ParameterJsStoreService) {
  }

  public async startIdle(name?: string): Promise<void> {
    let params = await this.parameterJsStoreParameter.getListParameter();
    let timeOutPointeuse: ParametreModel = params.find((paramete: ParametreModel) => paramete.param === this.timeOut);
    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(1);

    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(+timeOutPointeuse.valeur);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    if (name) {
      this.idle.setIdleName(name);
    }
    this.idle.onIdleEnd.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.idle.watch();
    });

    this.idle.onTimeout.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.stopIdle();
      this.timeOutSubject.next(true);
    });

    this.idle.onIdleStart.pipe(takeUntil(this.destroy)).subscribe(() => {
    });

    this.idle.onTimeoutWarning.pipe(takeUntil(this.destroy)).subscribe((countdown) => {
      this.timeOutWarningCountdownSubject.next(countdown);
    });

    // sets the ping interval to 15 seconds
    this.keepalive.interval(15);

    this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.idle.watch();
  }

  public stopIdle(): void {
    this.destroy.next();
  }

  public isTimedOut(): Observable<any> {
    return this.timeOutSubject.asObservable();
  }

  public timeOutWarningCountdown(): Observable<any> {
    return this.timeOutWarningCountdownSubject.asObservable();
  }

  public isRunning(): boolean {
    return this.idle.isRunning();
  }
}
