import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListRapportsComponent} from './components/list-rapports/list-rapports.component';
import {AffichageRapportsComponent} from './components/affichage-rapports/affichage-rapports.component';


const routes: Routes = [
  {
    path: '', component: ListRapportsComponent,
  },
  {
    path: 'display/:codeName', component: AffichageRapportsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RapportsRoutingModule {
}
