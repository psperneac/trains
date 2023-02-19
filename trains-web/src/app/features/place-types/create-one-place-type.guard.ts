import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { PlaceTypeActions } from './store/place-type.actions';

@Injectable({
  providedIn: 'root'
})
export class CreateOnePlaceTypeGuard implements CanActivate {
  constructor(
    private store: Store<AppState>
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    this.store.dispatch(PlaceTypeActions.selectOne({ payload: {
      type: '',
      name: '',
      description: ''
    }}));
    return true;
  }
}
