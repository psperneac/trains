import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { placesResolverFn } from '../places/services/place-data.service';
import { PlaceConnectionFormComponent } from './components/place-connection-form/place-connection-form.component';
import { PlaceConnectionEditPage } from './pages/place-connection-edit.page';
import { PlaceConnectionsPage } from './pages/place-connections.page';
import { MapPlaceConnectionDataService } from './services/map-place-connection-data.service';
import { MapPlaceConnectionService } from './services/map-place-connection.service';
import {
  createPlaceConnectionGuardFn, loadOnePlaceConnectionGuardFn,
  PlaceConnectionDataService,
  placeConnectionsResolversFn
} from './services/place-connection-data.service';
import { MapPlaceConnectionEffects, mapPlaceConnectionReducer } from './store';
import { placeConnectionReducer} from './store';
import { PlaceConnectionsListComponent } from './components/place-connections-list/place-connections-list.component';
import { PlaceConnectionService } from './services/place-connection.service';
import { PlaceConnectionEffects } from './store';

export const PLACE_CONNECTIONS_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('place-connections', placeConnectionReducer),
    StoreModule.forFeature('map-place-connections', mapPlaceConnectionReducer),
    EffectsModule.forFeature([PlaceConnectionEffects, MapPlaceConnectionEffects])
  ],
  declarations: [
    PlaceConnectionsPage,
    PlaceConnectionsListComponent,
    PlaceConnectionFormComponent,
    PlaceConnectionEditPage,
  ],
  providers: [
    PlaceConnectionService,
    PlaceConnectionDataService,
    MapPlaceConnectionService,
    MapPlaceConnectionDataService,
  ],
  routes: [
    {
      path: '',
      component: PlaceConnectionsPage,
      canActivate: [],
      canDeactivate: [],
      resolve: {
        places: placesResolverFn,
        placeConnections: placeConnectionsResolversFn,
      }
    },
    {
      path: 'create',
      component: PlaceConnectionEditPage,
      canActivate: [createPlaceConnectionGuardFn],
      canDeactivate: [],
      resolve: {
        places: placesResolverFn,
      }
    },
    {
      path: ':id',
      component: PlaceConnectionEditPage,
      canActivate: [loadOnePlaceConnectionGuardFn],
      canDeactivate: [],
      resolve: {
        places: placesResolverFn,
        placeConnections: placeConnectionsResolversFn,
      }
    },
  ]
}
