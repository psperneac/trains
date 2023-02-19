import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AdminAuthGuard } from './features/auth/guards/admin-auth.guard';
import { PlaceTypesPage } from "./features/place-types/pages/place-types.page";
import {PLACES_FEATURE} from "./features/places/places.feature";

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
    canActivate: [AdminAuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'place-types',
    children: [
      { path: '', component: PlaceTypesPage, canActivate: [], canDeactivate: [] }
    ],
    canActivate: [AdminAuthGuard],
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
  imports: [RouterModule.forRoot(ROUTES, { useHash: false, onSameUrlNavigation: 'reload', initialNavigation: 'enabled', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
