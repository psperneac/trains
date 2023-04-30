import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Store, select } from "@ngrx/store";
import { Observable, filter, map, tap, withLatestFrom } from "rxjs";
import { VehicleTypeSelectors } from "./store/vehicle-type.selectors";
import { VehicleTypeActions } from "./store/vehicle-type.actions";

@Injectable({
  providedIn: 'root'
})
export class VehicleTypesResolver implements Resolve<boolean> {
  constructor(private store: Store<{}>) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.store.pipe(
      select(VehicleTypeSelectors.All),
      withLatestFrom(this.store.pipe(select(VehicleTypeSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(VehicleTypeActions.getAll({ request: { unpaged: true }}));
        }
      }),
      filter(([data, _loading]) => !!data && data.length > 0),
      map(([_data, _loading]) => true)
    );
  }
}
