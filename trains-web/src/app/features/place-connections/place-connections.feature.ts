import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { placesResolverFn } from '../places/services/place-data.service';
import { PlaceConnectionFormComponent } from './components/place-connection-form/place-connection-form.component';
import { PlaceConnectionEditPage } from './pages/place-connection-edit.page';
import { PlaceConnectionsPage } from './pages/place-connections.page';
import {
  createPlaceConnectionGuardFn, loadOnePlaceConnectionGuardFn,
  PlaceConnectionDataService,
  placeConnectionsResolversFn
} from './services/place-connection-data.service';
import { reducer as placeConnectorsReducer} from './store/place-connection.reducer';
import { PlaceConnectionsListComponent } from './components/place-connections-list/place-connections-list.component';
import { PlaceConnectionService } from './services/place-connection.service';
import { PlaceConnectionEffects } from './store';

export const PLACE_CONNECTIONS_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('place-connections', placeConnectorsReducer),
    EffectsModule.forFeature([PlaceConnectionEffects])
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
