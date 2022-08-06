import { LoadOneGuard } from '../../guards/load-one.guard';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { PlaceActions } from './store';

@Injectable()
export class LoadOnePlaceGuard extends LoadOneGuard {

  constructor(store: Store<AppState>) {
    super(store, (id: string) => PlaceActions.getOne({uuid: id}));
  }
}
