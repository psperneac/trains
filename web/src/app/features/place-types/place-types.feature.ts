import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { FeaturePart } from "src/app/utils/feature-part";
import {
  canActivateCreatePlaceTypeFn,
  canActivateLoadOnePlaceTypeFn,
  PlaceTypeDataService, resolvePlaceTypesFn
} from './services/place-type-data.service';
import { PlaceTypeEffects } from "./store/place-type.effects";
import { reducer as placeTypesReducer } from "./store/place-type.reducer";
import { PlaceTypeFormComponent } from "./components/place-type-form.component";
import { PlaceTypesListComponent } from "./components/place-types-list.component";
import { PlaceTypeEditPage } from "./pages/place-type-edit.page";
import { PlaceTypesPage } from "./pages/place-types.page";
import { PlaceTypeService } from "./services/place-type.service";

export const PLACE_TYPES_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('placeTypes', placeTypesReducer),
    EffectsModule.forFeature([PlaceTypeEffects])
  ],
  declarations: [
    PlaceTypesPage,
    PlaceTypeEditPage,
    PlaceTypesListComponent,
    PlaceTypeFormComponent,
  ],
  providers: [
    PlaceTypeService,
    PlaceTypeDataService
  ],
  routes: [
    {
      path: '',
      component: PlaceTypesPage,
      canActivate: [],
      canDeactivate: [],
      resolve: {
        placeTypes: resolvePlaceTypesFn
      }
    },
    {
      path: 'create',
      component: PlaceTypeEditPage,
      canActivate: [canActivateCreatePlaceTypeFn],
      canDeactivate: []
    },
    {
      path: ':id',
      component: PlaceTypeEditPage,
      canActivate: [canActivateLoadOnePlaceTypeFn],
      canDeactivate: []
    }
  ]
}
