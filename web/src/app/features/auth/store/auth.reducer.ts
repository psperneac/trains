import {User} from "./auth.model";
import {createReducer, on} from "@ngrx/store";
import {
  login,
  loginFailure,
  loginSuccess,
  logout, logoutFailure,
  logoutSuccess,
  register,
  registerFailure,
  registerSuccess
} from "./auth.actions";

export interface AuthState {
  user: User;
  loggedIn: boolean;
  error: any,

  loggingIn: boolean;
  registering: boolean;
  loggingOut: boolean;
}

export const authInitialState: AuthState = {
  user: undefined,
  loggedIn: false,
  error: undefined,

  loggingIn: false,
  registering: false,
  loggingOut: false
};

export const authReducer = createReducer(
  authInitialState,
  on(login, (state, _action) => ({
    ...state,
    loggingIn: true,
  })),
  on(loginSuccess, (state, action) => ({
    ...state,
    user: action.user,
    loggedIn: true,
    loggingIn: false,
  })),
  on(loginFailure, (state, action) => ({
    ...state,
    user: undefined,
    loggedIn: false,
    loggingIn: false,
    error: action.error
  })),
  on(register, (state, _action) => ({
    ...state,
    registering: true
  })),
  on(registerSuccess, (state, _action) => ({
    ...state,
    registering: false
  })),
  on(registerFailure, (state, action) => ({
    ...state,
    error: action.error,
    registering: false
  })),
  on(logout, (state, _action) => ({
    ...state,
    loggingOut: true
  })),
  on(logoutSuccess, (state, _action) => ({
    ...state,
    user: undefined,
    loggedIn: false,
    loggingOut: false
  })),
  on(logoutFailure, (state, action) => ({
    ...state,
    loggingOut: false,
    error: action.error
  }))
);

