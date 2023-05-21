import { ActivatedRouteSnapshot } from '@angular/router';
import { AppState } from '../store';
import { Action, Store } from '@ngrx/store';

export class LoadOneGuard  {
  constructor(
    private store: Store<AppState>,
    private onLoad: (id: string) => Action
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(this.onLoad(id));
    return true;
  }
}
