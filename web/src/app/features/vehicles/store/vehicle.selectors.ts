import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { VehicleDto } from '../../../models/vehicle.model';
import { AppState } from '../../../store';
import { vehiclesAdapter, VehicleState } from './vehicle.reducer';

const selectors = vehiclesAdapter.getSelectors();
const featureState = (state: AppState) => state['vehicles'] as VehicleState;

export class VehicleSelectorsType extends AbstractSelectors<VehicleState, VehicleDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const VehicleSelectors = new VehicleSelectorsType();
