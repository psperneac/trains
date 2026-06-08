import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GameDto } from './game.service';
import {
  GameActions,
  selectAllGames,
  selectGames,
  selectSelectedGame,
  selectGameLoading,
  selectGameError,
  selectGamePage,
  selectGameLimit,
  selectGameTotalCount,
  selectHasMoreGames,
} from '../store/game';

@Injectable({ providedIn: 'root' })
export class GamesFacade {
  private store = inject(Store);

  // Selectors
  games$: Observable<GameDto[]> = this.store.select(selectGames);
  allGames$: Observable<GameDto[]> = this.store.select(selectAllGames);
  selectedGame$: Observable<GameDto | null> = this.store.select(selectSelectedGame);
  loading$: Observable<boolean> = this.store.select(selectGameLoading);
  error$: Observable<string | null> = this.store.select(selectGameError);
  page$: Observable<number> = this.store.select(selectGamePage);
  limit$: Observable<number> = this.store.select(selectGameLimit);
  totalCount$: Observable<number> = this.store.select(selectGameTotalCount);
  hasMore$: Observable<boolean> = this.store.select(selectHasMoreGames);

  // Actions
  loadGames(page?: number, limit?: number): void {
    this.store.dispatch(GameActions.loadGames({ page, limit }));
  }

  loadAllGames(): void {
    this.store.dispatch(GameActions.loadAllGames());
  }

  loadGame(id: string): void {
    this.store.dispatch(GameActions.loadGame({ id }));
  }

  addGame(game: Omit<GameDto, 'id'>): void {
    this.store.dispatch(GameActions.addGame({ game }));
  }

  updateGame(game: GameDto): void {
    this.store.dispatch(GameActions.updateGame({ game }));
  }

  deleteGame(id: string): void {
    this.store.dispatch(GameActions.deleteGame({ id }));
  }

  setSelectedGame(game: GameDto | null): void {
    this.store.dispatch(GameActions.setSelectedGame({ game }));
  }

  clearError(): void {
    this.store.dispatch(GameActions.clearGameError());
  }

  // Convenience methods
  selectGame(game: GameDto): void {
    this.store.dispatch(GameActions.setSelectedGame({ game }));
  }

  refreshGames(): void {
    this.store.dispatch(GameActions.loadAllGames());
  }
}