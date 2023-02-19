import { AppState } from '../../../store';
import { placesAdapter, PlacesState } from './place.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import {PlaceDto} from "../../../models/place.model";

const selectors = placesAdapter.getSelectors();
const placesState = (state: AppState) => state['places'] as PlacesState;

export class PlaceSelectorsType extends AbstractSelectors<PlacesState, PlaceDto> {
  constructor() {
    super(placesState, selectors);
  }
}

export const PlaceSelectors = new PlaceSelectorsType();
