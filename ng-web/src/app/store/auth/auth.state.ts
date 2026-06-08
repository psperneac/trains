import { createReducer, on } from '@ngrx/store';
import { AuthUser, GameDto, PlayerDto } from './auth.actions';
import { AuthActions } from './auth.actions';

export interface AuthState {
  authToken: string | null;
  userId: string | null;
  userScope: string | null;
  currentGameId: string | null;
  currentGame: GameDto | null;
  currentPlayerId: string | null;
  currentPlayer: PlayerDto | null;
  isLoading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  authToken: null,
  userId: null,
  userScope: null,
  currentGameId: null,
  currentGame: null,
  currentPlayerId: null,
  currentPlayer: null,
  isLoading: false,
  error: null,
};

export const AUTH_TOKEN_KEY = 'authToken';

// JWT token expires in 600 seconds (10 minutes) - logout 5 seconds before expiry
const JWT_EXPIRATION_SECONDS = 600;
const AUTO_LOGOUT_BUFFER_SECONDS = 5;
const AUTO_LOGOUT_TIMEOUT_MS = (JWT_EXPIRATION_SECONDS - AUTO_LOGOUT_BUFFER_SECONDS) * 1000;

let autoLogoutTimeoutId: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoLogout(logoutFn: () => void) {
  if (autoLogoutTimeoutId) {
    clearTimeout(autoLogoutTimeoutId);
    autoLogoutTimeoutId = null;
  }
  autoLogoutTimeoutId = setTimeout(() => {
    console.log('Auto-logout: token expired');
    logoutFn();
  }, AUTO_LOGOUT_TIMEOUT_MS);
}

function cancelAutoLogout() {
  if (autoLogoutTimeoutId) {
    clearTimeout(autoLogoutTimeoutId);
    autoLogoutTimeoutId = null;
  }
}

function parseToken(token: string): { userId: string | null; userScope: string | null } {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.sub || payload.userId || null,
      userScope: payload.scope || null,
    };
  } catch {
    return { userId: null, userScope: null };
  }
}

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return Date.now() < payload.exp * 1000;
    }
    return true;
  } catch {
    return false;
  }
}

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { authToken, user }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    const { userId, userScope } = parseToken(authToken);
    return {
      ...state,
      authToken,
      userId,
      userScope,
      isLoading: false,
      error: null,
    };
  }),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.registerSuccess, (state, { authToken, user }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    const { userId, userScope } = parseToken(authToken);
    return {
      ...state,
      authToken,
      userId,
      userScope,
      isLoading: false,
      error: null,
    };
  }),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(AuthActions.logoutSuccess, (state) => {
    cancelAutoLogout();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return {
      ...initialAuthState,
    };
  }),

  on(AuthActions.changePassword, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(AuthActions.changePasswordSuccess, (state) => ({
    ...state,
    isLoading: false,
  })),

  on(AuthActions.changePasswordFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(AuthActions.initializeAuth, (state) => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken && isTokenValid(storedToken)) {
      const { userId, userScope } = parseToken(storedToken);
      if (userId) {
        return {
          ...state,
          authToken: storedToken,
          userId,
          userScope,
        };
      }
    } else if (storedToken) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return state;
  }),

  on(AuthActions.restoreSession, (state, { authToken, user }) => {
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    return {
      ...state,
      authToken,
      userId: user._id,
      userScope: user.scope,
    };
  }),

  on(AuthActions.setCurrentGame, (state, { game }) => {
    const userId = state.userId;
    if (userId && game) {
      const storageKey = `currentGame_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(game));
      return {
        ...state,
        currentGameId: game.id,
        currentGame: game,
      };
    } else if (userId && !game) {
      const storageKey = `currentGame_${userId}`;
      localStorage.removeItem(storageKey);
      return {
        ...state,
        currentGameId: null,
        currentGame: null,
      };
    }
    return state;
  }),

  on(AuthActions.setCurrentPlayer, (state, { player }) => {
    const userId = state.userId;
    if (userId && player) {
      const storageKey = `currentPlayer_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(player));
      return {
        ...state,
        currentPlayerId: player.id,
        currentPlayer: player,
      };
    } else if (userId && !player) {
      const storageKey = `currentPlayer_${userId}`;
      localStorage.removeItem(storageKey);
      return {
        ...state,
        currentPlayerId: null,
        currentPlayer: null,
      };
    }
    return state;
  }),

  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  }))
);
