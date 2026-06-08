import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthToken = createSelector(
  selectAuthState,
  (state) => state.authToken
);

export const selectUserId = createSelector(
  selectAuthState,
  (state) => state.userId
);

export const selectUserScope = createSelector(
  selectAuthState,
  (state) => state.userScope
);

export const selectCurrentGame = createSelector(
  selectAuthState,
  (state) => state.currentGame
);

export const selectCurrentPlayer = createSelector(
  selectAuthState,
  (state) => state.currentPlayer
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.authToken
);

export const selectIsAdmin = createSelector(
  selectAuthState,
  (state) => state.userScope === 'admin' || state.userScope === 'ADMIN'
);
