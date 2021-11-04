import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {AuthService} from '../services/auth.service';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutFailure,
  logoutSuccess,
  register, registerFailure,
  registerSuccess
} from './auth.actions';
import {catchError, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {of} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {selectLoggedIn, selectUser} from './auth.selectors';
import {AppState, routerSelectReturnUrl} from '../../../store';
import {Router} from '@angular/router';
import {alertWarning, alertError} from '../../../helpers/alert.actions';

@Injectable()
export class AuthEffects {

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      switchMap(action => {
        return this.service.login(action.email, action.password).pipe(
          map(user => loginSuccess({user})),
          catchError(err => of(loginFailure({error: err})))
        );
      })
    )
  );

  // after login, navigate to last page or /home
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      withLatestFrom(
        this.store.pipe(select(selectLoggedIn)),
        this.store.pipe(select(selectUser)),
        this.store.pipe(select(routerSelectReturnUrl))),
      map(([_action, loggedIn, _user, returnUrl]) => {
        if(loggedIn) {
          console.log('LoggedIn - Navigating to Home');
          this.router.navigate([returnUrl || '/home']);
        }
        return {type: 'NO-OP'};
      })
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      switchMap(_action => {
        return this.service.logout().pipe(
          map(result => logoutSuccess({result})),
          catchError(err => of(logoutFailure({error: err})))
        );
      })
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logoutSuccess),
      map(_action => {
        this.router.navigate(['/auth/login']);
        return {type: 'NO-OP'};
      })
    )
  );

  failure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginFailure, logoutFailure, registerFailure),
      map(action => alertError({message: action.error}))
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(register),
      switchMap(action => {
        return this.service.register(action.username, action.email, action.password).pipe(
          map(user => registerSuccess({user})),
          catchError(err => of(registerFailure({error: err})))
        );
      })
    )
  );

  // after login, navigate to last page or /home
  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(registerSuccess),
      map((_action) => {
        this.router.navigate(['/login']);
        return alertWarning({message: 'User registered successfully'});
      })
    )
  );

  constructor(
    private readonly actions$: Actions,
    private readonly service: AuthService,
    private readonly store: Store<AppState>,
    private readonly router: Router) {}
}
