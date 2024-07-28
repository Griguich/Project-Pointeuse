import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {EmployesComponent} from './employes.component';
import {EmployesRoutingModule} from './employes-routing.module';
import {TranslateModule} from "@ngx-translate/core";
import {SharedModule} from "../../shared/shared.module";
import {CheckboxModule} from 'primeng/checkbox';
import {MessageModule} from 'primeng/message';

@NgModule({
  declarations: [
    EmployesComponent
  ],
  exports: [],
  imports: [
    EmployesRoutingModule,
    CommonModule,
    TableModule,
    CheckboxModule,
    MessageModule,
    SharedModule,
    TranslateModule
  ]
})
export class EmployesModule {
}
