import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, withLatestFrom, filter, map, tap } from 'rxjs';
import { MapTemplateDto } from '../../../models/map-template.model';
import { AppState } from '../../../store';
import { MapTemplateActions, MapTemplateSelectors } from '../store';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class MapTemplateDataService {
  constructor(private readonly store: Store<{}>) {}

  resolveMapTemplates(): Observable<MapTemplateDto[]> {
    return this.store.pipe(
      select(MapTemplateSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapTemplateSelectors.Loading)),
        this.store.pipe(select(MapTemplateSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('Maps: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapTemplateActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
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

export const mapTemplatesResolveFn: ResolveFn<MapTemplateDto[]> =
  (_route, _state) =>
    inject(MapTemplateDataService).resolveMapTemplates();

export const createMapTemplateGuardFn: CanActivateFn =
  (route, _state) =>
    inject(MapTemplateDataService).createMapTemplate(route);

export const loadOneMapTemplateGuardFn: CanActivateFn =
  (route, state) =>
    inject(MapTemplateDataService).loadOneMapTemplate(route);
