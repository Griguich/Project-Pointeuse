import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ParametreGlobauxComponent} from './parametre-globaux.component';


const routes: Routes = [
  {path: '', component: ParametreGlobauxComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametreGlobauxRoutingModule { }
