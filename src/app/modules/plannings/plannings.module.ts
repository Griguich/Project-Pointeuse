import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {PlnanningRoutingModule} from './planning-routing.module';
import {User2LettrePipe} from 'src/app/shared/Pipes/user-2-lettre.pipe';
import {TempPlanifiesTimePipe} from 'src/app/shared/Pipes/temp-planifies-time.pipe';
import {TranslateModule} from '@ngx-translate/core';
import {PopoverModule} from 'ngx-smart-popover';
import {FormsModule} from '@angular/forms';
import {SharedModule} from 'src/app/shared/shared.module';
import {PlanningComponent} from "./planning/planning.component";
import {AddPointageFormComponent} from "./add-pointage-form/add-pointage-form.component";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {SharedLivePlanningModule} from "../shared-live-planning/shared-live-planning.module";
import {CalendarModule} from 'primeng/calendar';
import {DialogModule} from 'primeng/dialog';
import {InputSwitchModule} from 'primeng/inputswitch';
import {MessageModule} from 'primeng/message';


@NgModule({
  declarations: [
    PlanningComponent,
    AddPointageFormComponent,
    TempPlanifiesTimePipe,
    User2LettrePipe
  ],
  exports: [
    User2LettrePipe
  ],
  imports: [
    PlnanningRoutingModule,
    CommonModule,
    SharedLivePlanningModule,
    TableModule,
    TranslateModule,
    PopoverModule,
    CalendarModule,
    FormsModule,
    SharedModule,
    DialogModule,
    MessageModule,
    OverlayPanelModule,
    InputSwitchModule
  ]
})
export class PlanningsModule { }
