import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game.reducers';

export const featureSelector = createFeatureSelector<GameState>('game');
export const getSelectedPlayerId = createSelector(featureSelector, (state: GameState) => state.selectedPlayerId);
