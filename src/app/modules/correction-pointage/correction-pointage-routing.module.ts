import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CorrectionPointageComponent } from './correction-pointage.component';


const routes: Routes = [
  {path: '', component: CorrectionPointageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorrectionPointageRoutingModule { }
