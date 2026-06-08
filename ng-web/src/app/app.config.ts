import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { authReducer } from './store/auth/auth.state';
import { AuthEffects } from './store/auth/auth.effects';
import { gameReducer } from './store/game/game.state';
import { GameEffects } from './store/game/game.effects';
import { playerReducer } from './store/player/player.state';
import { PlayerEffects } from './store/player/player.effects';
import { placeTypeReducer } from './store/place-type/place-type.state';
import { PlaceTypeEffects } from './store/place-type/place-type.effects';
import { vehicleTypeReducer } from './store/vehicle-type/vehicle-type.state';
import { VehicleTypeEffects } from './store/vehicle-type/vehicle-type.effects';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { HomeComponent } from './pages/home/home.component';
import { PlaceTypesComponent } from './pages/game-admin/place-types.component';
import { VehicleTypesComponent } from './pages/game-admin/vehicle-types.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { gameResolver } from './resolvers/game.resolver';
import { placeTypeResolver } from './resolvers/place-type.resolver';

export const appRoutes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  {
    path: '',
    canActivate: [authGuard],
    resolve: { games: gameResolver },
    children: [
      { path: '', component: HomeComponent },
      { path: 'game-admin/place-types', component: PlaceTypesComponent, resolve: { placeTypes: placeTypeResolver } },
      { path: 'game-admin/vehicle-types', component: VehicleTypesComponent },
    ],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideStore({
      auth: authReducer,
      game: gameReducer,
      player: playerReducer,
      placeType: placeTypeReducer,
      vehicleType: vehicleTypeReducer,
    }),
    provideEffects(AuthEffects, GameEffects, PlayerEffects, PlaceTypeEffects, VehicleTypeEffects),
    provideStoreDevtools(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
  ]
};
