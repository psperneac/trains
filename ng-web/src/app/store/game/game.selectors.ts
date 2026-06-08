import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game.state';

export const selectGameState = createFeatureSelector<GameState>('game');

export const selectGames = createSelector(selectGameState, (state) => state.games);

export const selectAllGames = createSelector(selectGameState, (state) => state.allGames);

export const selectSelectedGame = createSelector(selectGameState, (state) => state.selectedGame);

export const selectGameLoading = createSelector(selectGameState, (state) => state.loading);

export const selectGameError = createSelector(selectGameState, (state) => state.error);

export const selectGamePage = createSelector(selectGameState, (state) => state.page);

export const selectGameLimit = createSelector(selectGameState, (state) => state.limit);

export const selectGameTotalCount = createSelector(selectGameState, (state) => state.totalCount);

export const selectHasMoreGames = createSelector(
  selectGameState,
  (state) => state.page * state.limit < state.totalCount
);