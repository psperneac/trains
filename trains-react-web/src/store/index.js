import { configureStore } from '@reduxjs/toolkit';

import { alertReducer } from './alert.slice';
import { authReducer } from './auth.slice';
import { usersReducer } from './users.slice';
import { counterReducer } from './counter.slice';

export * from './alert.slice';
export * from './auth.slice';
export * from './counter.slice';
export * from './users.slice';

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    auth: authReducer,
    counter: counterReducer,
    users: usersReducer
  },
});
