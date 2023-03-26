import React from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { history } from './helpers';
import { Nav, Alert, PrivateRoute } from './components';
import { Home } from './features/home/Home';
import { AccountLayout } from './features/account/AccountLayout';
import { UsersLayout } from './features/users/UsersLayout';
import { PostsLayout } from './features/posts/PostsLayout';
import {NotificationsList} from "./features/notifications/NotificationsList";

export { App };

function App() {

  // init custom history object to allow navigation from 
  // anywhere in the React app (inside or outside components)
  history.navigate = useNavigate();
  history.location = useLocation();

  return (
    <div className="app-container bg-light">
      <Nav />
      <Alert />
      <div className="container pt-4 pb-4">
        <Routes>
          {/* private */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="users/*" element={<UsersLayout />} />
            <Route path="posts/*" element={<PostsLayout />} />
            <Route exact path="/notifications" element={<NotificationsList />} />
          </Route>
          {/* public */}
          <Route path="account/*" element={<AccountLayout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}
