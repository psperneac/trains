import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, createAction, createSelector, on, props, Store } from '@ngrx/store';
import { ActionCreator, NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AbstractActions } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapVehicleInstanceDto } from '../../../models/map-vehicle-instance.model';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AppState } from '../../../store';
import { MapVehicleInstanceService } from '../services/map-vehicle-instance.service';

class MapVehicleInstanceActionsType extends AbstractActions<MapVehicleInstanceDto> {
  getAllByPlayerAndMap: ActionCreator<string, (props: ({ request: PageRequestDto; playerId: string; mapId: string } & NotAllowedCheck<{ request: PageRequestDto; playerId: string; mapId: string }>)) => ({ request: PageRequestDto;
    playerId: string;
    mapId: string
  } & TypedAction<string>)>;
  getAllByPlayerAndMapSuccess: ActionCreator<string, (props: ({ result: PageDto<MapVehicleInstanceDto>; playerId: string; mapId: string } & NotAllowedCheck<{ result: PageDto<MapVehicleInstanceDto>; playerId: string; mapId: string }>)) => ({ result: PageDto<MapVehicleInstanceDto>; playerId: string; mapId: string } & TypedAction<string>)>;
  getAllByPlayerAndMapFailure: ActionCreator<string, (props: ({ error: any } & NotAllowedCheck<{ error: any }>)) => ({ error: any } & TypedAction<string>)>;

  constructor() {
    super('MapVehicleInstance');

    this.getAllByPlayerAndMap = createAction(`[MapVehicleInstance] Get All By Map`, props<{ request: PageRequestDto, playerId: string, mapId: string }>());
    this.getAllByPlayerAndMapSuccess = createAction(`[MapVehicleInstance] Get All By Map Success`, props<{ result: PageDto<MapVehicleInstanceDto>, playerId: string, mapId: string }>());
    this.getAllByPlayerAndMapFailure = createAction(`[MapVehicleInstance] Get All By Map Failure`, props<{ error: any }>());
  }
}

export const MapVehicleInstanceActions = new MapVehicleInstanceActionsType();

export interface MapVehicleInstancesState extends AbstractEntityState<MapVehicleInstanceDto> {
}

export const mapVehicleInstanceAdapter = createAdapter<MapVehicleInstanceDto>();
const mapVehicleInstanceInitialState = createInitialState(mapVehicleInstanceAdapter);

const reducer = defaultCreateReducer(MapVehicleInstanceActions, mapVehicleInstanceAdapter,mapVehicleInstanceInitialState,
  on(MapVehicleInstanceActions.getAllByPlayerAndMap, state => ({ ...state, loading: true })),
  on(MapVehicleInstanceActions.getAllByPlayerAndMapSuccess, (state, action) => mapVehicleInstanceAdapter.setAll(action.result.data, { ...state, loading: false })),
  on(MapVehicleInstanceActions.getAllByPlayerAndMapFailure, (state, action) => ({ ...state, loading: false, error: action.error }))
);

export function mapVehicleInstanceReducer(state: MapVehicleInstancesState | undefined, action: Action) {
  return reducer(state, action);
}

const selectors = mapVehicleInstanceAdapter.getSelectors();
const featureSelector = (state: AppState) => state['map-vehicle-instances'] as MapVehicleInstancesState;

class MapVehicleInstanceSelectorsType extends AbstractSelectors<MapVehicleInstancesState, MapVehicleInstanceDto> {
  constructor() {
    super(featureSelector, selectors);
  }

  ByPlayerAndMap = (playerId: string, mapId: string) => createSelector(
    featureSelector,
    (state) => state.entities ? Object.values(state.entities).filter((instance) => instance.playerId === playerId && instance.mapId === mapId) : []
  );
}

export const MapVehicleInstanceSelectors = new MapVehicleInstanceSelectorsType();

@Injectable()
export class MapVehicleInstanceEffects extends AbstractEffects<MapVehicleInstancesState, MapVehicleInstanceDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapVehicleInstanceService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapVehicleInstanceActions, MapVehicleInstanceSelectors);
  }

  getAllByPlayerAndMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapVehicleInstanceActions.getAllByPlayerAndMap),
      switchMap(action => {
        return (this.service as MapVehicleInstanceService).getAllByPlayerAndMap(action.request, action.playerId, action.mapId).pipe(
          map(result => MapVehicleInstanceActions.getAllByPlayerAndMapSuccess({ result, playerId: action.playerId, mapId: action.mapId })),
          catchError(error => of(MapVehicleInstanceActions.getAllByPlayerAndMapFailure({ error })))
        );
      })
    )
  );
}

