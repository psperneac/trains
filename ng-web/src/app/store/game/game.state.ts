import { createReducer, on } from '@ngrx/store';
import { GameDto } from '../../services/game.service';
import { GameActions } from './game.actions';

export interface GameState {
  games: GameDto[];
  allGames: GameDto[];
  selectedGame: GameDto | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
}

export const initialGameState: GameState = {
  games: [],
  allGames: [],
  selectedGame: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalCount: 0,
};

export const gameReducer = createReducer(
  initialGameState,

  on(GameActions.loadGames, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.loadGamesSuccess, (state, { games, page, limit, totalCount }) => ({
    ...state,
    games,
    page,
    limit,
    totalCount,
    loading: false,
    error: null,
  })),

  on(GameActions.loadGamesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.loadAllGames, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.loadAllGamesSuccess, (state, { games }) => ({
    ...state,
    allGames: games,
    loading: false,
    error: null,
  })),

  on(GameActions.loadAllGamesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.loadGame, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.loadGameSuccess, (state, { game }) => ({
    ...state,
    selectedGame: game,
    loading: false,
    error: null,
  })),

  on(GameActions.loadGameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.addGame, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.addGameSuccess, (state, { game }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(GameActions.addGameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.updateGame, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.updateGameSuccess, (state, { game }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(GameActions.updateGameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.deleteGame, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(GameActions.deleteGameSuccess, (state, { id }) => ({
    ...state,
    games: state.games.filter((g) => g.id !== id),
    allGames: state.allGames.filter((g) => g.id !== id),
    loading: false,
    error: null,
  })),

  on(GameActions.deleteGameFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(GameActions.clearGameError, (state) => ({
    ...state,
    error: null,
  })),

  on(GameActions.setSelectedGame, (state, { game }) => ({
    ...state,
    selectedGame: game,
  }))
);