import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private readonly store: Store<AppState>) { }
}
