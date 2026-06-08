import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GameService } from '../../services/game.service';
import { GameActions } from './game.actions';

@Injectable()
export class GameEffects {
  private actions$ = inject(Actions);
  private gameService = inject(GameService);

  loadGames$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.loadGames),
      switchMap(({ page = 1, limit = 10 }) =>
        this.gameService.getGames(page, limit).pipe(
          map((response) =>
            GameActions.loadGamesSuccess({
              games: response.data,
              page: response.page,
              limit: response.limit,
              totalCount: response.totalCount,
            })
          ),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load games';
            return of(GameActions.loadGamesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadAllGames$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.loadAllGames),
      switchMap(() =>
        this.gameService.getAllGames().pipe(
          map((response) => GameActions.loadAllGamesSuccess({ games: response.data })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load all games';
            return of(GameActions.loadAllGamesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.loadGame),
      switchMap(({ id }) =>
        this.gameService.getGame(id).pipe(
          map((game) => GameActions.loadGameSuccess({ game })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load game';
            return of(GameActions.loadGameFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  addGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.addGame),
      switchMap(({ game }) =>
        this.gameService.createGame(game).pipe(
          map((newGame) => GameActions.addGameSuccess({ game: newGame })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to add game';
            return of(GameActions.addGameFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  updateGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.updateGame),
      switchMap(({ game }) =>
        this.gameService.updateGame(game).pipe(
          map((updatedGame) => GameActions.updateGameSuccess({ game: updatedGame })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to update game';
            return of(GameActions.updateGameFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  deleteGame$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GameActions.deleteGame),
      switchMap(({ id }) =>
        this.gameService.deleteGame(id).pipe(
          map(() => GameActions.deleteGameSuccess({ id })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to delete game';
            return of(GameActions.deleteGameFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}