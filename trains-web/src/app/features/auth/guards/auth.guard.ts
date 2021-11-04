import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { selectLoggedIn, selectUser } from '../store';
import { select, Store } from '@ngrx/store';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppState } from '../../../store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly allStore: Store<AppState>,
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

        return of(!!loggedIn);
      })
    )
  }
}
