import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { placeConnectionsResolversFn } from '../place-connections/services/place-connection-data.service';
import { MapTemplateFormComponent } from './components/map-template-form.component';
import { MapTemplateListComponent } from './components/map-template-list.component';
import { MapTemplateEditPage } from './pages/map-template-edit.page';
import {
  createMapTemplateGuardFn, loadOneMapTemplateGuardFn,
  MapTemplateDataService,
  mapTemplatesResolveFn
} from './services/map-template-data.service';
import { MapTemplateService } from './services/map-template.service';
import { reducer as mapTemplatesReducer } from './store/map-template.store';
import { EffectsModule } from '@ngrx/effects';
import { MapTemplateEffects } from './store/map-template.store';
import { MapTemplatesPage } from './pages/map-templates.page';
import { mapPlacesResolveFn } from '../places/services/map-place-data.service';
import {
  mapPlaceConnectionsResolveFn
} from '../place-connections/services/map-place-connection-data.service';
import { placesResolverFn } from '../places/services/place-data.service';

export const MAP_TEMPLATES_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('map-templates', mapTemplatesReducer),
    EffectsModule.forFeature([MapTemplateEffects]),
  ],
  declarations: [
    MapTemplatesPage,
    MapTemplateListComponent,
    MapTemplateEditPage,
    MapTemplateFormComponent,
  ],
  providers: [
    MapTemplateService,
    MapTemplateDataService,
  ],
  routes: [
    {
      path: '',
      component: MapTemplatesPage,
      canActivate: [],
      canDeactivate: [],
      resolve: {
        maps: mapTemplatesResolveFn,
        places: placesResolverFn,
        mapPlaces: mapPlacesResolveFn,
      }
    },
    {
      path: 'create',
      component: MapTemplateEditPage,
      canActivate: [createMapTemplateGuardFn],
      canDeactivate: [],
      resolve: {
        places: placesResolverFn,
        mapPlaces: mapPlacesResolveFn,
        placeConnections: placeConnectionsResolversFn,
        mapPlaceConnections: mapPlaceConnectionsResolveFn,
      }
    },
    {
      path: ':id',
      component: MapTemplateEditPage,
      canActivate: [loadOneMapTemplateGuardFn],
      canDeactivate: [],
      resolve: {
        places: placesResolverFn,
        mapPlaces: mapPlacesResolveFn,
        placeConnections: placeConnectionsResolversFn,
        mapPlaceConnections: mapPlaceConnectionsResolveFn,
      }
    }
  ],
};
