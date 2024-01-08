import { AbstractActions } from '../../../helpers/abstract.actions';
import { MapTemplateDto } from '../../../models/map-template.model';
import { Injectable } from '@angular/core';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { Actions } from '@ngrx/effects';
import { MapTemplateService } from '../services/map-template.service';
import { Action, Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer,
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';

export class MapTemplateActionsType extends AbstractActions<MapTemplateDto> {
  constructor() {
    super('MapTemplate');
  }
}

export const MapTemplateActions = new MapTemplateActionsType();

@Injectable()
export class MapTemplateEffects extends AbstractEffects<MapTemplateState, MapTemplateDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapTemplateService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapTemplateActions, MapTemplateSelectors);
  }
}

export interface MapTemplateState extends AbstractEntityState<MapTemplateDto> {
}

export const mapTemplateAdapter = createAdapter<MapTemplateDto>();
const mapTemplateInitialState = createInitialState(mapTemplateAdapter);
const mapTemplateReducer = defaultCreateReducer(
  MapTemplateActions,
  mapTemplateAdapter,
  mapTemplateInitialState);

export function reducer(state: MapTemplateState | undefined, action: Action) {
  return mapTemplateReducer(state, action);
}

const selectors = mapTemplateAdapter.getSelectors();
const featureState = (state) => state['map-templates'] as MapTemplateState;

export class MapTemplateSelectorsType extends AbstractSelectors<MapTemplateState, MapTemplateDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const MapTemplateSelectors = new MapTemplateSelectorsType();
