import { StoreModule } from "@ngrx/store";
import { FeaturePart } from "../../utils/feature-part";
import { VehicleTypeFormComponent } from "./components/vehicle-type-form/vehicle-type-form.component";
import { VehicleTypesListComponent } from "./components/vehicle-types-list/vehicle-types-list.component";
import { VehicleTypeEditPage } from "./pages/vehicle-type-edit.page";
import { VehicleTypesPage } from "./pages/vehicle-types.page";
import {
  createVehicleTypeGuardFn,
  loadOneVehicleTypeGuardFn,
  VehicleTypeDataService
} from './services/vehicle-type-data.service';
import { VehicleTypeService } from "./services/vehicle-type.service";
import { EffectsModule } from "@ngrx/effects";
import { VehicleTypeEffects } from "./store/vehicle-type.effects";
import { reducer as vehicleTypesReducer } from "./store/vehicle-type.reducer";

export const VEHICLE_TYPES_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('vehicleTypes', vehicleTypesReducer),
    EffectsModule.forFeature([VehicleTypeEffects])
  ],
  declarations: [
    VehicleTypesPage,
    VehicleTypeEditPage,
    VehicleTypesListComponent,
    VehicleTypeFormComponent
  ],
  providers: [
    VehicleTypeService,
    VehicleTypeDataService,
  ],
  routes: [
    { path: '', component: VehicleTypesPage, canActivate: [], canDeactivate: [] },
    { path: 'create', component: VehicleTypeEditPage, canActivate: [createVehicleTypeGuardFn], canDeactivate: []},
    { path: ':id', component: VehicleTypeEditPage, canActivate: [loadOneVehicleTypeGuardFn], canDeactivate: []}
  ]
}
