import { Action } from '@ngrx/store';
import { PlaceActions } from './place.actions';
import {PlaceDto} from "../../../models/place.model";
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer,
} from '../../../helpers/abstract.reducer';

export interface PlacesState extends AbstractEntityState<PlaceDto> {
}

export const placesAdapter = createAdapter<PlaceDto>();
const placeInitialState = createInitialState(placesAdapter);
const placeReducer = defaultCreateReducer(PlaceActions, placesAdapter, placeInitialState);

export function reducer(state: PlacesState | undefined, action: Action) {
  return placeReducer(state, action);
}
