import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class MapPlaceInstanceJobDataService {
  constructor(private readonly store: Store<{}>) {
  }
}
