import { Action } from "@ngrx/store";
import { AbstractEntityState, createAdapter, createInitialState, defaultCreateReducer } from "../../../helpers/abstract.reducer";
import { VehicleTypeDto } from "../../../models/vehicle-type.model";
import { VehicleTypeActions } from "./vehicle-type.actions";

export interface VehicleTypeState extends AbstractEntityState<VehicleTypeDto> {
}

export const vehicleTypesAdapter = createAdapter<VehicleTypeDto>();
const vehicleTypeInitialState = createInitialState(vehicleTypesAdapter);
const vehicleTypeReducer = defaultCreateReducer(VehicleTypeActions, vehicleTypesAdapter, vehicleTypeInitialState);

export function reducer(state: VehicleTypeState | undefined, action: Action) {
  return vehicleTypeReducer(state, action);
}
