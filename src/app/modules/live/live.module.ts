import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveRoutingModule } from './live-routing.module';
import { LiveComponent } from './live/live.component';
import {ClockPageComponent} from "./clock-page/clock-page.component";
import {ListEmployeePageComponent} from "./list-employee-page/list-employee-page.component";
import {ToastModule} from "primeng/toast";
import {TranslateModule} from "@ngx-translate/core";
import {TableModule} from "primeng/table";
import {SharedLivePlanningModule} from "../shared-live-planning/shared-live-planning.module";
import {SharedModule} from "../../shared/shared.module";


@NgModule({
    declarations: [
        LiveComponent,
        ClockPageComponent,
        ListEmployeePageComponent
    ],
    imports: [
        CommonModule,
        LiveRoutingModule,
        SharedModule,
        SharedLivePlanningModule,
        TranslateModule,
        ToastModule,
        TableModule
    ]
})
export class LiveModule { }
