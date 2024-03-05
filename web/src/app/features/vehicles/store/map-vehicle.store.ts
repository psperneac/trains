import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Action, createAction, createSelector, on, props, Store } from '@ngrx/store';
import { ActionCreator, NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import { AbstractActions, ActionCreatorFn } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { AbstractEntityState, createAdapter, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapVehicleDto } from '../../../models/map-vehicle.model';
import { AppState, ByMapRequestType, ByMapResponseType } from '../../../store';
import { MapVehicleService } from '../services/map-vehicle.service';

export class MapVehicleActionsType extends AbstractActions<MapVehicleDto> {
  public getAllByMap: ActionCreator<string, ActionCreatorFn<ByMapRequestType>>;
  public getAllByMapSuccess: ActionCreator<string, ActionCreatorFn<ByMapResponseType<MapVehicleDto>>>;
  public getAllByMapFailure: ActionCreator<string, (props: ({
    error: any
  } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  constructor() {
    super('MapVehicle');

    this.getAllByMap = createAction('[MapVehicle] Get All By Map', props<ByMapRequestType>());
    this.getAllByMapSuccess = createAction('[MapVehicle] Get All By Map Success', props<ByMapResponseType<MapVehicleDto>>());
    this.getAllByMapFailure = createAction('[MapVehicle] Get All By Map Failure', props<{ error: any }>());
  }
}

export const MapVehicleActions = new MapVehicleActionsType();

export interface MapVehicleState extends AbstractEntityState<MapVehicleDto> {
}

export const mapVehicleAdapter = createAdapter<MapVehicleDto>();
const mapVehicleInitialState = mapVehicleAdapter.getInitialState();
const reducer = defaultCreateReducer(
  MapVehicleActions,
  mapVehicleAdapter,
  mapVehicleInitialState,
  on(MapVehicleActions.getAllByMap, (state, _action) => {
    return { ...state, loading: true };
  }),
  on(MapVehicleActions.getAllByMapFailure, (state, action) => {
    return { ...state, error: action.error, loading: false };
  }),
  on(
    MapVehicleActions.getAllByMapSuccess,
    (state, action) => {
      return {
        ...mapVehicleAdapter.setAll(action.result.data, state),
        error: undefined,
        loading: false,
        loaded: true,
        totalCount: action.result.totalCount,
        limit: action.result.limit,
        page: action.result.page
      };
    }),
);
export function mapVehicleReducer(state: MapVehicleState | undefined, action: Action) {
  return reducer(state, action);
}

const selectors = mapVehicleAdapter.getSelectors();
const featureState = (state: AppState) => state['map-vehicles'] as MapVehicleState;

class MapVehicleSelectorsType extends AbstractSelectors<MapVehicleState, MapVehicleDto> {
  constructor() {
    super(featureState, selectors);
  }

  ByMapId = (mapId: string) => createSelector(featureState, state =>
    Object.values(state.entities).filter(mp => mp.mapId === mapId));
}

export const MapVehicleSelectors = new MapVehicleSelectorsType();

@Injectable()
export class MapVehicleEffects extends AbstractEffects<MapVehicleState, MapVehicleDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapVehicleService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapVehicleActions, MapVehicleSelectors);
  }
}
