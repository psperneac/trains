import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as urljoin from 'url-join';

import {select, Store} from '@ngrx/store';
import {selectLoggedIn, selectUser} from '../features/auth/store';
import {switchMap, take, withLatestFrom} from 'rxjs/operators';
import {AppState} from '../store';
import {environment} from '../../environments/environment';


  @Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private readonly store: Store<AppState>) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.pipe(
      select(selectUser),
      take(1)
    ).pipe(
      withLatestFrom(this.store.pipe(select(selectLoggedIn))),
      switchMap(([user, loggedIn]) => {
          const isLoggedIn = user && user.authorization && loggedIn;
          const isApiUrl = request.url.startsWith(urljoin(environment.api, 'api'));
          if (isLoggedIn && isApiUrl) {
            request = request.clone({
              setHeaders: {
                Authorization: user.authorization
              }
            });
          }

          return next.handle(request);
      }
      ));
  }
}
