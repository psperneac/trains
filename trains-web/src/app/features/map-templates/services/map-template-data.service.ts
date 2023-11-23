import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, withLatestFrom, filter, map, tap } from 'rxjs';
import { MapTemplateDto } from '../../../models/map-template.model';
import { MapTemplateActions, MapTemplateSelectors } from '../store';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MapTemplateDataService {
  constructor(private readonly store: Store<{}>) {}

  resolveMapTemplates(): Observable<MapTemplateDto[]> {
    return this.store.pipe(
      select(MapTemplateSelectors.All),
      withLatestFrom(this.store.pipe(select(MapTemplateSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(MapTemplateActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading]) => data),
      filter(data => !!data && data.length > 0),
    );
  }

  createMapTemplate(_route: ActivatedRouteSnapshot) {
    this.store.dispatch(MapTemplateActions.selectOne({ payload: {
        name: '',
        description: '',
        content: {},
      }}));
    return true;
  }

  loadOneMapTemplate(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapTemplateActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapTemplatesResolversFn: ResolveFn<MapTemplateDto[]> =
  (_route, _state) =>
    inject(MapTemplateDataService).resolveMapTemplates();

export const createMapTemplateGuardFn: CanActivateFn =
  (route, _state) =>
    inject(MapTemplateDataService).createMapTemplate(route);

export const loadOneMapTemplateGuardFn: CanActivateFn =
  (route, _state) =>
    inject(MapTemplateDataService).loadOneMapTemplate(route);
