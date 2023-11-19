import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { alertActions } from './alert.slice';
import { history } from '../helpers';
import { client } from "../helpers/client";

function createInitialState() {
  // TODO: can re-enable the localStorage saving if I can figure out a way to verify expiry

  return {
    // initialize state from local storage to enable user to stay logged in
    // value: JSON.parse(localStorage.getItem('auth'))
  }
}

function createReducers() {
  return {
    setAuth
  };

  function setAuth(state, action) {
    state.value = action.payload;
  }
}

function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}/authentication`;

  return {
    login: login(),
    logout: logout()
  };

  function login() {
    return createAsyncThunk(
      `${name}/login`,
      async function (payload, { dispatch }) {
        const { username, password } = payload as any;
        dispatch(alertActions.clear());
        try {
          const userResponse = await client.post(`${baseUrl}/login`, { email: username, password });
          const user = userResponse.data;

          // set auth user in redux state
          dispatch(authActions.setAuth(user));

          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // localStorage.setItem('auth', JSON.stringify(user));

          // get return url from location state or default to home page
          const { from } = history.location.state || { from: { pathname: '/' } };
          history.navigate(from);
        } catch (error) {
          dispatch(alertActions.error(error));
        }
      }
    );
  }

  function logout() {
    return createAsyncThunk(
      `${name}/logout`,
      function (arg, { dispatch }) {
        dispatch(authActions.setAuth(null as any));
        // localStorage.removeItem('auth');
        history.navigate('/account/login');
      }
    );
  }
}

const name = 'auth';
const initialState = createInitialState();
const reducers = createReducers();
const extraActions = createExtraActions();
const slice = createSlice({ name, initialState, reducers });

export const authActions = { ...slice.actions, ...extraActions };
export const authReducer = slice.reducer;

