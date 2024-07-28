import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HoursDivComponent} from './hours-div/hours-div.component';
import {SharedModule} from '../../shared/shared.module';



@NgModule({
  declarations: [HoursDivComponent],
  imports: [CommonModule,
            SharedModule],
  exports: [
    HoursDivComponent
  ]
})
export class SharedLivePlanningModule {
}
