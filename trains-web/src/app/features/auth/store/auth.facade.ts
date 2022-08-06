import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { isAdmin, isUser } from './auth.selectors';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthFacade {
  public isAdmin$ = this.store.pipe(select(isAdmin));
  public isUser$ = this.store.pipe(select(isUser));

  // these are going to be useful once there are more than 2 scopes or I need to check inverse condition
  public isNotAdmin$ = this.isAdmin$.pipe(map(value => !value));
  public isNotUser$ = this.isUser$.pipe(map(value => !value));

  constructor(private store: Store<{}>) {
  }
}
