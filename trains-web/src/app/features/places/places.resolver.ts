import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PlaceDto } from '../../models/place.model';
import { PlaceActions, PlaceSelectors } from './store';

@Injectable({ providedIn: 'root' })
export class PlacesResolver implements Resolve<PlaceDto[]> {

  placesLoaded$ = this.store.pipe(select(PlaceSelectors.Loaded));
  places$ = this.store.pipe(select(PlaceSelectors.All));

  constructor(private readonly store: Store<{}>) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PlaceDto[]> | Promise<PlaceDto[]> | PlaceDto[] {
    return this.placesLoaded$.pipe(
      map(loaded => {
        if (!loaded) {
          this.store.dispatch(PlaceActions.getAll({ request: { unpaged: true } }))
        }
      }),
      switchMap(() => this.places$));
  }
}
