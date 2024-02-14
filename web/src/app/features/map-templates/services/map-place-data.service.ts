import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from "@ngrx/store";
import { Observable, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { MapPlaceDto } from '../../../models/map-place.model';
import { MapPlaceActions, MapPlaceSelectors } from '../store/map-place.store';

@Injectable({ providedIn: 'root' })
export class MapPlaceDataService {

  mapPlacesLoaded$ = this.store.pipe(select(MapPlaceSelectors.Loaded));
  mapPlaces$ = this.store.pipe(select(MapPlaceSelectors.All));
  mapPlacesByMapId$ = (mapId: string) => this.store.pipe(select(MapPlaceSelectors.ByMapId(mapId)));

  constructor(private readonly store: Store<{}>) {}

  resolveMapPlaces(): Observable<MapPlaceDto[]> {
    return this.store.pipe(
      select(MapPlaceSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapPlaceSelectors.Loading)),
        this.store.pipe(select(MapPlaceSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapPlaces: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapPlaceActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createMapPlace(_route: ActivatedRouteSnapshot) {
    this.store.dispatch(MapPlaceActions.selectOne({ payload: {
        mapId: '',
        placeId: '',
      }}));
    return true;
  }

  loadOneMapPlace(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapPlaceActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapPlacesResolveFn =
  (_route: ActivatedRouteSnapshot) =>
    inject(MapPlaceDataService).resolveMapPlaces();

export const createMapPlaceGuardFn =
  (route: ActivatedRouteSnapshot) =>
    inject(MapPlaceDataService).createMapPlace(route);

export const loadOneMapPlaceGuardFn =
  (route: ActivatedRouteSnapshot) =>
    inject(MapPlaceDataService).loadOneMapPlace(route);
