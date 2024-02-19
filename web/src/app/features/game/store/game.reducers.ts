import { Action, createReducer, on } from '@ngrx/store';
import { setSelectedPlayer } from './game.actions';

export interface GameState {
  selectedPlayerId: string | null;
}

export const initialState: GameState = {
  selectedPlayerId: null,
};

export const gameReducer = createReducer(
  initialState,
  on(setSelectedPlayer, (state, { playerId }) => ({
    ...state,
    selectedPlayerId: playerId,
  }))
);

export function reducer(state: GameState | undefined, action: Action) {
  return gameReducer(state, action);
}
