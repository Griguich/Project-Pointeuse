import {NgModule} from '@angular/core';
import {CheckboxModule} from 'primeng/checkbox';
import {TableModule} from 'primeng/table';
import {CommonModule} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {AccordionModule} from 'primeng/accordion';
import {DialogModule} from 'primeng/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ListboxModule} from 'primeng/listbox';
import {ToastModule} from 'primeng/toast';
import {PanelMenuModule} from 'primeng/panelmenu';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {SidebarModule} from 'primeng/sidebar';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {BlockUIModule} from 'primeng/blockui';
import {PopUpComponent} from './component/pop-up/pop-up.component';
import {HeightScrollableSectionDirective} from './directive/height-scrollable-section.directive';
import {TwoDigitDecimaNumberDirective} from './directive/two-digit-decima-number.directive';
import {IntegerNumbersDirective} from './directive/integer-numbers.directive';
import {ClickOutsideDirective} from './directive/click-outside.directive';
import {StyleFormDirective} from './directive/style-form.directive';
import {MemoizePipe} from './Pipes/memoize.pipe';
import {HourFormatDirective} from './directive/hour-format.directive';
import {NoDoubleClickDirective} from './directive/no-double-click.directive';
import {
  ServiceStatusComponentComponent
} from './serviceChecker/service-status-component/service-status-component.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {CalendarModule} from 'primeng/calendar';
import {MenuModule} from 'primeng/menu';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import { UserPermissionPipe } from './Pipes/user-permission.pipe';

@NgModule({
  imports: [
    MenuModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    CalendarModule,
    CommonModule,
    AccordionModule,
    DialogModule,
    TranslateModule,
    RadioButtonModule,
    PanelMenuModule,
    TieredMenuModule,
    SidebarModule,
    ProgressSpinnerModule,
    BlockUIModule,
    ProgressBarModule,

  ],
  declarations: [
    PopUpComponent,
    MemoizePipe,
    ClickOutsideDirective,
    ClickOutsideDirective,
    HeightScrollableSectionDirective,
    TwoDigitDecimaNumberDirective,
    StyleFormDirective,
    IntegerNumbersDirective,
    HourFormatDirective,
    NoDoubleClickDirective,
    ServiceStatusComponentComponent,
    UserPermissionPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    CalendarModule,
    TableModule,
    DropdownModule,
    AccordionModule,
    DialogModule,
    TranslateModule,
    ProgressSpinnerModule,
    BlockUIModule,
    ListboxModule,
    ConfirmDialogModule,
    ToastModule,
    RadioButtonModule,
    MenuModule,
    PanelMenuModule,
    TieredMenuModule,
    SidebarModule,
    PopUpComponent,
    HeightScrollableSectionDirective,
    TwoDigitDecimaNumberDirective,
    IntegerNumbersDirective,
    HourFormatDirective,
    MemoizePipe,
    ClickOutsideDirective,
    StyleFormDirective,
    NoDoubleClickDirective,
    UserPermissionPipe
  ]
})
export class SharedModule {
}
