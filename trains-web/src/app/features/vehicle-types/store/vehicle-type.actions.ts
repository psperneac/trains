import { AbstractActions } from "../../../helpers/abstract.actions";
import { VehicleTypeDto } from "../../../models/vehicle-type.model";

class VehicleTypeActionsType extends AbstractActions<VehicleTypeDto> {
  constructor() {
    super('VehicleType');
  }
}

export const VehicleTypeActions = new VehicleTypeActionsType();
