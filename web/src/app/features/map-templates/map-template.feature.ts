import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { MapTemplateFormComponent } from './components/map-template-form.component';
import { MapTemplateListComponent } from './components/map-template-list.component';
import { MapTemplateEditPage } from './pages/map-template-edit.page';
import {
  createMapTemplateGuardFn, loadOneMapTemplateGuardFn,
  MapTemplateDataService,
  mapTemplatesResolveFn
} from './services/map-template-data.service';
import { MapTemplateService } from './services/map-template.service';
import { reducer as mapTemplatesReducer } from './store/map-template.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MapTemplateEffects } from './store';
import { MapTemplatesPage } from './pages/map-templates.page';

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
        maps: mapTemplatesResolveFn
      }
    },
    {
      path: 'create',
      component: MapTemplateEditPage,
      canActivate: [createMapTemplateGuardFn],
      canDeactivate: []
    },
    {
      path: ':id',
      component: MapTemplateEditPage,
      canActivate: [loadOneMapTemplateGuardFn],
      canDeactivate: []
    }
  ],
};
