import { AbstractActions, IsActionChecker } from '../../../helpers/abstract.actions';
import { MapPlaceDto } from '../../../models/map-place.model';
import { AbstractEntityState, createAdapter, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { Router } from '@angular/router';
import { ActionCreator, Store, createAction, props, createSelector } from '@ngrx/store';
import { AppState } from '../../../store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { Injectable } from '@angular/core';
import { MapPlaceService } from '../services/map-place.service';
import { AbstractSelectors } from 'src/app/helpers/abstract.selectors';
import { PageRequestDto } from '../../../models/pagination.model';
import { NotAllowedCheck, TypedAction } from '@ngrx/store/src/models';
import { PageDto } from '../../../models/page.model';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export class MapPlaceActionsType extends AbstractActions<MapPlaceDto> {
  getAllByMap: ActionCreator<string, (props: ({ request: PageRequestDto, mapId: string } & NotAllowedCheck<{ request: PageRequestDto, mapId: string }>)) => ({ request: PageRequestDto, mapId: string } & TypedAction<string>)>;
  isGetAllByMap: IsActionChecker;
  getAllByMapSuccess: ActionCreator<string, (props: { result: PageDto<MapPlaceDto>; mapId: string; }) => { result: PageDto<MapPlaceDto>; mapId: string; } & TypedAction<string>>;
  isGetAllByMapSuccess: IsActionChecker;
  getAllByMapFailure: ActionCreator<string, (props: { error: any; }) => { error: any; } & TypedAction<string>>;
  isGetAllByMapFailure: IsActionChecker;

  constructor() {
    super('MapPlace');

    this.getAllByMap = createAction(`[MapPlace] Get All By Map`, props<{ request: PageRequestDto, mapId: string }>());
    this.isGetAllByMap = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map`;

    this.getAllByMapSuccess = createAction(`[MapPlace] Get All By Map Success`, props<{ result: PageDto<MapPlaceDto>, mapId: string }>());
    this.isGetAllByMapSuccess = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map Success`;
    this.getAllByMapFailure = createAction(`[MapPlace] Get All By Map Failure`, props<{ error: any }>());
    this.isGetAllByMapFailure = (action: TypedAction<string>) => action.type === `[MapPlace] Get All By Map Failure`;
  }
}

export const MapPlaceActions = new MapPlaceActionsType();

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

export interface MapPlaceState extends AbstractEntityState<MapPlaceDto> {
}

export const mapPlaceAdapter = createAdapter<MapPlaceDto>();
const mapPlaceInitialState = mapPlaceAdapter.getInitialState();
const mapPlaceReducer = defaultCreateReducer(
  MapPlaceActions,
  mapPlaceAdapter,
  mapPlaceInitialState);

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
