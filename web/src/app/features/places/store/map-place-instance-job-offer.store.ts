import { state } from '@angular/animations';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { createAction, createFeatureSelector, createSelector, on, props, Store } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store/src/models';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AbstractActions, ActionCreatorFn } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapPlaceInstanceJobOfferDto } from '../../../models';
import {
  AppState,
  ByPlaceRequestType,
  ByPlaceResponseType,
  ByPlayerAndMapRequestType,
  ByPlayerAndMapResponseType,
  ErrorType
} from '../../../store';
import { featureSelector } from '../../game/store/game.selectors';
import { MapPlaceInstanceJobOfferService } from '../services/map-place-instance-job-offer.service';
import { MapPlaceInstanceJobsState } from './map-place-instance-job.store';

class MapPlaceInstanceJobOfferActionsType extends AbstractActions<MapPlaceInstanceJobOfferDto> {
  getAllByPlayerAndMap: ActionCreator<string, ActionCreatorFn<ByPlayerAndMapRequestType>>;
  getAllByPlayerAndMapSuccess: ActionCreator<
    string,
    ActionCreatorFn<ByPlayerAndMapResponseType<MapPlaceInstanceJobOfferDto>>
  >;
  getAllByPlayerAndMapFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  getAllByPlace: ActionCreator<string, ActionCreatorFn<ByPlaceRequestType>>;
  getAllByPlaceSuccess: ActionCreator<
    string,
    ActionCreatorFn<ByPlaceResponseType<MapPlaceInstanceJobOfferDto>>
  >;
  getAllByPlaceFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  constructor() {
    super('MapPlaceInstanceJobOffer');

    this.getAllByPlayerAndMap = createAction(
      `[MapPlaceInstanceJobOffer] Get All By Map`,
      props<ByPlayerAndMapRequestType>()
    );
    this.getAllByPlayerAndMapSuccess = createAction(
      `[MapPlaceInstanceJobOffer] Get All By Map Success`,
      props<ByPlayerAndMapResponseType<MapPlaceInstanceJobOfferDto>>()
    );
    this.getAllByPlayerAndMapFailure = createAction(
      `[MapPlaceInstanceJobOffer] Get All By Map Failure`,
      props<ErrorType>()
    );

    this.getAllByPlace = createAction(
      `[MapPlaceInstanceJobOffer] Get All By Place`,
      props<ByPlaceRequestType>()
    );
    this.getAllByPlaceSuccess = createAction(
      `[MapPlaceInstanceJobOffer] Get All By Place Success`,
      props<ByPlaceResponseType<MapPlaceInstanceJobOfferDto>>()
    );
    this.getAllByPlaceFailure = createAction(
      `[MapPlaceInstanceJobOffer] Get All By Place Failure`,
      props<ErrorType>()
    );
  }
}

export const MapPlaceInstanceJobOfferActions = new MapPlaceInstanceJobOfferActionsType();

export interface MapPlaceInstanceJobOfferState
  extends AbstractEntityState<MapPlaceInstanceJobOfferDto> {}

export const mapPlaceInstanceJobOfferAdapter = createAdapter<MapPlaceInstanceJobOfferDto>();
export const mapPlaceionstanceJobOfferInitialState =
  mapPlaceInstanceJobOfferAdapter.getInitialState();

const reducer = defaultCreateReducer(
  MapPlaceInstanceJobOfferActions,
  mapPlaceInstanceJobOfferAdapter,
  mapPlaceionstanceJobOfferInitialState,
  on(MapPlaceInstanceJobOfferActions.getAllByPlayerAndMap, state => ({ ...state, loading: true })),
  on(MapPlaceInstanceJobOfferActions.getAllByPlayerAndMapSuccess, (state, action) =>
    mapPlaceInstanceJobOfferAdapter.setAll(action.result.data, {
      ...state,
      loading: false,
      loaded: true
    })
  ),
  on(MapPlaceInstanceJobOfferActions.getAllByPlayerAndMapFailure, state => ({
    ...state,
    loading: false,
    loaded: false
  })),
  on(MapPlaceInstanceJobOfferActions.getAllByPlace, state => ({ ...state, loading: true })),
  on(MapPlaceInstanceJobOfferActions.getAllByPlaceSuccess, (state, action) =>
    mapPlaceInstanceJobOfferAdapter.setAll(action.result.data, {
      ...state,
      loading: false,
      loaded: true
    })
  ),
  on(MapPlaceInstanceJobOfferActions.getAllByPlaceFailure, state => ({
    ...state,
    loading: false,
    loaded: false
  }))
);

export function mapPlaceInstanceJobOfferReducer(state, action) {
  return reducer(state, action);
}

const selectors = mapPlaceInstanceJobOfferAdapter.getSelectors();
const featureSelector = (state: any) =>
  state['mapPlaceInstanceJobOffers'] as MapPlaceInstanceJobOfferState;

class MapPlaceInstanceJobOfferSelectorsType extends AbstractSelectors<
  MapPlaceInstanceJobOfferState,
  MapPlaceInstanceJobOfferDto
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
      entities => Object.values(entities).filter(job => job.placeId === placeId)
    );
}

export const MapPlaceInstanceJobOfferSelectors = new MapPlaceInstanceJobOfferSelectorsType();

@Injectable()
export class MapPlaceInstanceJobOfferEffects extends AbstractEffects<
  MapPlaceInstanceJobOfferState,
  MapPlaceInstanceJobOfferDto
> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapPlaceInstanceJobOfferService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(
      actions$,
      service,
      store,
      router,
      MapPlaceInstanceJobOfferActions,
      MapPlaceInstanceJobOfferSelectors
    );
  }

  getAllByPlayerAndMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceInstanceJobOfferActions.getAllByPlayerAndMap),
      switchMap(action =>
        this.service.getAllByPlayerAndMap(action.request, action.playerId, action.mapId).pipe(
          map(result =>
            MapPlaceInstanceJobOfferActions.getAllByPlayerAndMapSuccess({
              result,
              playerId: action.playerId,
              mapId: action.mapId
            })
          ),
          catchError(error =>
            of(MapPlaceInstanceJobOfferActions.getAllByPlayerAndMapFailure(error))
          )
        )
      )
    )
  );

  getAllByPlace$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MapPlaceInstanceJobOfferActions.getAllByPlace),
      switchMap(action =>
        this.service.getAllByPlace(action.request, action.placeId).pipe(
          map(result =>
            MapPlaceInstanceJobOfferActions.getAllByPlaceSuccess({
              result,
              placeId: action.placeId
            })
          ),
          catchError(error => of(MapPlaceInstanceJobOfferActions.getAllByPlaceFailure(error)))
        )
      )
    )
  );
}
