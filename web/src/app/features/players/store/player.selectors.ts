import { createSelector, MemoizedSelector } from '@ngrx/store';
import { playersAdapter, PlayersState } from './player.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { PlayerDto } from '../../../models/player';

const selectors = playersAdapter.getSelectors();
const playersState = (state) => state['players'] as PlayersState;

export class PlayerSelectorsType extends AbstractSelectors<PlayersState, PlayerDto> {
  constructor() {
    super(playersState, selectors);
  }

  ById = (playerId: string) => createSelector(playersState, (state: PlayersState) => {
    return state.entities[playerId];
  })
}

export const PlayerSelectors = new PlayerSelectorsType();
