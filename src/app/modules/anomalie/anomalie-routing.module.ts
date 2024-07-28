import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AnomalieComponent} from "./anomalie/anomalie.component";


const routes: Routes = [
  {path: '', component: AnomalieComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnomalieRoutingModule { }
