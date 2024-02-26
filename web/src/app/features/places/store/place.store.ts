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
import { PlaceDto } from '../../../models/place.model';
import { AppState } from '../../../store';
import { PlaceService } from '../services/place.service';

class PlaceActionsType extends AbstractActions<PlaceDto> {
  constructor() {
    super('Place');
  }
}

export const PlaceActions = new PlaceActionsType();


@Injectable()
export class PlaceEffects extends AbstractEffects<PlacesState, PlaceDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: PlaceService,
    readonly store: Store<AppState>,
    readonly router: Router) {
    super(actions$, service, store, router, PlaceActions, PlaceSelectors);
  }
}

export interface PlacesState extends AbstractEntityState<PlaceDto> {
}

export const placesAdapter = createAdapter<PlaceDto>();
const placeInitialState = createInitialState(placesAdapter);
const placeReducer = defaultCreateReducer(PlaceActions, placesAdapter, placeInitialState);

export function reducer(state: PlacesState | undefined, action: Action) {
  return placeReducer(state, action);
}

const selectors = placesAdapter.getSelectors();
const placesState = (state: AppState) => state['places'] as PlacesState;

export class PlaceSelectorsType extends AbstractSelectors<PlacesState, PlaceDto> {
  constructor() {
    super(placesState, selectors);
  }
}

export const PlaceSelectors = new PlaceSelectorsType();
