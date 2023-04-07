import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlaceService } from './services/place.service';
import { PlaceEffects, reducer as placeReducer } from './store';
import { PlacesPage } from './pages/places.page';
import { PlacesListComponent } from './components/places-list.component';
import { PlaceFormComponent } from './components/place-form.component';
import { PlaceEditPage } from './pages/place-edit.page';
import { LoadOnePlaceGuard } from './load-one-place.guard';
import { PlaceCreatePage } from './pages/place-create.page';
import { OnePlaceResolver } from './one-place.resolver';
import {FeaturePart} from "../../utils/feature-part";
import { PlaceTypesResolver } from '../place-types/place-types.resolver';

export const PLACES_FEATURE: FeaturePart = {
  imports: [
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
    LoadOnePlaceGuard,
    OnePlaceResolver,
  ],
  routes: [
    { path: '', component: PlacesPage, canActivate: [], canDeactivate: []},
    { path: 'create', component: PlaceCreatePage, canActivate: [], canDeactivate: []},
    { path: ':id', component: PlaceEditPage, canActivate: [LoadOnePlaceGuard], canDeactivate: [], 
      resolve: [PlaceTypesResolver]
    },
  ]
}
