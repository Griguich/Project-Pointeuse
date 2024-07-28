import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {LoginComponent} from './login/login.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MenuComponent} from './modules/menu/menu.component';
import {HeaderComponent} from './modules/header/header.component';
import {TableModule} from 'primeng/table';
import {SharedModule} from './shared/shared.module';
import {ConnexionTechnicienComponent} from './connexion-technicien/connexion-technicien.component';
import {ConfigAssetLoaderService} from './shared/services/config-asset-loader.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {StoreModule} from '@ngrx/store';
import {reducers} from './shared/alarme';
import {PointeuseRoutingService} from './shared/services/PointeuseRoutingService';
import {TokenInterceptorService} from './shared/services/token-interceptor.service';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {MomentModule} from 'angular2-moment';
import { DatePipe } from '@angular/common';
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from '../environments/environment';
import {InjectableRxStompConfig, RxStompService, rxStompServiceFactory} from '@stomp/ng2-stompjs';
import {PathService} from './shared/services/path.service';
import {rhisRxStompConfig} from './broker/rhis-rx-stomp.config';
import {AuthInterceptor} from './shared/services/auth.interceptor';
import {FieldsetModule} from 'primeng/fieldset';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ProgressBarModule} from 'primeng/progressbar';
import {SliderModule} from 'primeng/slider';
import {MenuItemIdPipe} from "./modules/menu/menu-item-id.pipe";
import {UserPermissionPipe} from "./shared/Pipes/user-permission.pipe";

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    HeaderComponent,
    ConnexionTechnicienComponent,
    MenuItemIdPipe,
  ],
    imports: [
        StoreModule.forRoot(reducers),
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        ButtonModule,
        InputTextModule,
        FormsModule,
        BrowserAnimationsModule,
        TableModule,
        SharedModule,
        NgIdleKeepaliveModule.forRoot(),
        MomentModule,
        ProgressBarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        FormsModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
        OverlayPanelModule,
        FieldsetModule,
        SliderModule,
    ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigAssetLoaderService) => () => configService.loadConfigurations(),
      deps: [ConfigAssetLoaderService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: InjectableRxStompConfig,
      useFactory: rhisRxStompConfig,
      deps: [PathService]
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig],
    },

    MessageService,
    PointeuseRoutingService,
    ConfirmationService,
    DatePipe,
    UserPermissionPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
