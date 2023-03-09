import { createSlice } from '@reduxjs/toolkit';


const name = 'alert';
const initialState = createInitialState();
const reducers = createReducers();
const slice = createSlice({ name, initialState, reducers });

export const alertActions = { ...slice.actions };
export const alertReducer = slice.reducer;

function createInitialState() {
  return {
    value: null
  }
}

function createReducers() {
  return {
    success,
    error,
    clear
  };

  function success(state, action) {
    state.value = {
      type: 'alert-success',
      message: action.payload?.message || action.payload,
      showAfterRedirect: action.payload?.showAfterRedirect
    };
  }

  function error(state, action) {
    state.value = {
      type: 'alert-danger',
      message: action.payload?.message || action.payload,
      showAfterRedirect: action.payload?.showAfterRedirect
    }
  }

  function clear(state) {
    // if showAfterRedirect flag is true the alert is not cleared 
    // for one route change (e.g. after successful registration)
    if (state.value?.showAfterRedirect) {
      state.value.showAfterRedirect = false;
    } else {
      state.value = null;
    }
  }
}
