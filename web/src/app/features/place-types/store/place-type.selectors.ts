import { AbstractSelectors } from "../../../helpers/abstract.selectors";
import { PlaceTypeDto } from "../../../models/place-type.model";
import { AppState } from "../../../store";
import { placeTypesAdapter, PlaceTypesState } from './place-type.reducer';

const selectors = placeTypesAdapter.getSelectors();
const featureState = (state: AppState) => state['placeTypes'] as PlaceTypesState;

export class PlaceTypeSelectorsType extends AbstractSelectors<PlaceTypesState, PlaceTypeDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const PlaceTypeSelectors = new PlaceTypeSelectorsType();
