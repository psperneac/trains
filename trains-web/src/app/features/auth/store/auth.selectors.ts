import { createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { AppState } from '../../../store';

export const selectAuthState = (state: AppState) => state['auth'];

export const selectUser = createSelector(selectAuthState, (state: AuthState) => state.user);
export const selectError = createSelector(selectAuthState, (state: AuthState) => state.error);
export const selectLoggedIn = createSelector(selectAuthState, (state: AuthState) => state.loggedIn);

export const selectLoggingIn = createSelector(selectAuthState, (state: AuthState) => state.loggingIn);
export const selectLoggingOut = createSelector(selectAuthState, (state: AuthState) => state.loggingOut);
export const selectRegistering = createSelector(selectAuthState, (state: AuthState) => state.registering);
