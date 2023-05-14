import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { VehicleFormComponent } from './components/vehicle-form/vehicle-form.component';
import { VehiclesListComponent } from './components/vehicles-list/vehicles-list.component';
import { CreateOneVehicleGuard } from './create-one-vehicle.guard';
import { LoadOneVehicleGuard } from './load-one-vehicle.guard';
import { VehicleEditPage } from './pages/vehicle-edit.page';
import { VehiclesPage } from './pages/vehicles-page.component';
import { VehicleService } from './services/vehicle.service';
import { VehicleEffects } from './store/vehicle.effects';
import { reducer as vehiclesReducer } from './store/vehicle.reducer';
import { VehiclesResolver } from './vehicles.resolver';

export const VEHICLES_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('vehicles', vehiclesReducer),
    EffectsModule.forFeature([VehicleEffects])
  ],
  declarations: [
    VehiclesPage,
    VehiclesListComponent,
    VehicleFormComponent,
    VehicleEditPage,
    VehicleFormComponent,
  ],
  providers: [
    VehicleService,
    VehiclesResolver,
    CreateOneVehicleGuard,
    LoadOneVehicleGuard,
  ],
  routes: [
    { path: '', component: VehiclesPage, canActivate: [], canDeactivate: [] },
    { path: 'create', component: VehicleEditPage, canActivate: [CreateOneVehicleGuard], canDeactivate: []},
    { path: ':id', component: VehicleEditPage, canActivate: [LoadOneVehicleGuard], canDeactivate: []}

  ]
}
