import { configureStore } from '@reduxjs/toolkit';

import { alertReducer } from './alert.slice';
import { authReducer } from './auth.slice';
import { usersReducer } from './users.slice';
import { counterReducer } from './counter.slice';
import { postsReducer } from './posts.slice';
import {notificationsReducer} from "./notifications.slice";
import * as placeTypeApi from "./place-type.api";

export * from './alert.slice';
export * from './auth.slice';
export * from './counter.slice';
export * from './users.slice';
export * from './notifications.slice';

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    counter: counterReducer,
    notifications: notificationsReducer,
    users: usersReducer,
    posts: postsReducer,
    [placeTypeApi.reducerPath]: placeTypeApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(placeTypeApi.middleware)
});
