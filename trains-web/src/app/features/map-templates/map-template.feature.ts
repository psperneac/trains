import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { MapTemplateDataService } from './services/map-template-data.service';
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
  ],
  providers: [
    MapTemplateService,
    MapTemplateDataService,
  ],
  routes: [],
};
