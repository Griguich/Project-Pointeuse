
export class ServiceStatus {
 private _running: boolean;

  get running(): boolean {
    return this._running;
  }

  set running(value: boolean) {
    this._running = value;
  }

  constructor(running: boolean) {
    this._running = running;
  }
}
