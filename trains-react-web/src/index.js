import reportWebVitals from './reportWebVitals';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import {userActions, store} from './store';
import { App } from './App';
import './index.css';

// setup fake backend
import {worker} from "./helpers/server";
import {fetchPosts} from "./store/posts.slice";

async function main() {
  // Start our mock API server
  await worker.start({onUnhandledRequest: 'bypass'})

  console.log('Loading users');
  store.dispatch(userActions.getAll())
  console.log('Loading posts');
  store.dispatch(fetchPosts())

  const container = document.getElementById('root');
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App/>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
}

main();