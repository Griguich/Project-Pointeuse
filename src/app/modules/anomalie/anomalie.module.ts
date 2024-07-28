import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorModule} from 'primeng/editor';
import {TableModule} from 'primeng/table';

import {AnomalieRoutingModule} from './anomalie-routing.module';
import {AnomalieComponent} from "./anomalie/anomalie.component";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {PopoverModule} from "ngx-smart-popover";
import { SharedModule } from 'src/app/shared/shared.module';
import {CheckboxModule} from 'primeng/checkbox';
import {MessageModule} from 'primeng/message';
import {DialogModule} from 'primeng/dialog';


@NgModule({
  declarations: [
    AnomalieComponent,
  ],
  exports: [],
  imports: [
    FormsModule,
    CommonModule,
    AnomalieRoutingModule,
    EditorModule,
    TableModule,
    CheckboxModule,
    SharedModule,
    MessageModule,
    TranslateModule,
    DialogModule,
    PopoverModule

  ]
})
export class AnomalieModule {
}
