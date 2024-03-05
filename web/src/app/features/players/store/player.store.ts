import { Action, Store, createSelector } from '@ngrx/store';
import { AbstractActions } from '../../../helpers/abstract.actions';
import { AbstractEntityState, createAdapter, createInitialState, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { PlayerDto } from '../../../models/player';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { AppState } from '../../../store';
import { PlayerService } from '../services/player.service';

class PlayerActionsType extends AbstractActions<PlayerDto> {
  constructor() {
    super('Player');
  }
}

export const PlayerActions = new PlayerActionsType();

export interface PlayersState extends AbstractEntityState<PlayerDto> {
}

export const playersAdapter = createAdapter<PlayerDto>();
const playerInitialState = createInitialState(playersAdapter);
const playerReducerInternal = defaultCreateReducer(PlayerActions, playersAdapter, playerInitialState);

export function playerReducer(state: PlayersState | undefined, action: Action) {
  return playerReducerInternal(state, action);
}

const selectors = playersAdapter.getSelectors();
const playersState = (state) => state['players'] as PlayersState;

class PlayerSelectorsType extends AbstractSelectors<PlayersState, PlayerDto> {
  constructor() {
    super(playersState, selectors);
  }

  ById = (playerId: string) => createSelector(playersState, (state: PlayersState) => {
    return state.entities[playerId];
  })
}

export const PlayerSelectors = new PlayerSelectorsType();

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
