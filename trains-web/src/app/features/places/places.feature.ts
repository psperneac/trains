import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { resolvePlaceTypesFn } from '../place-types/services/place-type-data.service';
import { loadOnePlaceGuardFn, PlaceDataService } from './services/place-data.service';
import { PlaceService } from './services/place.service';
import { PlaceEffects, reducer as placeReducer } from './store';
import { PlacesPage } from './pages/places.page';
import { PlacesListComponent } from './components/places-list.component';
import { PlaceFormComponent } from './components/place-form.component';
import { PlaceEditPage } from './pages/place-edit.page';
import { PlaceCreatePage } from './pages/place-create.page';
import {FeaturePart} from "../../utils/feature-part";

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
    PlaceDataService,
  ],
  routes: [
    { path: '', component: PlacesPage, canActivate: [], canDeactivate: []},
    { path: 'create', component: PlaceCreatePage, canActivate: [], canDeactivate: []},
    { path: ':id', component: PlaceEditPage, canActivate: [loadOnePlaceGuardFn], canDeactivate: [],
      resolve: {
        placeTypes: resolvePlaceTypesFn
      }
    },
  ]
}
