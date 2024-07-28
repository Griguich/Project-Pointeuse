import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorModule} from 'primeng/editor';
import {TableModule} from 'primeng/table';
import {ParametreGlobauxRoutingModule} from './parametre-globaux-routing.module';
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {ToastModule} from "primeng/toast";
import {SharedModule} from "../../shared/shared.module";
import {ParametreGlobauxComponent} from "./parametre-globaux.component";
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';

@NgModule({
  declarations: [
    ParametreGlobauxComponent,
  ],
  exports: [],
  imports: [
    FormsModule,
    CommonModule,
    ParametreGlobauxRoutingModule,
    EditorModule,
    TableModule,
    CheckboxModule,
    SharedModule,
    TranslateModule,
    CommonModule,
    DynamicDialogModule,
    ToastModule,
    TableModule,
    ButtonModule
  ]
})
export class ParametreGlobauxModule {
}
