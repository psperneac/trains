import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PlacesPage } from './pages/places.page';
import { PlaceEditPage } from './pages/place-edit.page';
import { LoadOnePlaceGuard } from './load-one-place.guard';
import {PlaceCreatePage} from './pages/place-create.page';

const routes: Routes = [
  { path: 'home', component: PlacesPage, canActivate: [], canDeactivate: []},
  { path: 'home/create', component: PlaceCreatePage, canActivate: [], canDeactivate: []},
  { path: 'home/:id', component: PlaceEditPage, canActivate: [LoadOnePlaceGuard], canDeactivate: []},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacesRoutingModule {}
