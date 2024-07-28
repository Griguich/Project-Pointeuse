import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PointeuseRoutingService {

  ALL_ROUTES = {
    'EMPLOYES': '/employes',
    'PLANNINGS': '/plannings',
    'MESSAGES': '/messages',
    'HISOTRIQUE': '/messages/historique',
    'ASSOCIATION': '/code',
    'PARAMETRE': '/parametres',
    'LIVE': '',
    'TECH': 'connection-technecien',
    'RAPPORTS': '/rapports'
  };

  public getRoute(componentName: string): string {
    return this.ALL_ROUTES[componentName];
  }

}
