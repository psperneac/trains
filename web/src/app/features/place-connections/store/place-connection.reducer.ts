import { Action } from '@ngrx/store';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { PlaceConnectionActions } from './place-connection.actions';

export interface PlaceConnectionState extends AbstractEntityState<PlaceConnectionDto> {
}

export const placeConnectionsAdapter = createAdapter<PlaceConnectionDto>();
const placeConnectionInitialState = createInitialState(placeConnectionsAdapter);
const placeConnectionReducer = defaultCreateReducer(
  PlaceConnectionActions,
  placeConnectionsAdapter,
  placeConnectionInitialState);

export function reducer(state: PlaceConnectionState | undefined, action: Action) {
  return placeConnectionReducer(state, action);
}
