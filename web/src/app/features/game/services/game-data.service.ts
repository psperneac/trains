import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';
import { AppState } from '../../../store';
import { PlayerDataService } from '../../players/services/player-data.service';
import { setSelectedPlayer } from '../store/game.actions';
import { getSelectedPlayerId } from '../store/game.selectors';

@Injectable({ providedIn: 'root' })
export class GameDataService {
  constructor(
    private readonly store: Store<AppState>,
    private readonly playerDataService: PlayerDataService
  ) { }

  setSelectedPlayer(playerId: string) {
    this.store.dispatch(setSelectedPlayer({ playerId }));
  }

  getSelectedPlayerId$() {
    return this.store.select(getSelectedPlayerId);
  }

  getSelectedPlayer$() {
    return this.store.pipe(
      select(getSelectedPlayerId),
      switchMap(playerId => this.playerDataService.getPlayerById$(playerId))
    );
  }
}
