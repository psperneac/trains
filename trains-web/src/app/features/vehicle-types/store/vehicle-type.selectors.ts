import { AbstractSelectors } from "../../../helpers/abstract.selectors";
import { VehicleTypeDto } from "../../../models/vehicle-type.model";
import { AppState } from "../../../store";
import { VehicleTypeState, vehicleTypesAdapter } from "./vehicle-type.reducer";

const selectors = vehicleTypesAdapter.getSelectors();
const featureState = (state: AppState) => state['vehicleTypes'] as VehicleTypeState;

export class VehicleTypeSelectorsType extends AbstractSelectors<VehicleTypeState, VehicleTypeDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const VehicleTypeSelectors = new VehicleTypeSelectorsType();