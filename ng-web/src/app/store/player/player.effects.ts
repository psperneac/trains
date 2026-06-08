import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { PlayerActions } from './player.actions';

@Injectable()
export class PlayerEffects {
  private actions$ = inject(Actions);
  private playerService = inject(PlayerService);

  loadPlayers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadPlayers),
      switchMap(({ page = 1, limit = 10 }) =>
        this.playerService.getPlayers(page, limit).pipe(
          map((response) =>
            PlayerActions.loadPlayersSuccess({
              players: response.data,
              page: response.page,
              limit: response.limit,
              totalCount: response.totalCount,
            })
          ),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load players';
            return of(PlayerActions.loadPlayersFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadAllPlayers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadAllPlayers),
      switchMap(() =>
        this.playerService.getAllPlayers().pipe(
          map((response) => PlayerActions.loadAllPlayersSuccess({ players: response.data })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load all players';
            return of(PlayerActions.loadAllPlayersFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadPlayersByUserId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadPlayersByUserId),
      switchMap(({ userId, page = 1, limit = 10 }) =>
        this.playerService.getPlayersByUserId(userId, page, limit).pipe(
          map((response) => PlayerActions.loadPlayersByUserIdSuccess({ players: response.data })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load players by user';
            return of(PlayerActions.loadPlayersByUserIdFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadPlayersByGameId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlayerActions.loadPlayersByGameId),
      switchMap(({ gameId, page = 1, limit = 10 }) =>
        this.playerService.getPlayersByGameId(gameId, page, limit).pipe(
          map((response) => PlayerActions.loadPlayersByGameIdSuccess({ players: response.data })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load players by game';
            return of(PlayerActions.loadPlayersByGameIdFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}