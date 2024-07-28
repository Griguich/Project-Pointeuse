import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RapportsRoutingModule} from './rapports-routing.module';
import {ListRapportsComponent} from './components/list-rapports/list-rapports.component';
import {TranslateModule} from '@ngx-translate/core';
import {SharedModule} from '../../shared/shared.module';
import {PopupRapportsComponent} from './components/popup-rapports/popup-rapports.component';
import {AffichageRapportsComponent} from './components/affichage-rapports/affichage-rapports.component';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {PdfViewerModule} from 'ng2-pdf-viewer';


@NgModule({
  declarations: [ListRapportsComponent, PopupRapportsComponent, AffichageRapportsComponent],
  exports: [
    AffichageRapportsComponent,
    ListRapportsComponent
  ],
  imports: [
    CommonModule,
    RapportsRoutingModule,
    TranslateModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    PdfViewerModule
  ]
})
export class RapportsModule {
}
