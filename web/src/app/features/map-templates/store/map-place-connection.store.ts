import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";

import { AbstractActions } from "../../../helpers/abstract.actions";
import { AbstractEffects } from "../../../helpers/abstract.effects";
import { AbstractEntityState, createAdapter, defaultCreateReducer } from "../../../helpers/abstract.reducer";
import { MapPlaceConnectionDto } from "../../../models/map-place-connection.model";
import { AppState } from "../../../store";
import { MapPlaceConnectionService } from "../services/map-place-connection.service";
import { AbstractSelectors } from "../../../helpers/abstract.selectors";

export class MapPlaceConnectionActionsType extends AbstractActions<MapPlaceConnectionDto> {
  constructor() {
    super('MapPlaceConnection');
  }
}

export const MapPlaceConnectionActions = new MapPlaceConnectionActionsType();

@Injectable()
export class MapPlaceConnectionEffects extends AbstractEffects<MapPlaceConnectionState, MapPlaceConnectionDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapPlaceConnectionService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapPlaceConnectionActions, MapPlaceConnectionSelectors);
  }
}

export interface MapPlaceConnectionState extends AbstractEntityState<MapPlaceConnectionDto> {
}

export const mapPlaceConnectionAdapter = createAdapter<MapPlaceConnectionDto>();
const mapPlaceConnectionInitialState = mapPlaceConnectionAdapter.getInitialState();
const mapPlaceConnectionReducer = defaultCreateReducer(
  MapPlaceConnectionActions,
  mapPlaceConnectionAdapter,
  mapPlaceConnectionInitialState);

export function reducer(state: MapPlaceConnectionState | undefined, action: any) {
  return mapPlaceConnectionReducer(state, action);
}

const selectors = mapPlaceConnectionAdapter.getSelectors();
const featureState = (state) => state['map-place-connections'] as MapPlaceConnectionState;

export class MapPlaceConnectionSelectorsType extends AbstractSelectors<MapPlaceConnectionState, MapPlaceConnectionDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const MapPlaceConnectionSelectors = new MapPlaceConnectionSelectorsType();
