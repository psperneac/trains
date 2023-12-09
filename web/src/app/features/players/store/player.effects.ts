import { Injectable } from '@angular/core';
import { PlayerDto } from '../../../models/player';
import { AppState } from '../../../store';
import { PlayerService } from '../services/player.service';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { Router } from '@angular/router';
import { PlayerActions } from './player.actions';
import { PlayersState } from './player.reducer';
import { PlayerSelectors } from './player.selectors';

@Injectable()
export class PlayerEffects extends AbstractEffects<PlayersState, PlayerDto> {
  constructor(
    readonly actions$: Actions,
    readonly playerService: PlayerService,
    readonly store: Store<AppState>,
    readonly router: Router) {
    super(actions$, playerService, store, router, PlayerActions, PlayerSelectors);
  }
}
