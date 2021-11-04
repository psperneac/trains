import {createAction, props, union} from "@ngrx/store";
import {User} from "./auth.model";

export const login = createAction('[Auth] Login', props<{email: string, password: string}>());
export const loginSuccess = createAction('[Auth] Login Success', props<{user: User}>());
export const loginFailure = createAction('[Auth] Login Failure', props<{error: any}>());

export const register = createAction('[Auth] Register', props<{username: string, email: string, password: string}>());
export const registerSuccess = createAction('[Auth] Register Success', props<{user: User}>());
export const registerFailure = createAction('[Auth] Register Failure', props<{error: any}>());

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success', props<{result: boolean}>());
export const logoutFailure = createAction('[Auth] Logout Failure', props<{error: any}>());

const authActions = union({
  login,
  loginSuccess,
  loginFailure,
  register,
  registerSuccess,
  registerFailure,
  logout,
  logoutSuccess,
  logoutFailure
});
export type AuthActions = typeof authActions;
