import { AbstractActions } from '../../../helpers/abstract.actions';
import { PlaceConnectionDto } from '../../../models/place-connection.model';

export class PlaceConnectionActionsType extends AbstractActions<PlaceConnectionDto> {
  constructor() {
    super('PlaceConnection');
  }
}

export const PlaceConnectionActions = new PlaceConnectionActionsType();
