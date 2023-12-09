import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { PlaceDto } from "../../../models/place.model";
import { AppState } from '../../../store';
import { placesAdapter, PlacesState } from './place.reducer';

const selectors = placesAdapter.getSelectors();
const placesState = (state: AppState) => state['places'] as PlacesState;

export class PlaceSelectorsType extends AbstractSelectors<PlacesState, PlaceDto> {
  constructor() {
    super(placesState, selectors);
  }
}

export const PlaceSelectors = new PlaceSelectorsType();
