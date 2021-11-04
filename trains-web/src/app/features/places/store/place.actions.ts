import { AbstractActions } from '../../../helpers/abstract.actions';
import {PlaceDto} from '../../../models/place.model';

class PlaceActionsType extends AbstractActions<PlaceDto> {
  constructor() {
    super('Place');
  }
}

export const PlaceActions = new PlaceActionsType();
