import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {HomePageComponent} from './home-page/home-page.component';
import { AuthGuard } from '../features/auth/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/pages/home', canDeactivate: [], pathMatch: 'full' },
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard], canDeactivate: [] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule {}
