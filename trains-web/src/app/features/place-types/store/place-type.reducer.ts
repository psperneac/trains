import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer,
} from '../../../helpers/abstract.reducer';
import { PlaceTypeDto } from '../../../models/place-type.model';
import { PlaceTypeActions } from './place-type.actions';
import { Action } from '@ngrx/store';

export interface PlaceTypesState extends AbstractEntityState<PlaceTypeDto> {
}

const placeTypeAdapter = createAdapter<PlaceTypeDto>();
const placeTypeInitialState = createInitialState(placeTypeAdapter);
const placeTypeReducer = defaultCreateReducer(PlaceTypeActions, placeTypeAdapter, placeTypeInitialState);

export function reducer(state: PlaceTypesState | undefined, action: Action) {
  return placeTypeReducer(state, action);
}
