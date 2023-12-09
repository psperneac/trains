import { AbstractActions } from '../../../helpers/abstract.actions';
import { VehicleDto } from '../../../models/vehicle.model';

class VehicleActionsType extends AbstractActions<VehicleDto> {
  constructor() {
    super('Vehicle');
  }
}

export const VehicleActions = new VehicleActionsType();
