import { AbstractActions, ActionCreatorFn, IsActionChecker } from '../../../helpers/abstract.actions';
import { MapPlaceDto } from '../../../models/map-place.model';
import { AbstractEntityState, createAdapter, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { Router } from '@angular/router';
import { ActionCreator, Store, createAction, props, createSelector, on } from '@ngrx/store';
import { AppState, ByMapRequestType, ByMapResponseType } from '../../../store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { Injectable } from '@angular/core';
import { MapPlaceService } from '../services/map-place.service';
import { AbstractSelectors } from 'src/app/helpers/abstract.selectors';
import { TypedAction } from '@ngrx/store/src/models';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export class MapPlaceActionsType extends AbstractActions<MapPlaceDto> {
  getAllByMap: ActionCreator<string, ActionCreatorFn<ByMapRequestType>>;
  isGetAllByMap: IsActionChecker;
  getAllByMapSuccess: ActionCreator<string, ActionCreatorFn<ByMapResponseType<MapPlaceDto>>>;
  isGetAllByMapSuccess: IsActionChecker;
  getAllByMapFailure: ActionCreator<string, (props: { error: any; }) => { error: any; } & TypedAction<string>>;
  isGetAllByMapFailure: IsActionChecker;

  constructor() {
    super('MapPlace');

    this.getAllByMap = createAction(`[MapPlace] Get All By Map`, props<ByMapRequestType>());
    this.isGetAllByMap = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map`;

    this.getAllByMapSuccess = createAction(`[MapPlace] Get All By Map Success`, props<ByMapResponseType<MapPlaceDto>>());
    this.isGetAllByMapSuccess = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map Success`;
    this.getAllByMapFailure = createAction(`[MapPlace] Get All By Map Failure`, props<{ error: any }>());
    this.isGetAllByMapFailure = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map Failure`;
  }
}

export const MapPlaceActions = new MapPlaceActionsType();

export interface MapPlaceState extends AbstractEntityState<MapPlaceDto> {
}

export const mapPlaceAdapter = createAdapter<MapPlaceDto>();
const mapPlaceInitialState = mapPlaceAdapter.getInitialState();
const mapPlaceReducer = defaultCreateReducer(
  MapPlaceActions,
  mapPlaceAdapter,
  mapPlaceInitialState,
  on(MapPlaceActions.getAllByMap, (state, _action) => {
    return { ...state, loading: true };
  }),
  on(MapPlaceActions.getAllByMapFailure, (state, action) => {
    return { ...state, error: action.error, loading: false };
  }),
  on(
    MapPlaceActions.getAllByMapSuccess,
    (state, action) => {
      return {
        ...mapPlaceAdapter.setAll(action.result.data, state),
        error: undefined,
        loading: false,
        loaded: true,
        totalCount: action.result.totalCount,
        limit: action.result.limit,
        page: action.result.page
      };
    }),
);

export function reducer(state: MapPlaceState | undefined, action: any) {
  return mapPlaceReducer(state, action);
}

const selectors = mapPlaceAdapter.getSelectors();
const featureState = (state) => state['map-places'] as MapPlaceState;

export class MapPlaceSelectorsType extends AbstractSelectors<MapPlaceState, MapPlaceDto> {
  constructor() {
    super(featureState, selectors);
  }

  ByMapId = (mapId: string) => createSelector(featureState, state => {
    const ret = Object.values(state.entities).filter(mp => mp.mapId === mapId);
    return ret;
  });
}

export const MapPlaceSelectors = new MapPlaceSelectorsType();

@Injectable()
export class MapPlaceEffects extends AbstractEffects<MapPlaceState, MapPlaceDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapPlaceService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapPlaceActions, MapPlaceSelectors);
  }

  getAllByMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceActions.getAllByMap),
      switchMap(action => {
        return (this.service as MapPlaceService).getAllByMap(action.request, action.mapId).pipe(
          map(result => MapPlaceActions.getAllByMapSuccess({ result, mapId: action.mapId })),
          catchError(error => of(MapPlaceActions.getAllByMapFailure({ error })))
        );
      })
    )
  );
}
