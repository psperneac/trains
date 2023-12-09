import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import { PlaceActions } from './place.actions';
import { PlaceService } from '../services/place.service';
import { PlacesState } from "./place.reducer";
import { PlaceSelectors } from './place.selectors';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { PlaceDto } from '../../../models/place.model';

@Injectable()
export class PlaceEffects extends AbstractEffects<PlacesState, PlaceDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: PlaceService,
    readonly store: Store<AppState>,
    readonly router: Router) {
    super(actions$, service, store, router, PlaceActions, PlaceSelectors);
  }
}
