import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { PlacesResolver } from '../places/places.resolver';
import { PlaceConnectionFormComponent } from './components/place-connection-form/place-connection-form.component';
import { PlaceConnectionsPage } from './pages/place-connections.page';
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
  ],
  providers: [
    PlaceConnectionService,
  ],
  routes: [
    {
      path: '',
      component: PlaceConnectionsPage,
      canActivate: [],
      canDeactivate: [],
      resolve: [PlacesResolver] },
  ]
}
