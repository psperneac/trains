import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { JobType, PayType } from '../../../models';
import { AppState } from '../../../store';
import { MapPlaceInstanceJobActions, MapPlaceInstanceJobSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class MapPlaceInstanceJobDataService {
  mapPlaceInstanceJobsLoaded$ = this.store.pipe(select(MapPlaceInstanceJobSelectors.Loaded));
  mapPlaceInstanceJobs$ = this.store.pipe(select(MapPlaceInstanceJobSelectors.All));
  mapPlaceInstanceJobsByPlayerAndMapId$ = (playerId: string, mapId: string) =>
    this.store.pipe(select(MapPlaceInstanceJobSelectors.ByPlayerAndMap(playerId, mapId)));
  mapPlaceInstanceJobsByPlaceId$ = (placeId: string) =>
    this.store.pipe(select(MapPlaceInstanceJobSelectors.ByPlace(placeId)));

  constructor(private readonly store: Store<AppState>) {}

  resolveMapPlaceInstanceJobs() {
    return this.store.pipe(
      select(MapPlaceInstanceJobSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapPlaceInstanceJobSelectors.Loading)),
        this.store.pipe(select(MapPlaceInstanceJobSelectors.Loaded))
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapPlaceInstanceJobs: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapPlaceInstanceJobActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data)
    );
  }

  createMapPlaceInstanceJob() {
    this.store.dispatch(
      MapPlaceInstanceJobActions.selectOne({
        payload: {
          name: '',
          description: '',
          type: JobType.DELIVERY,
          startId: '',
          endId: '',
          load: 0,
          payType: PayType.GOLD,
          pay: 0,
          startTime: '',
          mapId: '',
          playerId: '',
          mapPlaceInstanceId: '',
          content: {}
        }
      })
    );
  }

  loadOneMapPlaceInstanceJob(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    if (id) {
      this.store.dispatch(MapPlaceInstanceJobActions.getOne({ uuid: id }));
    }
    return true;
  }
}

export const mapPlaceInstanceJobResolverFn = () =>
  inject(MapPlaceInstanceJobDataService).resolveMapPlaceInstanceJobs();
export const createMapPlaceInstanceJobGuardFn = () =>
  inject(MapPlaceInstanceJobDataService).createMapPlaceInstanceJob();
export const loadOneMapPlaceInstanceJobGuardFn = (route: ActivatedRouteSnapshot) =>
  inject(MapPlaceInstanceJobDataService).loadOneMapPlaceInstanceJob(route);
