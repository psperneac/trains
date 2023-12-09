import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { AppState } from '../../../store';
import { PlaceConnectionService } from '../services/place-connection.service';
import { PlaceConnectionActions } from './place-connection.actions';
import { PlaceConnectionState } from './place-connection.reducer';
import { PlaceConnectionSelectors } from './place-connection.selectors';

@Injectable()
export class PlaceConnectionEffects extends AbstractEffects<PlaceConnectionState, PlaceConnectionDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: PlaceConnectionService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, PlaceConnectionActions, PlaceConnectionSelectors);
  }
}
