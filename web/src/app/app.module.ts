import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxLeafletFullscreenModule } from '@runette/ngx-leaflet-fullscreen';
import { NgxLoadingControlModule } from '@runette/ngx-leaflet-loading';
import { NgxLeafletLocateModule } from '@runette/ngx-leaflet-locate';

import { AppComponent } from './app.component';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmDialog } from './components/confirm-dialog/confirm.dialog';
import { CustomMapComponent } from './components/custom-map/custom-map.component';
import { SelectPlaceConnectionComponent } from './components/select-place-connection/select-place-connection.component';
import { GAME_FEATURE } from './features/game/game.feature';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { PLACE_CONNECTIONS_FEATURE } from './features/place-connections/place-connections.feature';
import { VEHICLES_FEATURE } from './features/vehicles/vehicles.feature';
import { reducers, metaReducers } from './store';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';
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
import { PLACE_TYPES_FEATURE } from './features/place-types/place-types.feature';
import { VEHICLE_TYPES_FEATURE } from './features/vehicle-types/vehicle-types.feature';
import { PLAYERS_FEATURE } from './features/players/players.feature';
import { MAP_TEMPLATES_FEATURE } from './features/map-templates/map-template.feature';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { SelectPlaceComponent } from './components/select-place/select-place.component';

export function createTranslationLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/locales/', '.json');
}

/*

map_place_connections
map_places
maps
place_connection_instances
place_connections
place_instance_job_offers
place_instance_jobs
place_instances
places
players
posts
translations
users
vehicle_instance_jobs
vehicle_instances
vehicles

*/

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    CustomMapComponent,
    ConfirmDialog,
    HomePageComponent,
    SelectPlaceComponent,
    SelectPlaceConnectionComponent,

    ...PLACES_FEATURE.declarations,
    ...PLACE_TYPES_FEATURE.declarations,
    ...VEHICLE_TYPES_FEATURE.declarations,
    ...VEHICLES_FEATURE.declarations,
    ...PLACE_CONNECTIONS_FEATURE.declarations,
    ...PLAYERS_FEATURE.declarations,
    ...MAP_TEMPLATES_FEATURE.declarations,
    ...GAME_FEATURE.declarations,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // FormsModule,
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
      connectInZone: true,
    }),

    // app modules
    SharedModule,

    HelpersModule,
    ServicesModule,
    LeafletModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,

    LeafletModule,
    NgxLoadingControlModule,
    NgxLeafletLocateModule,
    NgxLeafletFullscreenModule,

    AuthModule,

    ...PLACES_FEATURE.imports,
    ...PLACE_TYPES_FEATURE.imports,
    ...VEHICLE_TYPES_FEATURE.imports,
    ...VEHICLES_FEATURE.imports,
    ...PLACE_CONNECTIONS_FEATURE.imports,
    ...PLAYERS_FEATURE.imports,
    ...MAP_TEMPLATES_FEATURE.imports,
    ...GAME_FEATURE.imports,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AlertService,

    ...PLACES_FEATURE.providers,
    ...PLACE_TYPES_FEATURE.providers,
    ...VEHICLE_TYPES_FEATURE.providers,
    ...VEHICLES_FEATURE.providers,
    ...PLACE_CONNECTIONS_FEATURE.providers,
    ...PLAYERS_FEATURE.providers,
    ...MAP_TEMPLATES_FEATURE.providers,
    ...GAME_FEATURE.providers,

    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {
      subscriptSizing: 'dynamic',
      appearance: 'outline',
    }},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
