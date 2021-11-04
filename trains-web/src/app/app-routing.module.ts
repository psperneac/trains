import { NgModule } from '@angular/core';
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { AdminAuthGuard } from './features/auth/guards/admin-auth.guard';

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
    path: 'places',
    loadChildren: () => import('./features/places/places.module').then(m => m.PlacesModule),
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
  imports: [RouterModule.forRoot(ROUTES, { useHash: true, onSameUrlNavigation: 'reload', initialNavigation: 'enabled', relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule {}
