import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class OnePlaceResolver implements Resolve<boolean> {

  constructor(private store: Store<{}>) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('OnePlaceResolver', this.store, route, state);
    console.log('OnePlaceResolver.id', route.paramMap.get('id'));

    return of(true);
  }
}
