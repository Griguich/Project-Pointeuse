import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorrectionPointageComponent } from './correction-pointage.component';
import { CorrectionPointageRoutingModule } from './correction-pointage-routing.module';
import {TranslateModule} from "@ngx-translate/core";
import {TableModule} from 'primeng/table';
import {MessageModule} from 'primeng/message';



@NgModule({
  declarations: [
    CorrectionPointageComponent
  ],
  imports: [
    CorrectionPointageRoutingModule,
    CommonModule,
    TranslateModule,
    TableModule,
    MessageModule
  ]
})
export class CorrectionPointageModule { }
