import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createAction, createSelector, on, props, Store } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AbstractActions, ActionCreatorFn } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { AbstractEntityState, createAdapter, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapVehicleInstanceJobDto } from '../../../models/map-vehicle-instance-job.model';
import {
  AppState,
  ByPlayerAndMapRequestType,
  ByPlayerAndMapResponseType,
  ByVehicleRequestType,
  ByVehicleResponseType,
  ErrorType
} from '../../../store';
import { MapVehicleInstanceJobService } from '../services/map-vehicle-instance-job.service';

class MapVehicleInstanceJobActionsType extends AbstractActions<MapVehicleInstanceJobDto> {
  getAllByPlayerAndMap: ActionCreator<string, ActionCreatorFn<ByPlayerAndMapRequestType>>;
  getAllByPlayerAndMapSuccess: ActionCreator<string, ActionCreatorFn<ByPlayerAndMapResponseType<MapVehicleInstanceJobDto>>>;
  getAllByPlayerAndMapFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  getAllByVehicle: ActionCreator<string, ActionCreatorFn<ByVehicleRequestType>>;
  getAllByVehicleSuccess: ActionCreator<string, ActionCreatorFn<ByVehicleResponseType<MapVehicleInstanceJobDto>>>;
  getAllByVehicleFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  constructor() {
    super('MapVehicleInstanceJob');


    this.getAllByPlayerAndMap = createAction(`[MapVehicleInstanceJob] Get All By Map`,
      props<ByPlayerAndMapRequestType>());
    this.getAllByPlayerAndMapSuccess = createAction(`[MapVehicleInstanceJob] Get All By Map Success`,
      props<ByPlayerAndMapResponseType<MapVehicleInstanceJobDto>>());
    this.getAllByPlayerAndMapFailure = createAction(`[MapVehicleInstanceJob] Get All By Map Failure`,
      props<ErrorType>());

    this.getAllByVehicle = createAction(`[MapVehicleInstanceJob] Get All By Vehicle`,
      props<ByVehicleRequestType>());
    this.getAllByVehicleSuccess = createAction(`[MapVehicleInstanceJob] Get All By Vehicle Success`,
      props<ByVehicleResponseType<MapVehicleInstanceJobDto>>());
    this.getAllByVehicleFailure = createAction(`[MapVehicleInstanceJob] Get All By Vehicle Failure`,
      props<ErrorType>());
  }
}

export const MapVehicleInstanceJobActions = new MapVehicleInstanceJobActionsType();

export interface MapVehicleInstanceJobsState extends AbstractEntityState<MapVehicleInstanceJobDto> {
}

export const mapVehicleInstanceJobAdapter = createAdapter<MapVehicleInstanceJobDto>();
const mapVehicleInstanceJobInitialState = mapVehicleInstanceJobAdapter.getInitialState();

const reducer = defaultCreateReducer(MapVehicleInstanceJobActions, mapVehicleInstanceJobAdapter, mapVehicleInstanceJobInitialState,
  on(MapVehicleInstanceJobActions.getAllByPlayerAndMap,
  state => ({ ...state, loading: true })),
  on(MapVehicleInstanceJobActions.getAllByPlayerAndMapSuccess,
    (state, action) => mapVehicleInstanceJobAdapter.setAll(action.result.data, { ...state, loading: false })),
  on(MapVehicleInstanceJobActions.getAllByPlayerAndMapFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })),

  on(MapVehicleInstanceJobActions.getAllByVehicle,
    state => ({ ...state, loading: true })),
  on(MapVehicleInstanceJobActions.getAllByVehicleSuccess,
    (state, action) => mapVehicleInstanceJobAdapter.setAll(action.result.data, { ...state, loading: false })),
  on(MapVehicleInstanceJobActions.getAllByVehicleFailure,
    (state, action) => ({ ...state, loading: false, error: action.error }))
);

export function mapVehicleInstanceJobReducer(state: MapVehicleInstanceJobsState | undefined, action: any) {
  return reducer(state, action);
}

const selectors = mapVehicleInstanceJobAdapter.getSelectors();
const featureSelector = (state: any) => state['map-vehicle-instance-jobs'] as MapVehicleInstanceJobsState;

class MapVehicleInstanceJobSelectorsType extends AbstractSelectors<MapVehicleInstanceJobsState, MapVehicleInstanceJobDto> {
  constructor() {
    super(featureSelector, selectors);
  }

  ByPlayerAndMap = (playerId: string, mapId: string) => createSelector(
    featureSelector,
    (state) => state.entities,
    (entities) => Object.values(entities).filter((job) => job.playerId === playerId && job.mapId === mapId)
  );

  ByVehicle = (vehicleId: string) => createSelector(
    featureSelector,
    (state) => state.entities,
    (entities) => Object.values(entities).filter((job) => job.vehicleId === vehicleId)
  );
}

export const MapVehicleInstanceJobSelectors = new MapVehicleInstanceJobSelectorsType();

@Injectable()
export class MapVehicleInstanceJobEffects extends AbstractEffects<MapVehicleInstanceJobsState, MapVehicleInstanceJobDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapVehicleInstanceJobService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapVehicleInstanceJobActions, MapVehicleInstanceJobSelectors);
  }

  getAllByPlayerAndMap$ = createEffect(
    () => this.actions$.pipe(
      ofType(MapVehicleInstanceJobActions.getAllByPlayerAndMap),
      switchMap(action => this.service.getAllByPlayerAndMap(action.request, action.playerId, action.mapId).pipe(
        map(result => MapVehicleInstanceJobActions.getAllByPlayerAndMapSuccess({ result, playerId: action.playerId, mapId: action.mapId })),
        catchError(error => of(MapVehicleInstanceJobActions.getAllByPlayerAndMapFailure({ error })))
      )),
    )
  );

  getAllByVehicle$ = createEffect(
    () => this.actions$.pipe(
      ofType(MapVehicleInstanceJobActions.getAllByVehicle),
      switchMap(action => this.service.getAllByVehicle(action.request, action.vehicleId).pipe(
        map(result => MapVehicleInstanceJobActions.getAllByVehicleSuccess({ result, vehicleId: action.vehicleId })),
        catchError(error => of(MapVehicleInstanceJobActions.getAllByVehicleFailure({ error })))
      )),
    )
  );
}
