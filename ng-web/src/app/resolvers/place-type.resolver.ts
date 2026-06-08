import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { PlaceTypeActions, selectAllPlaceTypes } from '../store/place-type';
import { PlaceTypeDto } from '../services/place-type.service';
import { take } from 'rxjs/operators';

export const placeTypeResolver: ResolveFn<PlaceTypeDto[]> = (
  route
): Observable<PlaceTypeDto[]> => {
  const store = inject(Store);

  // Check if we already have data
  let cachedData: PlaceTypeDto[] = [];
  store.select(selectAllPlaceTypes).pipe(take(1)).subscribe(data => {
    cachedData = data;
  });

  if (cachedData?.length > 0) {
    return of(cachedData);
  }

  // Dispatch load and return empty (component will use loading state)
  store.dispatch(PlaceTypeActions.loadAllPlaceTypes());
  return of([]);
};