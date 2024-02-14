import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { AppState } from '../store';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
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
      mergeMap(action => {
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
      mergeMap(action =>
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
      mergeMap(action =>
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
      mergeMap(action =>
        this.service.update(action.payload.id, action.payload).pipe(
          map(result => this.actions.updateSuccess({result})),
          catchError(error => of(this.actions.updateFailure({error})))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.delete),
      mergeMap(action =>
        this.service.delete(action.uuid).pipe(
          map(result => this.actions.deleteSuccess({result: action.uuid})),
          catchError(error => of(this.actions.deleteFailure({error})))
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
    ), { dispatch: false }
  );

  onCreateSuccessLoadCurrentPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(this.actions.createSuccess),
      withLatestFrom(this.store.pipe(select(this.selectors.CurrentPageRequest))),
      map(([_action, currentPageRequest]) => this.actions.getAll({ request: currentPageRequest }))
    )
  );
}
