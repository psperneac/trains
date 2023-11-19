import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authActions } from './auth.slice';
import {client} from "../helpers/client";
import { AppState } from '.';

// create slice

const name = 'users';
const initialState = createInitialState();
const extraActions = createExtraActions();
const extraReducers = createExtraReducers();
const slice = createSlice({ name, initialState, extraReducers } as any);

// exports

export const userActions = { ...slice.actions, ...extraActions };
export const usersReducer = slice.reducer;

// implementation

function createInitialState() {
  return {
    list: null,
    item: null
  }
}

// export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
//   const response = await client.get('/fakeApi/users')
//   return response.data
// })

function createExtraActions() {
  const baseUrl = `${process.env.REACT_APP_API_URL}/users`;

  return {
    register: register(),
    getAll: getAll(),
    getById: getById(),
    update: update(),
    delete: _delete()
  };

  function register() {
    return createAsyncThunk(
      `${name}/register`,
      async (user) => await client.post(`${baseUrl}/register`, user)
    );
  }

  function getAll() {
    return createAsyncThunk(
      `${name}/getAll`,
      async () => await client.get(baseUrl)
    );
  }

  function getById() {
    return createAsyncThunk(
      `${name}/getById`,
      async (id) => await client.get(`${baseUrl}/${id}`)
    );
  }

  function update() {
    return createAsyncThunk(
      `${name}/update`,
      async (payload , { getState, dispatch }) => {
        const { id, data } = payload as any;

        await client.put(`${baseUrl}/${id}`, data);

        // update stored user if the logged in user updated their own record
        const state = getState() as AppState;
        const auth = state.auth.value;
        if (id === auth?.id.toString()) {
          // update local storage
          const user = { ...auth, ...data };
          localStorage.setItem('auth', JSON.stringify(user));

          // update auth user in redux state
          dispatch(authActions.setAuth(user));
        }
      }
    );
  }

  // prefixed with underscore because delete is a reserved word in javascript
  function _delete() {
    return createAsyncThunk(
      `${name}/delete`,
      async function (id, { getState, dispatch }) {
        await client.delete(`${baseUrl}/${id}`);

        // auto logout if the logged in user deleted their own record
        const state = getState() as AppState;
        if (id === state.auth.value?.id) {
          dispatch(authActions.logout());
        }
      }
    );
  }
}

function createExtraReducers() {
  return (builder) => {
    getAll();
    getById();
    _delete();

    // builder.addCase(fetchUsers.fulfilled, (state, action) => {
    //   return action.payload
    // })

    function getAll() {
      var { pending, fulfilled, rejected } = extraActions.getAll;
      builder
        .addCase(pending, (state) => {
          state.list = { loading: true };
        })
        .addCase(fulfilled, (state, action) => {
          state.list = { value: action.payload.data, loading: false };
        })
        .addCase(rejected, (state, action) => {
          state.list = { error: action.error, loading: false };
        });
    }

    function getById() {
      var { pending, fulfilled, rejected } = extraActions.getById;
      builder
        .addCase(pending, (state) => {
          state.item = { loading: true };
        })
        .addCase(fulfilled, (state, action) => {
          state.item = { value: action.payload };
        })
        .addCase(rejected, (state, action) => {
          state.item = { error: action.error };
        });
    }

    function _delete() {
      var { pending, fulfilled, rejected } = extraActions.delete;
      builder
        .addCase(pending, (state, action) => {
          const user = state.list.value.find(x => x.id === action.meta.arg);
          user.isDeleting = true;
        })
        .addCase(fulfilled, (state, action) => {
          state.list.value = state.list.value.filter(x => x.id !== action.meta.arg);
        })
        .addCase(rejected, (state, action) => {
          const user = state.list.value.find(x => x.id === action.meta.arg);
          user.isDeleting = false;
        });
    }
  }
}

export const selectAllUsers = state => state.users.list.value

export const selectUserById = (state, userId) =>
  state.users.list.value.find(user => user.id === userId)

/*
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {client} from "../helpers/client";

const initialState = []

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload
    })
  },
})

export const usersReducer = usersSlice.reducer
 */