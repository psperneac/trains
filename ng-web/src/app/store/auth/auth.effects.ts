import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((response) => {
            const user = {
              _id: response._id,
              username: response.username,
              email: response.email,
              scope: response.scope,
            };
            return AuthActions.loginSuccess({ authToken: response.authToken, user });
          }),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Invalid email or password';
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      ),
      tap(() => {
        this.router.navigate(['/']);
      })
    )
  );

  register = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, username, password }) =>
        this.authService.register(email, username, password).pipe(
          map((response) => {
            const user = {
              _id: response._id,
              username: response.username,
              email: response.email,
              scope: response.scope,
            };
            return AuthActions.registerSuccess({ authToken: response.authToken, user });
          }),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Registration failed. Please try again.';
            return of(AuthActions.registerFailure({ error: errorMessage }));
          })
        )
      ),
      tap(() => {
        this.router.navigate(['/']);
      })
    )
  );

  logout = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) => {
            console.warn('Logout API call failed:', error);
            return of(AuthActions.logoutSuccess());
          })
        )
      ),
      tap(() => {
        this.router.navigate(['/login']);
      })
    )
  );

  changePassword = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.changePassword),
      switchMap(({ oldPassword, newPassword }) =>
        this.authService.changePassword(oldPassword, newPassword).pipe(
          map(() => AuthActions.changePasswordSuccess()),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to change password';
            return of(AuthActions.changePasswordFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}
