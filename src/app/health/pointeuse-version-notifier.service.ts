import {Injectable} from "@angular/core";
import {SwUpdate} from "@angular/service-worker";
import {DateService} from "../shared/services/date.service";

@Injectable({
  providedIn: 'root'
})
export class PointeuseVersionNotifierService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | undefined;

  constructor(private updates: SwUpdate,
              private dateService: DateService) {
    if (updates.isEnabled) {
      // check and detect periodically if there is a new version of pointeuse
    //  this.dateService.clock.subscribe(() => updates.checkForUpdate().then());
    }
  }

  private async checkForUpdate<T extends { version: string, url: string }>(): Promise<string> {
    try {
      this.initiateUpdateSequence();
      const response = await fetch('/api/update-check');
      if (!response.ok) {
        throw new Error('Failed to check for updates');
      }
      const data: T = await response.json();
      return data.version.toString();
    } catch (error) {
      return null;
    }
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
      this.serviceWorkerRegistration.onupdatefound = this.handleServiceWorkerUpdateFound;
    }
  }

  private handleServiceWorkerUpdateFound = (): void => {
    const installingWorker = this.serviceWorkerRegistration?.installing;
    if (installingWorker) {
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available and will be used when all tabs for this page are closed.
            console.log('New content is available; please refresh.');
          } else {
            // Content is cached for offline use.
            console.log('Content is cached for offline use.');
          }
        }
      };
    }
  }

  private async applyUpdate(): Promise<void> {
    if (this.serviceWorkerRegistration) {
      const worker = this.serviceWorkerRegistration.waiting;
      if (worker) {
        worker.postMessage({ action: 'skipWaiting' });
      }
    }
  }

  private async initiateUpdateSequence(): Promise<void> {
    const updateInfo = await this.checkForUpdate<{ version: string, url: string }>();
    if (updateInfo) {
      await this.registerServiceWorker();
      await this.applyUpdate();
    }
  }

  public checkForUpdates(): void {
    // if there is a new version was detected, reload page
    this.updates.available.subscribe(event => {
      this.reloadPointeuse()
    });
  }

  private reloadPointeuse(): void {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
