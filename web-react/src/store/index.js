import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { alertReducer } from './alert.slice.js';
import { authReducer } from './auth.slice.js';
import { usersReducer } from './users.slice';
import { counterReducer } from './counter.slice.js';
import { postsReducer } from './posts.slice';
import {notificationsReducer} from "./notifications.slice";
import * as apiSlice from "./data.api.js";

export * from './alert.slice.js';
export * from './auth.slice.js';
export * from './counter.slice.js';
export * from './users.slice';
export * from './notifications.slice';
export * from './posts.slice';

export * from './data.api.js';
export * from './vehicle-types.api';
export * from './place-types.api';

// export interface AppState {
//   alert: any;
//   auth: any;
//   counter: any;
//   notifications: any;
//   users: any;
//   posts: any;
//   api: any;
// }

export const store = configureStore({
  reducer: combineReducers({
    alert: alertReducer,
    auth: authReducer,
    counter: counterReducer,
    notifications: notificationsReducer,
    users: usersReducer,
    posts: postsReducer,
    api: apiSlice.reducer
  }),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

// export type AppDispatch = typeof store.dispatch;
