import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { resolvePlaceTypesFn } from '../place-types/services/place-type-data.service';
import { MapPlaceDataService } from './services/map-place-data.service';
import { MapPlaceInstanceDataService } from './services/map-place-instance-data.service';
import { MapPlaceInstanceService } from './services/map-place-instance.service';
import { MapPlaceService } from './services/map-place.service';
import { createPlaceGuardFn, loadOnePlaceGuardFn, PlaceDataService, placesResolverFn } from './services/place-data.service';
import { PlaceService } from './services/place.service';
import { PlaceEffects, reducer as placeReducer } from './store';
import { PlacesPage } from './pages/places.page';
import { PlacesListComponent } from './components/places-list.component';
import { PlaceFormComponent } from './components/place-form.component';
import { PlaceEditPage } from './pages/place-edit.page';
import { PlaceCreatePage } from './pages/place-create.page';
import {FeaturePart} from "../../utils/feature-part";
import { MapPlaceInstanceEffects, mapPlaceInstanceReducer } from './store/map-place-instance.store';
import { MapPlaceEffects, reducer as mapPlacesReducer } from './store/map-place.store';

export const PLACES_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('places', placeReducer),
    StoreModule.forFeature('map-places', mapPlacesReducer),
    StoreModule.forFeature('map-place-instances', mapPlaceInstanceReducer),
    EffectsModule.forFeature([PlaceEffects, MapPlaceEffects, MapPlaceInstanceEffects])],
  declarations: [PlacesPage, PlacesListComponent, PlaceFormComponent, PlaceEditPage, PlaceCreatePage],
  providers: [
    PlaceService,
    PlaceDataService,
    MapPlaceService,
    MapPlaceDataService,
    MapPlaceInstanceService,
    MapPlaceInstanceDataService,
  ],
  routes: [
    {
      path: '',
      component: PlacesPage,
      canActivate: [],
      canDeactivate: [],
      resolve: { places: placesResolverFn },
    },
    {
      path: 'create',
      component: PlaceCreatePage,
      canActivate: [createPlaceGuardFn],
      canDeactivate: [],
      resolve: {
        placeTypes: resolvePlaceTypesFn,
      },
    },
    {
      path: ':id',
      component: PlaceEditPage,
      canActivate: [loadOnePlaceGuardFn],
      canDeactivate: [],
      resolve: {
        placeTypes: resolvePlaceTypesFn,
      },
    },
  ],
};
