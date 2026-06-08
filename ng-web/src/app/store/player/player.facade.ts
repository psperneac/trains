import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlayerDto } from '../../services/player.service';
import {
  PlayerActions,
} from './player.actions';
import {
  selectPlayers,
  selectAllPlayers,
  selectSelectedPlayer,
  selectPlayerLoading,
  selectPlayerError,
} from './player.selectors';

@Injectable({ providedIn: 'root' })
export class PlayersFacade {
  private store = inject(Store);

  // Selectors
  players$: Observable<PlayerDto[]> = this.store.select(selectPlayers);
  allPlayers$: Observable<PlayerDto[]> = this.store.select(selectAllPlayers);
  selectedPlayer$: Observable<PlayerDto | null> = this.store.select(selectSelectedPlayer);
  loading$: Observable<boolean> = this.store.select(selectPlayerLoading);
  error$: Observable<string | null> = this.store.select(selectPlayerError);

  // Actions
  loadPlayers(page?: number, limit?: number): void {
    this.store.dispatch(PlayerActions.loadPlayers({ page, limit }));
  }

  loadAllPlayers(): void {
    this.store.dispatch(PlayerActions.loadAllPlayers());
  }

  loadPlayersByUserId(userId: string, page?: number, limit?: number): void {
    this.store.dispatch(PlayerActions.loadPlayersByUserId({ userId, page, limit }));
  }

  loadPlayersByGameId(gameId: string, page?: number, limit?: number): void {
    this.store.dispatch(PlayerActions.loadPlayersByGameId({ gameId, page, limit }));
  }

  setSelectedPlayer(player: PlayerDto | null): void {
    this.store.dispatch(PlayerActions.setSelectedPlayer({ player }));
  }

  clearError(): void {
    this.store.dispatch(PlayerActions.clearPlayerError());
  }
}