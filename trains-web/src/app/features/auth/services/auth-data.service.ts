import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';
import { selectLoggedIn, selectUser } from '../store';

@Injectable({ providedIn: 'root' })
export class AuthDataService {
  constructor(private readonly store: Store<{}>, private readonly router: Router) {}

  isAdmin(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.pipe(select(selectUser),
      take(1)
    ).pipe(
      withLatestFrom(
        this.store.pipe(select(selectLoggedIn))),
      switchMap(([user, loggedIn]) => {
        if(!user || !user.username || !user.scope) {
          this.router.navigate(['/auth/login'], { queryParams: {returnUrl: state.url}});
          return of(false);
        }

        if (!!loggedIn && user && user.scope === 'ADMIN') {
          return of(true);
        }

        return of(false);
      })
    )
  }

  isLoggedIn(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.pipe(select(selectUser),
      take(1)
    ).pipe(
      withLatestFrom(
        this.store.pipe(select(selectLoggedIn))),
      switchMap(([user, loggedIn]) => {
        if(!user || !user.username || !user.scope) {
          this.router.navigate(['/auth/login'], { queryParams: {returnUrl: state.url}});
          return of(false);
        }

        return of(!!loggedIn);
      })
    )
  }
}

export const isAdminFn: CanActivateFn = (route, state) =>
  inject(AuthDataService).isAdmin(route, state);

export const isLoggedInFn: CanActivateFn = (route, state) =>
  inject(AuthDataService).isLoggedIn(route, state);
