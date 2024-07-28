import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {ConnexionTechnicienComponent} from './connexion-technicien/connexion-technicien.component';


const routes: Routes = [
  {path: '', loadChildren: () => import('./modules/live/live.module').then(m => m.LiveModule)},
  {path: 'plannings', loadChildren: () => import('./modules/plannings/plannings.module').then(m => m.PlanningsModule)},
  {path: 'code', component: LoginComponent},
  {path: 'administrateur', component: ConnexionTechnicienComponent},
  {path: 'employes', loadChildren: () => import('./modules/employes/employes.module').then(m => m.EmployesModule)},
  {path: 'plannings', loadChildren: () => import('./modules/plannings/plannings.module').then(m => m.PlanningsModule)},
  {path: 'messages', loadChildren: () => import('./modules/messages/messages.module').then(m => m.MessagesModule)},
  {path: 'parametres', loadChildren: () => import('./modules/parametre-globaux/parametre-globaux.module').then(m => m.ParametreGlobauxModule)},
  {path: 'rapports', loadChildren: () => import('./modules/rapports/rapports.module').then(m => m.RapportsModule)},

  {
    path: 'correction-pointage',
    loadChildren: () => import('./modules/correction-pointage/correction-pointage.module').then(m => m.CorrectionPointageModule)
  },
  {path: 'anomalie', loadChildren: () => import('./modules/anomalie/anomalie.module').then(m => m.AnomalieModule)},
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
