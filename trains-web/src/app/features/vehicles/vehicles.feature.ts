import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { VehicleFormComponent } from './components/vehicle-form/vehicle-form.component';
import { VehiclesListComponent } from './components/vehicles-list/vehicles-list.component';
import { VehicleEditPage } from './pages/vehicle-edit.page';
import { VehiclesPage } from './pages/vehicles-page.component';
import { createVehicleGuardFn, loadOneVehicleGuardFn, VehicleDataService } from './services/vehicle-data.service';
import { VehicleService } from './services/vehicle.service';
import { VehicleEffects } from './store/vehicle.effects';
import { reducer as vehiclesReducer } from './store/vehicle.reducer';

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
    VehicleDataService,
  ],
  routes: [
    {
      path: '',
      component: VehiclesPage,
      canActivate: [],
      canDeactivate: [] },
    {
      path: 'create',
      component: VehicleEditPage,
      canActivate: [createVehicleGuardFn],
      canDeactivate: []},
    {
      path: ':id',
      component: VehicleEditPage,
      canActivate: [loadOneVehicleGuardFn],
      canDeactivate: []}
  ]
}
