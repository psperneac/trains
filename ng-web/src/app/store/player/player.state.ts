import { createReducer, on } from '@ngrx/store';
import { PlayerDto } from '../../services/player.service';
import { PlayerActions } from './player.actions';

export interface PlayerState {
  players: PlayerDto[];
  allPlayers: PlayerDto[];
  selectedPlayer: PlayerDto | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
}

export const initialPlayerState: PlayerState = {
  players: [],
  allPlayers: [],
  selectedPlayer: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalCount: 0,
};

export const playerReducer = createReducer(
  initialPlayerState,

  on(PlayerActions.loadPlayers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlayerActions.loadPlayersSuccess, (state, { players, page, limit, totalCount }) => ({
    ...state,
    players,
    page,
    limit,
    totalCount,
    loading: false,
    error: null,
  })),

  on(PlayerActions.loadPlayersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlayerActions.loadAllPlayers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlayerActions.loadAllPlayersSuccess, (state, { players }) => ({
    ...state,
    allPlayers: players,
    loading: false,
    error: null,
  })),

  on(PlayerActions.loadAllPlayersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlayerActions.loadPlayersByUserId, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlayerActions.loadPlayersByUserIdSuccess, (state, { players }) => ({
    ...state,
    players,
    loading: false,
    error: null,
  })),

  on(PlayerActions.loadPlayersByUserIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlayerActions.loadPlayersByGameId, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlayerActions.loadPlayersByGameIdSuccess, (state, { players }) => ({
    ...state,
    players,
    loading: false,
    error: null,
  })),

  on(PlayerActions.loadPlayersByGameIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlayerActions.setSelectedPlayer, (state, { player }) => ({
    ...state,
    selectedPlayer: player,
  })),

  on(PlayerActions.clearPlayerError, (state) => ({
    ...state,
    error: null,
  }))
);