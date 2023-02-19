import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { PlaceTypesListComponent } from "./features/place-types/components/place-types-list.component";
import { LoadOnePlaceTypeGuard } from "./features/place-types/load-one-place-type.guard";
import { PlaceTypesPage } from "./features/place-types/pages/place-types.page";
import { PlaceTypeService } from "./features/place-types/services/place-type.service";
import { PlaceTypeEffects } from "./features/place-types/store/place-type.effects";
import { reducer as placeTypesReducer } from "./features/place-types/store/place-type.reducer";
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
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { AuthModule } from './features/auth/auth.module';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { SharedModule } from './shared.module';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { MomentModule } from 'ngx-moment';
import { PLACES_FEATURE } from './features/places/places.feature';
import { PlaceTypeFormComponent } from './features/place-types/components/place-type-form.component';
import { PlaceTypeEditPage } from './features/place-types/pages/place-type-edit.page';
import { CreateOnePlaceTypeGuard } from './features/place-types/create-one-place-type.guard';

export function createTranslationLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/locales/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    ...PLACES_FEATURE.declarations,

    // PLACE TYPES
    PlaceTypesPage,
    PlaceTypeEditPage,
    PlaceTypesListComponent,
    PlaceTypeFormComponent,
  ],
  imports: [
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

    HelpersModule,
    ServicesModule,
    LeafletModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,

    AuthModule,

    ...PLACES_FEATURE.imports,

    // PLACE TYPES
    StoreModule.forFeature('placeTypes', placeTypesReducer),
    EffectsModule.forFeature([PlaceTypeEffects])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AlertService,

    ...PLACES_FEATURE.providers,

    // PLACE TYPES
    PlaceTypeService,
    LoadOnePlaceTypeGuard,
    CreateOnePlaceTypeGuard
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
