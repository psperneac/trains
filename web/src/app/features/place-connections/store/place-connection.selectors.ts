import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { AppState } from '../../../store';
import { placeConnectionsAdapter, PlaceConnectionState } from './place-connection.reducer';

const selectors = placeConnectionsAdapter.getSelectors();
const featureState = (state: AppState) => state['place-connections'] as PlaceConnectionState;

export class PlaceConnectionSelectorsType extends AbstractSelectors<PlaceConnectionState, PlaceConnectionDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const PlaceConnectionSelectors = new PlaceConnectionSelectorsType();
