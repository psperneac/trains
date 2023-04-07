import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Store, select } from "@ngrx/store";
import { Observable, withLatestFrom, tap, filter, map } from "rxjs";
import { PlaceTypeActions } from "./store/place-type.actions";
import { PlaceTypeSelectors } from "./store/place-type.selectors";

@Injectable({
  providedIn: 'root'
})
export class PlaceTypesResolver implements Resolve<boolean> {
    constructor(private store: Store<{}>) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('OnePlaceResolver', this.store, route, state);
    console.log('OnePlaceResolver.id', route.paramMap.get('id'));

    return this.store.pipe(
      select(PlaceTypeSelectors.All),
      withLatestFrom(this.store.pipe(select(PlaceTypeSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(PlaceTypeActions.getAll({ request: { unpaged: true }}));
        }
      }),
      filter(([data, _loading]) => !!data && data.length > 0),
      map(([_data, _loading]) => true)
    );
  }
}
