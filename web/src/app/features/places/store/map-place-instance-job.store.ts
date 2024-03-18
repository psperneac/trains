import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createAction, createSelector, on, props, Store } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AbstractActions, ActionCreatorFn } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapPlaceInstanceJobDto } from '../../../models';
import {
  AppState,
  ByPlaceRequestType,
  ByPlaceResponseType,
  ByPlayerAndMapRequestType,
  ByPlayerAndMapResponseType,
  ErrorType
} from '../../../store';
import { MapPlaceInstanceJobService } from '../services/map-place-instance-job.service';

class MapPlaceInstanceJobActionsType extends AbstractActions<MapPlaceInstanceJobDto> {
  getAllByPlayerAndMap: ActionCreator<string, ActionCreatorFn<ByPlayerAndMapRequestType>>;
  getAllByPlayerAndMapSuccess: ActionCreator<
    string,
    ActionCreatorFn<ByPlayerAndMapResponseType<MapPlaceInstanceJobDto>>
  >;
  getAllByPlayerAndMapFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  getAllByPlace: ActionCreator<string, ActionCreatorFn<ByPlaceRequestType>>;
  getAllByPlaceSuccess: ActionCreator<
    string,
    ActionCreatorFn<ByPlaceResponseType<MapPlaceInstanceJobDto>>
  >;
  getAllByPlaceFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  constructor() {
    super('MapPlaceInstanceJob');

    this.getAllByPlayerAndMap = createAction(
      `[MapPlaceInstanceJob] Get All By Map`,
      props<ByPlayerAndMapRequestType>()
    );
    this.getAllByPlayerAndMapSuccess = createAction(
      `[MapPlaceInstanceJob] Get All By Map Success`,
      props<ByPlayerAndMapResponseType<MapPlaceInstanceJobDto>>()
    );
    this.getAllByPlayerAndMapFailure = createAction(
      `[MapPlaceInstanceJob] Get All By Map Failure`,
      props<ErrorType>()
    );

    this.getAllByPlace = createAction(
      `[MapPlaceInstanceJob] Get All By Place`,
      props<ByPlaceRequestType>()
    );
    this.getAllByPlaceSuccess = createAction(
      `[MapPlaceInstanceJob] Get All By Place Success`,
      props<ByPlaceResponseType<MapPlaceInstanceJobDto>>()
    );
    this.getAllByPlaceFailure = createAction(
      `[MapPlaceInstanceJob] Get All By Place Failure`,
      props<ErrorType>()
    );
  }
}

export const MapPlaceInstanceJobActions = new MapPlaceInstanceJobActionsType();

export interface MapPlaceInstanceJobsState extends AbstractEntityState<MapPlaceInstanceJobDto> {}

export const mapPlaceInstanceJobAdapter = createAdapter<MapPlaceInstanceJobDto>();
export const mapPlaceInstanceJobInitialState = mapPlaceInstanceJobAdapter.getInitialState();

const reducer = defaultCreateReducer(
  MapPlaceInstanceJobActions,
  mapPlaceInstanceJobAdapter,
  mapPlaceInstanceJobInitialState,
  on(MapPlaceInstanceJobActions.getAllByPlayerAndMap, state => ({ ...state, loading: true })),
  on(MapPlaceInstanceJobActions.getAllByPlayerAndMapSuccess, (state, action) =>
    mapPlaceInstanceJobAdapter.setAll(action.result.data, { ...state, loading: false })
  ),
  on(MapPlaceInstanceJobActions.getAllByPlayerAndMapFailure, state => ({
    ...state,
    loading: false
  })),
  on(MapPlaceInstanceJobActions.getAllByPlace, state => ({ ...state, loading: true })),
  on(MapPlaceInstanceJobActions.getAllByPlaceSuccess, (state, action) =>
    mapPlaceInstanceJobAdapter.setAll(action.result.data, { ...state, loading: false })
  ),
  on(MapPlaceInstanceJobActions.getAllByPlaceFailure, state => ({ ...state, loading: false }))
);

export function mapPlaceInstanceJobReducer(state, action) {
  return reducer(state, action);
}

const selectors = mapPlaceInstanceJobAdapter.getSelectors();
const featureSelector = (state: any) =>
  state['map-place-instance-jobs'] as MapPlaceInstanceJobsState;

class MapPlaceInstanceJobSelectorsType extends AbstractSelectors<
  MapPlaceInstanceJobsState,
  MapPlaceInstanceJobDto
> {
  constructor() {
    super(featureSelector, selectors);
  }

  public ByPlayerAndMap = (playerId: string, mapId: string) =>
    createSelector(
      featureSelector,
      state => state.entities,
      entities =>
        Object.values(entities).filter(job => job.playerId === playerId && job.mapId === mapId)
    );

  public ByPlace = (placeId: string) =>
    createSelector(
      featureSelector,
      state => state.entities,
      entities => Object.values(entities).filter(job => job.mapPlaceInstanceId === placeId)
    );
}

export const MapPlaceInstanceJobSelectors = new MapPlaceInstanceJobSelectorsType();

@Injectable()
export class MapPlaceInstanceJobEffects extends AbstractEffects<
  MapPlaceInstanceJobsState,
  MapPlaceInstanceJobDto
> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapPlaceInstanceJobService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(
      actions$,
      service,
      store,
      router,
      MapPlaceInstanceJobActions,
      MapPlaceInstanceJobSelectors
    );
  }

  getAllByPlayerAndMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceInstanceJobActions.getAllByPlayerAndMap),
      mergeMap(action =>
        this.service.getAllByPlayerAndMap(action.request, action.playerId, action.mapId).pipe(
          map(result =>
            MapPlaceInstanceJobActions.getAllByPlayerAndMapSuccess({
              result,
              playerId: action.playerId,
              mapId: action.mapId
            })
          ),
          catchError(error => of(MapPlaceInstanceJobActions.getAllByPlayerAndMapFailure({ error })))
        )
      )
    )
  );

  getAllByPlace$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceInstanceJobActions.getAllByPlace),
      mergeMap(action =>
        this.service.getAllByPlace(action.request, action.placeId).pipe(
          map(result =>
            MapPlaceInstanceJobActions.getAllByPlaceSuccess({
              result,
              placeId: action.placeId
            })
          ),
          catchError(error => of(MapPlaceInstanceJobActions.getAllByPlaceFailure({ error })))
        )
      )
    )
  );
}
