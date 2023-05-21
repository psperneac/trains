import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import { isLoggedInFn } from '../auth/services/auth-data.service';
import {HomePageComponent} from './pages/home-page/home-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent, canActivate: [isLoggedInFn], canDeactivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
