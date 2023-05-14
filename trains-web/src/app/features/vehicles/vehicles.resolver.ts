import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { VehicleActions } from './store/vehicle.actions';
import { VehicleSelectors } from './store/vehicle.selectors';

@Injectable({ providedIn: 'root' })
export class VehiclesResolver implements Resolve<boolean> {
  constructor(private store: Store<{}>) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.store.pipe(
      select(VehicleSelectors.All),
      withLatestFrom(this.store.pipe(select(VehicleSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(VehicleActions.getAll({ request: { unpaged: true } }));
        }
      }),
      filter(([data, loading]) => !!data && data.length > 0),
      map(([data, loading]) => true)
    );
  }
}
