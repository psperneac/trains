import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { JobType, PayType } from '../../../models';
import { AppState } from '../../../store';
import {
  MapPlaceInstanceJobOfferActions,
  MapPlaceInstanceJobOfferSelectors
} from '../store/map-place-instance-job-offer.store';

@Injectable({ providedIn: 'root' })
export class MapPlaceInstanceJobOfferDataService {
  mapPlaceInstanceJobOffersLoaded$ = this.store.pipe(
    select(MapPlaceInstanceJobOfferSelectors.Loaded)
  );
  mapPlaceInstanceJobOffers$ = this.store.pipe(select(MapPlaceInstanceJobOfferSelectors.All));
  mapPlaceInstanceJobOffersByPlayerAndMapId$ = (playerId: string, mapId: string) =>
    this.store.pipe(select(MapPlaceInstanceJobOfferSelectors.ByPlayerAndMap(playerId, mapId)));
  mapPlaceInstanceJobOffersByPlaceId$ = (placeId: string) =>
    this.store.pipe(select(MapPlaceInstanceJobOfferSelectors.ByPlace(placeId)));

  constructor(private readonly store: Store<AppState>) {}

  resolveMapPlaceInstanceJobOffers() {
    return this.store.pipe(
      select(MapPlaceInstanceJobOfferSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapPlaceInstanceJobOfferSelectors.Loading)),
        this.store.pipe(select(MapPlaceInstanceJobOfferSelectors.Loaded))
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapPlaceInstanceJobOffers: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(
            MapPlaceInstanceJobOfferActions.getAll({ request: { unpaged: true } })
          );
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data)
    );
  }

  createMapPlaceInstanceJobOffer() {
    this.store.dispatch(
      MapPlaceInstanceJobOfferActions.selectOne({
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
          jobOfferExpiry: '',
          mapId: '',
          playerId: '',
          mapPlaceInstanceId: '',
          content: {}
        }
      })
    );
  }

  loadOneMapPlaceInstanceJobOffer(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    if (id) {
      this.store.dispatch(MapPlaceInstanceJobOfferActions.getOne({ uuid: id }));
    }
    return true;
  }
}

export const mapPlaceInstanceJobOfferResolverFn = () =>
  inject(MapPlaceInstanceJobOfferDataService).resolveMapPlaceInstanceJobOffers();
export const createMapPlaceInstanceJobOfferGuardFn = () =>
  inject(MapPlaceInstanceJobOfferDataService).createMapPlaceInstanceJobOffer();
export const loadOneMapPlaceInstanceJobOfferGuardFn = (route: ActivatedRouteSnapshot) =>
  inject(MapPlaceInstanceJobOfferDataService).loadOneMapPlaceInstanceJobOffer(route);
