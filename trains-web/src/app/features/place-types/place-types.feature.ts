import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { FeaturePart } from "src/app/utils/feature-part";
import { PlaceTypeEffects } from "./store/place-type.effects";
import { reducer as placeTypesReducer } from "./store/place-type.reducer";
import { PlaceTypeFormComponent } from "./components/place-type-form.component";
import { PlaceTypesListComponent } from "./components/place-types-list.component";
import { PlaceTypeEditPage } from "./pages/place-type-edit.page";
import { PlaceTypesPage } from "./pages/place-types.page";
import { CreateOnePlaceTypeGuard } from "./create-one-place-type.guard";
import { LoadOnePlaceTypeGuard } from "./load-one-place-type.guard";
import { PlaceTypeService } from "./services/place-type.service";
import { PlaceTypesResolver } from "./place-types.resolver";

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
    LoadOnePlaceTypeGuard,
    CreateOnePlaceTypeGuard,
    PlaceTypesResolver
  ],
  routes: [
    { path: '', component: PlaceTypesPage, canActivate: [], canDeactivate: [] },
    { path: 'create', component: PlaceTypeEditPage, canActivate: [CreateOnePlaceTypeGuard], canDeactivate: []},
    { path: ':id', component: PlaceTypeEditPage, canActivate: [LoadOnePlaceTypeGuard], canDeactivate: []}
  ]
}