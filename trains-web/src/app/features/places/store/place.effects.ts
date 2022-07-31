import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import { PlaceActions } from './place.actions';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { PlaceService } from '../services/place.service';
import { of } from 'rxjs';
import { PlaceSelectors } from './place.selectors';

@Injectable()
export class PlaceEffects {
  getAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.getAll),
      switchMap(action => {
        return this.service.getAll(action.request).pipe(
          map(result => PlaceActions.getAllSuccess({result})),
          catchError(error => of(PlaceActions.getAllFailure({error})))
        );
      })
    )
  );

  getOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.getOne),
      switchMap(action =>
        this.service.get(action.uuid).pipe(
          map(result => PlaceActions.getOneSuccess({result})),
          catchError(error => of(PlaceActions.getOneFailure({error})))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.create),
      switchMap(action =>
        this.service.create(action.payload).pipe(
          map(result => PlaceActions.createSuccess({result})),
          catchError(error => of(PlaceActions.createFailure({error})))
        )
      )
    )
  );

  onCreateSuccessLoadCurrentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.createSuccess),
      withLatestFrom(this.store.pipe(select(PlaceSelectors.CurrentPageRequest))),
      switchMap(([action, currentPageRequest]) => of(PlaceActions.getAll({ request: currentPageRequest })))
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.update),
      switchMap(action =>
        this.service.update(action.payload.id, action.payload).pipe(
          map(result => PlaceActions.createSuccess({result})),
          catchError(error => of(PlaceActions.createFailure({error})))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceActions.delete),
      switchMap(action =>
        this.service.delete(action.uuid).pipe(
          map(result => PlaceActions.deleteSuccess({result}))
        )
      )
    )
  )

  failure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        PlaceActions.getAllFailure,
        PlaceActions.getOneFailure,
        PlaceActions.createFailure,
        PlaceActions.updateFailure,
        PlaceActions.deleteFailure)
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly service: PlaceService,
    private readonly store: Store<AppState>,
    private readonly router: Router) {}
}
