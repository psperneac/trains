import {AbstractActions} from "../../../helpers/abstract.actions";
import {PlaceTypeDto} from "../../../models/place-type.model";

class PlaceTypeActionsType extends AbstractActions<PlaceTypeDto> {
  constructor() {
    super('PlaceType');
  }
}

export const PlaceTypeActions = new PlaceTypeActionsType();
