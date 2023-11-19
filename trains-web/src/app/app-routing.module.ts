import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { isAdminFn } from './features/auth/services/auth-data.service';
import { PLACE_CONNECTIONS_FEATURE } from './features/place-connections/place-connections.feature';
import {PLACES_FEATURE} from "./features/places/places.feature";
import { PLACE_TYPES_FEATURE } from './features/place-types/place-types.feature';
import { VEHICLE_TYPES_FEATURE } from './features/vehicle-types/vehicle-types.feature';
import { VEHICLES_FEATURE } from './features/vehicles/vehicles.feature';
import { PLAYERS_FEATURE } from './features/players/players.feature';

// - auth guard should go here as they will be evaluated before the guards in the modules
//   which load data and implement app logic
// - consequently, admin modules and user modules should be completely separate

const ROUTES: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./components/components.module').then(m => m.ComponentsModule),
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'places',
    children: [...(PLACES_FEATURE.routes ?? [])],
    canActivate: [isAdminFn],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'place-types',
    children: [...(PLACE_TYPES_FEATURE.routes ?? [])],
    canActivate: [isAdminFn],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'vehicle-types',
    children: [...(VEHICLE_TYPES_FEATURE.routes ?? [])],
    canActivate: [isAdminFn],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'vehicles',
    children: [...(VEHICLES_FEATURE.routes ?? [])],
    canActivate: [isAdminFn],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'place-connections',
    children: [...(PLACE_CONNECTIONS_FEATURE.routes ?? [])],
    canActivate: [isAdminFn],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'players',
    children: [...(PLAYERS_FEATURE.routes ?? [])],
    canActivate: [isAdminFn],
    runGuardsAndResolvers: 'always'
  },
  {
    path: '**',
    redirectTo: '/auth/login',
    pathMatch: 'full',
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(ROUTES, {
    useHash: false,
    onSameUrlNavigation: 'reload',
    initialNavigation: 'enabledNonBlocking'
  })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
