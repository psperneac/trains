import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {AuthGuard} from '../auth/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomePageComponent, canActivate: [AuthGuard], canDeactivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
