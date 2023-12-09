
import React from 'react';

import reportWebVitals from './reportWebVitals';

import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import {userActions, store} from './store';
import { App } from './App';
import common_en from './translations/en/common.json';
import './index.css';

// setup fake backend
import {worker} from './helpers/server';
import {fetchPosts} from './store/posts.slice';

import i18next from "i18next";
import { I18nextProvider } from 'react-i18next';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: 'en',
  resources: {
    en: {
      common: common_en               // 'common' is our custom namespace
    }
  }
});

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
        <I18nextProvider i18n={i18next}>
          <BrowserRouter>
            <App/>
          </BrowserRouter>
        </I18nextProvider>
      </Provider>
    </React.StrictMode>
  );

  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  reportWebVitals();
}

main().then();
