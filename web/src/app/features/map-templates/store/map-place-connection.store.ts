import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ActionCreator, createAction, createSelector, props, Store } from "@ngrx/store";
import { NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { AbstractActions, IsActionChecker } from "../../../helpers/abstract.actions";
import { AbstractEffects } from "../../../helpers/abstract.effects";
import { AbstractEntityState, createAdapter, defaultCreateReducer } from "../../../helpers/abstract.reducer";
import { MapPlaceConnectionDto } from "../../../models/map-place-connection.model";
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AppState } from "../../../store";
import { MapPlaceConnectionService } from "../services/map-place-connection.service";
import { AbstractSelectors } from "../../../helpers/abstract.selectors";

export class MapPlaceConnectionActionsType extends AbstractActions<MapPlaceConnectionDto> {
  getAllByMap: ActionCreator<string, (props: ({ request: PageRequestDto, mapId: string } & NotAllowedCheck<{ request: PageRequestDto, mapId: string }>)) => ({ request: PageRequestDto, mapId: string } & TypedAction<string>)>;
  isGetAllByMap: IsActionChecker;
  getAllByMapSuccess: ActionCreator<string, (props: { result: PageDto<MapPlaceConnectionDto>; mapId: string; }) => { result: PageDto<MapPlaceConnectionDto>; mapId: string; } & TypedAction<string>>;
  isGetAllByMapSuccess: IsActionChecker;
  getAllByMapFailure: ActionCreator<string, (props: { error: any; }) => { error: any; } & TypedAction<string>>;
  isGetAllByMapFailure: IsActionChecker;

  constructor() {
    super('MapPlaceConnection');

    this.getAllByMap = createAction(`[MapPlaceConnection] Get All By Map`, props<{ request: PageRequestDto, mapId: string }>());
    this.isGetAllByMap = (action: TypedAction<string>) => action.type === `[MapPlaceConnection] Get All By Map`;

    this.getAllByMapSuccess = createAction(`[MapPlaceConnection] Get All By Map Success`, props<{ result: PageDto<MapPlaceConnectionDto>, mapId: string }>());
    this.isGetAllByMapSuccess = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map Success`;
    this.getAllByMapFailure = createAction(`[MapPlaceConnection] Get All By Map Failure`, props<{ error: any }>());
    this.isGetAllByMapFailure = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map Failure`;
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


  getAllByMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceConnectionActions.getAllByMap),
      switchMap(action => {
        return (this.service as MapPlaceConnectionService).getAllByMap(action.request, action.mapId).pipe(
          map(result => MapPlaceConnectionActions.getAllByMapSuccess({ result, mapId: action.mapId })),
          catchError(error => of(MapPlaceConnectionActions.getAllByMapFailure({ error })))
        );
      })
    )
  );
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

  ByMapId = (mapId: string) => createSelector(featureState, state => {
    const ret = Object.values(state.entities).filter(mp => mp.mapId === mapId);
    return ret;
  });
}

export const MapPlaceConnectionSelectors = new MapPlaceConnectionSelectorsType();
