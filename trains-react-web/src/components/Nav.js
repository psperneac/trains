import React, { Component } from 'react'
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import {authActions, selectAllNotifications} from '../store';

export { Nav };

function Nav() {
    const auth = useSelector(x => x.auth.value);
    const dispatch = useDispatch();
    const logout = () => dispatch(authActions.logout());

    const notifications = useSelector(selectAllNotifications)
    const numUnreadNotifications = notifications.filter(n => !n.read).length

    // only show nav when logged in
    if (!auth) return null;

    let unreadNotificationsBadge

    if (numUnreadNotifications > 0) {
        unreadNotificationsBadge = (
          <span className="badge">{numUnreadNotifications}</span>
        )
    }

    return (
        <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
            <div className="navbar-nav">
                <NavLink to="/" className="nav-item nav-link">Home</NavLink>
                <NavLink to="/users" className="nav-item nav-link">Users</NavLink>
                <NavLink to="/posts" className="nav-item nav-link">Posts</NavLink>
                <NavLink to="/notifications" className="nav-item nav-link">Notifications {unreadNotificationsBadge}</NavLink>
                <button onClick={logout} className="btn btn-link nav-item nav-link">Logout</button>
            </div>
        </nav>
    );
}
