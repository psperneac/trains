import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import {AbstractActions} from "../../../helpers/abstract.actions";
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import {PlaceInstanceDto} from "../../../models/place.model";
import { AppState } from '../../../store';
import { PlaceInstanceService } from '../services/place-instance.service';

class PlaceInstanceActionsType extends AbstractActions<PlaceInstanceDto> {
    constructor() {
        super('PlaceInstance');
    }
}

export const PlaceInstanceActions = new PlaceInstanceActionsType();

@Injectable()
export class PlaceInstanceEffects extends AbstractEffects<PlaceInstancesState, PlaceInstanceDto> {
    constructor(
        readonly actions$: Actions,
        readonly service: PlaceInstanceService,
        readonly store: Store<AppState>,
        readonly router: Router
    ) {
        super(actions$, service, store, router, PlaceInstanceActions, PlaceInstanceSelectors);
    }
}

export interface PlaceInstancesState extends AbstractEntityState<PlaceInstanceDto> {
}

export const placeInstancesAdapter = createAdapter<PlaceInstanceDto>();
const placeInstanceInitialState = createInitialState(placeInstancesAdapter);
const placeInstanceReducer = defaultCreateReducer(PlaceInstanceActions, placeInstancesAdapter, placeInstanceInitialState);

export function reducer(state: PlaceInstancesState | undefined, action: Action) {
    return placeInstanceReducer(state, action);
}

const selectors = placeInstancesAdapter.getSelectors();
const placeInstancesState = (state: AppState) => state['placeInstances'] as PlaceInstancesState;

export class PlaceInstanceSelectorsType extends AbstractSelectors<PlaceInstancesState, PlaceInstanceDto> {
    constructor() {
        super(placeInstancesState, selectors);
    }
}

export const PlaceInstanceSelectors = new PlaceInstanceSelectorsType();
