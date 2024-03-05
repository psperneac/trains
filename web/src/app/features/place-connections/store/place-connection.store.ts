import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AbstractActions } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { AppState } from '../../../store';
import { PlaceConnectionService } from '../services/place-connection.service';

export class PlaceConnectionActionsType extends AbstractActions<PlaceConnectionDto> {
  constructor() {
    super('PlaceConnection');
  }
}

export const PlaceConnectionActions = new PlaceConnectionActionsType();

export interface PlaceConnectionState extends AbstractEntityState<PlaceConnectionDto> {
}

export const placeConnectionsAdapter = createAdapter<PlaceConnectionDto>();
const placeConnectionInitialState = createInitialState(placeConnectionsAdapter);
const reducer = defaultCreateReducer(
  PlaceConnectionActions,
  placeConnectionsAdapter,
  placeConnectionInitialState);

export function placeConnectionReducer(state: PlaceConnectionState | undefined, action: Action) {
  return reducer(state, action);
}

const selectors = placeConnectionsAdapter.getSelectors();
const featureState = (state: AppState) => state['place-connections'] as PlaceConnectionState;

export class PlaceConnectionSelectorsType extends AbstractSelectors<PlaceConnectionState, PlaceConnectionDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const PlaceConnectionSelectors = new PlaceConnectionSelectorsType();

@Injectable()
export class PlaceConnectionEffects extends AbstractEffects<PlaceConnectionState, PlaceConnectionDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: PlaceConnectionService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, PlaceConnectionActions, PlaceConnectionSelectors);
  }
}
