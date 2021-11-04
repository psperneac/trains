import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared.module';
import { RouterModule, Routes } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlaceService } from './services/place.service';
import { PlaceEffects, reducer as placeReducer } from './store';
import { PlacesPage } from './pages/places.page';
import { PlacesListComponent } from './components/places-list.component';
import { PlaceFormComponent } from './components/place-form.component';
import { PlaceEditPage } from './pages/place-edit.page';
import { ReactiveFormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LoadOnePlaceGuard } from './load-one-place.guard';
import { ComponentsModule } from '../../components/components.module';
import { PlacesRoutingModule } from './places-routing.module';
import {PlaceCreatePage} from './pages/place-create.page';

@NgModule({
  imports: [
    PlacesRoutingModule,

    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    // LeafletModule,
    ComponentsModule,

    StoreModule.forFeature('places', placeReducer),
    EffectsModule.forFeature([PlaceEffects]),
  ],
  declarations: [
    PlacesPage,
    PlacesListComponent,
    PlaceFormComponent,
    PlaceEditPage,
    PlaceCreatePage,
  ],
  providers: [
    PlaceService,
    LoadOnePlaceGuard
  ]
})
export class PlacesModule { }
