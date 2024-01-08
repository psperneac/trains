import { AbstractActions } from '../../../helpers/abstract.actions';
import { MapPlaceDto } from '../../../models/map-place.model';
import { AbstractEntityState } from '../../../helpers/abstract.reducer';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Actions } from '@ngrx/effects';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { Injectable } from '@angular/core';

export class MapPlaceActionsType extends AbstractActions<MapPlaceDto> {
  constructor() {
    super('MapPlace');
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
}

export interface MapPlaceState extends AbstractEntityState<MapPlaceDto> {
}
