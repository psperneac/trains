import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {Store} from '@ngrx/store';
import { AuthState, logout } from '../features/auth/store';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly store: Store<AuthState>) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      console.dir(err);
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        this.store.dispatch(logout());
      }

      const error = err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}
