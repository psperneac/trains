import { PlayerDto } from '../../../models/player';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer,
} from '../../../helpers/abstract.reducer';
import { PlayerActions } from './player.actions';
import { Action } from '@ngrx/store';

export interface PlayersState extends AbstractEntityState<PlayerDto> {
}

export const playersAdapter = createAdapter<PlayerDto>();
const playerInitialState = createInitialState(playersAdapter);
const playerReducer = defaultCreateReducer(PlayerActions, playersAdapter, playerInitialState);

export function reducer(state: PlayersState | undefined, action: Action) {
  return playerReducer(state, action);
}
