import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';

import {alertError, alertWarning, alertInfo} from './alert.actions';
import {map} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable()
export class AlertEffects {
  error$ = createEffect(() =>
    this.actions$.pipe(
      ofType(alertError),
      map(action => {
        this.snackBar.open(action.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'alert-error'
        });
        return {type: 'NO-OP'};
      })
    )
  );

  warning$ = createEffect(() =>
    this.actions$.pipe(
      ofType(alertWarning),
      map(action => {
        this.snackBar.open(action.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'alert-warning'
        });
        return {type: 'NO-OP'};
      })
    )
  );

  info$ = createEffect(() =>
    this.actions$.pipe(
      ofType(alertInfo),
      map(action => {
        this.snackBar.open(action.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: 'alert-info'
        });
        return {type: 'NO-OP'};
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly snackBar: MatSnackBar
  ) {}
}
