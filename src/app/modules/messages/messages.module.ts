import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorModule} from 'primeng/editor';
import {TableModule} from 'primeng/table';
import {MessagesRoutingModule} from './messages-routing.module';
import {MessagesFormComponent} from './messages/messages-form.component';
import {MessagesComponent} from "./messages.component";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {DynamicDialogModule} from "primeng/dynamicdialog";
import {ToastModule} from "primeng/toast";
import {HistoriquesComponent} from "./historiques/historiques.component";
import {SharedModule} from "../../shared/shared.module";
import {MessageDisplayComponent} from './historiques/message-display/message-display.component';
import {ButtonModule} from 'primeng/button';
import {CheckboxModule} from 'primeng/checkbox';

@NgModule({
  declarations: [
    MessagesComponent,
    MessagesFormComponent,
    HistoriquesComponent,
    MessageDisplayComponent
  ],
  exports: [],
  imports: [
    FormsModule,
    CommonModule,
    MessagesRoutingModule,
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
export class MessagesModule {
}
