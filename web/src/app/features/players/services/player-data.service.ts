import { Injectable, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, withLatestFrom, tap, map, filter } from 'rxjs';
import { PlayerDto } from '../../../models/player';
import { selectUser } from '../../auth/store';
import { PlayerSelectors, PlayerActions } from '../store';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';

@Injectable({providedIn: 'root'})
export class PlayerDataService {
  constructor(private readonly store: Store<{}>) {}

  resolvePlayers(): Observable<PlayerDto[]> {
    return this.store.pipe(
      select(PlayerSelectors.All),
      withLatestFrom(this.store.pipe(select(PlayerSelectors.Loading))),
      tap(([data, loading]) => {
        if (!data && !loading) {
          this.store.dispatch(PlayerActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading]) => data),
      filter(data => !!data),
    );
  }

  createPlayer(): Observable<boolean> {
    return this.store.pipe(select(selectUser),
      map(user => {
        if (!user) {
          return false;
        }

        this.store.dispatch(PlayerActions.selectOne({
          payload: {
            userId: user.id,
            mapId: 'f7423c20-4cdc-4099-9081-ec1d67181ada',
            name: '',
            description: '',
            content: {},
          }
        }));

        return true;
      }));
  }

  loadOnePlayer(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(PlayerActions.getOne({ uuid: id }));
    return true;
  }
}

export const playersResolveFn: ResolveFn<any> =
  (_route, _state) =>
    inject(PlayerDataService).resolvePlayers();

export const createPlayerGuardFn: CanActivateFn =
  (_route, _state) =>
    inject(PlayerDataService).createPlayer();

export const loadOnePlayerGuardFn: CanActivateFn =
  (route: ActivatedRouteSnapshot, _state) =>
    inject(PlayerDataService).loadOnePlayer(route);
