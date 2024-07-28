import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EmployesComponent} from "./employes.component";


const routes: Routes = [
  {path: '', component: EmployesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployesRoutingModule { }
