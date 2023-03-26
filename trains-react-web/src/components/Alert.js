import React, { Component } from 'react'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { alertActions } from '../store';

export { Alert };

function Alert() {
  const dispatch = useDispatch();
  const location = useLocation();
  const alert = useSelector(x => x.alert.value);

  useEffect(() => {
    // clear alert on location change
    dispatch(alertActions.clear());
  }, [dispatch, location]);

  if (!alert) return null;

  return (
    <div className="container">
      <div className="m-3">
        <div className={`alert alert-dismissible ${alert.type}`}>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => dispatch(alertActions.clear())}></button>
        </div>
      </div>
    </div>
  );
}
