import { inject } from '@angular/core';
import { ResolveFn, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map, switchMap, of, take, filter } from 'rxjs';
import { GameActions, selectAllGames, selectGameLoading } from '../store/game';
import { GameDto } from '../services/game.service';

export const gameResolver: ResolveFn<GameDto[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<GameDto[]> => {
  const store = inject(Store);

  return store.select(selectAllGames).pipe(
    switchMap((games) => {
      if (games.length === 0) {
        return store.select(selectGameLoading).pipe(
          filter((loading) => !loading),
          take(1),
          switchMap(() => {
            // Check again if games are loaded after loading finished
            let hasGames = false;
            store.select(selectAllGames).subscribe((g) => (hasGames = g.length > 0)).unsubscribe();
            if (!hasGames) {
              store.dispatch(GameActions.loadAllGames());
            }
            return store.select(selectAllGames);
          })
        );
      }
      return of(games);
    }),
    take(1)
  );
};

export const selectedGameResolver: ResolveFn<GameDto | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<GameDto | null> => {
  const store = inject(Store);
  const gameId = route.paramMap.get('id');

  if (!gameId) {
    return of(null);
  }

  return store.select(selectAllGames).pipe(
    switchMap((games: GameDto[]) => {
      const existingGame = games.find((g) => g.id === gameId);
      if (existingGame) {
        return of([existingGame]);
      }
      // Game not found, dispatch load and wait for store to update
      store.dispatch(GameActions.loadGame({ id: gameId }));
      return store.select(selectAllGames);
    }),
    map((games: GameDto[]) => games.find((g) => g.id === gameId) || null),
    take(1)
  );
};