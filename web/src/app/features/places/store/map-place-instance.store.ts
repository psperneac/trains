import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, ActionCreator, createAction, createSelector, on, props, Store } from '@ngrx/store';
import { NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AbstractActions } from "../../../helpers/abstract.actions";
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { MapPlaceInstanceDto } from "../../../models/place.model";
import { AppState } from '../../../store';
import { MapPlaceInstanceService } from '../services/map-place-instance.service';

class MapPlaceInstanceActionsType extends AbstractActions<MapPlaceInstanceDto> {
  getAllByPlayerAndMap: ActionCreator<string, (props: ({ request: PageRequestDto; playerId: string, mapId: string } & NotAllowedCheck<{ request: PageRequestDto; playerId: string; mapId: string }>)) => ({ request: PageRequestDto;
    playerId: string;
    mapId: string
  } & TypedAction<string>)>;
  getAllByPlayerAndMapSuccess: ActionCreator<string, (props: ({ result: PageDto<MapPlaceInstanceDto>; playerId: string; mapId: string } & NotAllowedCheck<{ result: PageDto<MapPlaceInstanceDto>; playerId: string; mapId: string }>)) => ({ result: PageDto<MapPlaceInstanceDto>; playerId: string; mapId: string } & TypedAction<string>)>;
  getAllByPlayerAndMapFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  constructor() {
    super('MapPlaceInstance');

    this.getAllByPlayerAndMap = createAction(`[MapPlaceInstance] Get All By Map`, props<{ request: PageRequestDto, playerId: string, mapId: string }>());
    this.getAllByPlayerAndMapSuccess = createAction(`[MapPlaceInstance] Get All By Map Success`, props<{ result: PageDto<MapPlaceInstanceDto>, playerId: string, mapId: string }>());
    this.getAllByPlayerAndMapFailure = createAction(`[MapPlaceInstance] Get All By Map Failure`, props<{ error: any }>());

  }
}

export const MapPlaceInstanceActions = new MapPlaceInstanceActionsType();

@Injectable()
export class MapPlaceInstanceEffects extends AbstractEffects<MapPlaceInstancesState, MapPlaceInstanceDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapPlaceInstanceService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapPlaceInstanceActions, MapPlaceInstanceSelectors);
  }

  getAllByPlayerAndMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceInstanceActions.getAllByPlayerAndMap),
      switchMap(action => {
        return (this.service as MapPlaceInstanceService).getAllByPlayerAndMap(action.request, action.playerId, action.mapId).pipe(
          map(result => MapPlaceInstanceActions.getAllByPlayerAndMapSuccess({ result, playerId: action.playerId, mapId: action.mapId })),
          catchError(error => of(MapPlaceInstanceActions.getAllByPlayerAndMapFailure({ error })))
        );
      })
    )
  );
}

export interface MapPlaceInstancesState extends AbstractEntityState<MapPlaceInstanceDto> {
}

export const mapPlaceInstancesAdapter = createAdapter<MapPlaceInstanceDto>();
const mapPlaceInstanceInitialState = createInitialState(mapPlaceInstancesAdapter);

const reducer = defaultCreateReducer(MapPlaceInstanceActions, mapPlaceInstancesAdapter, mapPlaceInstanceInitialState,
  on(MapPlaceInstanceActions.getAllByPlayerAndMap, (state, _action) => {
    return { ...state, loading: true };
  }),
  on(MapPlaceInstanceActions.getAllByPlayerAndMapFailure, (state, action) => {
    return { ...state, error: action.error, loading: false };
  }),
  on(
    MapPlaceInstanceActions.getAllByPlayerAndMapSuccess,
    (state, action) => {
    return {
      ...mapPlaceInstancesAdapter.setAll(action.result.data, state),
      error: undefined,
      loading: false,
      loaded: true,
      totalCount: action.result.totalCount,
      limit: action.result.limit,
      page: action.result.page
    };
  }),
);

export function mapPlaceInstanceReducer(state: MapPlaceInstancesState | undefined, action: Action) {
  return reducer(state, action);
}

const selectors = mapPlaceInstancesAdapter.getSelectors();
const featureState = (state: AppState) => state['map-place-instances'] as MapPlaceInstancesState;

class MapPlaceInstanceSelectorsType extends AbstractSelectors<MapPlaceInstancesState, MapPlaceInstanceDto> {
  constructor() {
    super(featureState, selectors);
  }

  ByPlayerAndMapId = (playerId: string, mapId: string) => createSelector(featureState, state =>
    Object.values(state.entities).filter(mp => mp.mapId === mapId && mp.playerId === playerId));
}

export const MapPlaceInstanceSelectors = new MapPlaceInstanceSelectorsType();
