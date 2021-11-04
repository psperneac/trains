import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AppState, routerSelectReturnUrl } from '../../../store';
import { AuthState, selectLoggedIn, selectUser } from '../store';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly allStore: Store<AppState>,
    private readonly store: Store<AuthState>,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.allStore.pipe(select(selectUser),
      take(1)
    ).pipe(
      withLatestFrom(
        this.allStore.pipe(select(selectLoggedIn))),
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
}
