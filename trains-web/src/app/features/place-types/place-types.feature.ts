import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { reducer as placeTypesReducer } from './store/place-type.reducer';

export const PLACE_TYPES_FEATURE: FeaturePart = {
  declarations: [],
  imports: [
    StoreModule.forFeature('placeTypes', placeTypesReducer)
  ],
  providers: [],
  routes: []
};
