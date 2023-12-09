import { Action } from '@ngrx/store';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { VehicleDto } from '../../../models/vehicle.model';
import { VehicleActions } from './vehicle.actions';

export interface VehicleState extends AbstractEntityState<VehicleDto> {
}

export const vehiclesAdapter = createAdapter<VehicleDto>();
const vehicleInitialState = createInitialState(vehiclesAdapter);
const vehicleReducer = defaultCreateReducer(VehicleActions, vehiclesAdapter, vehicleInitialState);

export function reducer(state: VehicleState | undefined, actions: Action) {
  return vehicleReducer(state, actions);
}
