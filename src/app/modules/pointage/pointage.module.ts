import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PointageRoutingModule} from './pointage-routing.module';
import {FormsModule} from '@angular/forms';

import {TranslateModule} from "@ngx-translate/core";
import {ToastModule} from 'primeng/toast';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    CommonModule,
    PointageRoutingModule,
    FormsModule, TranslateModule, ToastModule
  ]
})
export class PointageModule { }
