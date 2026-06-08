import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlayerState } from './player.state';

export const selectPlayerState = createFeatureSelector<PlayerState>('player');

export const selectPlayers = createSelector(selectPlayerState, (state) => state.players);

export const selectAllPlayers = createSelector(selectPlayerState, (state) => state.allPlayers);

export const selectSelectedPlayer = createSelector(selectPlayerState, (state) => state.selectedPlayer);

export const selectPlayerLoading = createSelector(selectPlayerState, (state) => state.loading);

export const selectPlayerError = createSelector(selectPlayerState, (state) => state.error);

export const selectPlayerPage = createSelector(selectPlayerState, (state) => state.page);

export const selectPlayerLimit = createSelector(selectPlayerState, (state) => state.limit);

export const selectPlayerTotalCount = createSelector(selectPlayerState, (state) => state.totalCount);

export const selectHasMorePlayers = createSelector(
  selectPlayerState,
  (state) => state.page * state.limit < state.totalCount
);