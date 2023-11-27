import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { isAdmin, isUser } from './auth.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  // role = ADMIN
  public isAdmin$ = this.store.pipe(select(isAdmin));
  // role = USER
  public isUser$ = this.store.pipe(select(isUser));
  // role = ADMIN | USER becauuse admin can see user menu as well
  public isUserOrAdmin$ = combineLatest([this.isAdmin$, this.isUser$])
    .pipe(map(([admin, user]) => admin || user));

  // these are going to be useful once there are more than 2 scopes or I need to check inverse condition
  public isNotAdmin$ = this.isAdmin$.pipe(map(value => !value));
  public isNotUser$ = this.isUser$.pipe(map(value => !value));

  constructor(private store: Store<{}>) {
  }
}
