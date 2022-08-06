import { PlaceTypeModule } from './../../../trains-server/src/app/api/place-types/place-type.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { reducers, metaReducers } from './store';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from './components/components.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HelpersModule } from './helpers/helpers.module';
import { ServicesModule } from './services/services.module';
import { AlertService } from './services/alert.service';
import { AppRoutingModule } from './app-routing.module';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AuthModule } from './features/auth/auth.module';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { SharedModule } from './shared.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { PlacesModule } from './features/places/places.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'ngx-moment';

export function createTranslationLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/locales/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    PlaceTypeModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslationLoader,
        deps: [HttpClient],
      },
    }),

    // store
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([]),
    // Connects RouterModule with StoreModule, uses MinimalRouterStateSerializer by default
    StoreRouterConnectingModule.forRoot(),

    // store debugging
    StoreDevtoolsModule.instrument({
      maxAge: 50,
      logOnly: environment.production,
    }),

    // app modules
    SharedModule,

    ComponentsModule,
    PlacesModule,

    HelpersModule,
    ServicesModule,
    LeafletModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,

    AuthModule,
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AlertService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
