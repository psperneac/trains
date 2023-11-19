import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { ThunkMiddlewareFor } from '@reduxjs/toolkit/src/getDefaultMiddleware';

import { alertReducer } from './alert.slice';
import { authReducer } from './auth.slice';
import { usersReducer } from './users.slice';
import { counterReducer } from './counter.slice';
import { postsReducer } from './posts.slice';
import {notificationsReducer} from "./notifications.slice";
import * as apiSlice from "./data.api";

export * from './alert.slice';
export * from './auth.slice';
export * from './counter.slice';
export * from './users.slice';
export * from './notifications.slice';

export interface AppState {
  alert: any;
  auth: any;
  counter: any;
  notifications: any;
  users: any;
  posts: any;
  api: any;
}

export const store = configureStore<AppState>({
  reducer: combineReducers({
    alert: alertReducer,
    auth: authReducer,
    counter: counterReducer,
    notifications: notificationsReducer,
    users: usersReducer,
    posts: postsReducer,
    api: apiSlice.reducer
  }),
  middleware: (getDefaultMiddleware): any => getDefaultMiddleware().concat(apiSlice.middleware),
});
