import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import { PlaceActions } from './place.actions';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { PlaceService } from '../services/place.service';
import { of } from 'rxjs';
import { PlaceSelectors } from './place.selectors';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { PlaceDto } from '../../../models/place.model';

@Injectable()
export class PlaceEffects extends AbstractEffects<PlaceDto> {
  onCreateSuccessLoadCurrentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.createSuccess),
      withLatestFrom(this.store.pipe(select(PlaceSelectors.CurrentPageRequest))),
      switchMap(([_action, currentPageRequest]) => of(PlaceActions.getAll({ request: currentPageRequest })))
    )
  );

  constructor(
    readonly actions$: Actions,
    readonly service: PlaceService,
    readonly store: Store<AppState>,
    readonly router: Router) {
    super(actions$, service, store, router, PlaceActions);
  }
}
