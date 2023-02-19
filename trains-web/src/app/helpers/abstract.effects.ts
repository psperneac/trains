import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AppState } from '../store';
import { Router } from '@angular/router';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { AbstractActions } from './abstract.actions';
import { AbstractEntityState } from "./abstract.reducer";
import { AbstractSelectors } from "./abstract.selectors";
import { AbstractService } from './abstract.service';
import { AbstractEntity } from './abstract.entity';

export class AbstractEffects<S extends AbstractEntityState<T>, T extends AbstractEntity> {
  constructor(
    readonly actions$: Actions,
    readonly service: AbstractService<T>,
    readonly store: Store<AppState>,
    readonly router: Router,
    readonly actions: AbstractActions<T>,
    readonly selectors: AbstractSelectors<S, T>) {
    this.actions$ = actions$;
    this.service = service;
    this.store = store;
    this.router = router;
    this.actions = actions;
  }

  getAll$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.getAll),
      switchMap(action => {
        return this.service.getAll(action.request).pipe(
          map(result => this.actions.getAllSuccess({ result })),
          catchError(error => of(this.actions.getAllFailure({error})))
        );
      })
    )
  );

  getOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.getOne),
      switchMap(action =>
        this.service.get(action.uuid).pipe(
          map(result => this.actions.getOneSuccess({result})),
          catchError(error => of(this.actions.getOneFailure({error})))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.create),
      switchMap(action =>
        this.service.create(action.payload).pipe(
          map(result => this.actions.createSuccess({result})),
          catchError(error => of(this.actions.createFailure({error})))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.update),
      switchMap(action =>
        this.service.update(action.payload.id, action.payload).pipe(
          map(result => this.actions.createSuccess({result})),
          catchError(error => of(this.actions.updateFailure({error})))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.delete),
      switchMap(action =>
        this.service.delete(action.uuid).pipe(
          map(result => this.actions.deleteSuccess({result}))
        )
      )
    )
  )

  failure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        this.actions.getAllFailure,
        this.actions.getOneFailure,
        this.actions.createFailure,
        this.actions.updateFailure,
        this.actions.deleteFailure)
    )
  );

  onCreateSuccessLoadCurrentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.createSuccess),
      withLatestFrom(this.store.pipe(select(this.selectors.CurrentPageRequest))),
      switchMap(([_action, currentPageRequest]) => of(this.actions.getAll({ request: currentPageRequest })))
    )
  );
}
