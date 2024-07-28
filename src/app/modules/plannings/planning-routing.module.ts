import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlanningComponent} from "./planning/planning.component";


const routes: Routes = [
  {path: '', component: PlanningComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlnanningRoutingModule { }
