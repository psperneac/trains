import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlaceTypeDto } from './place-type.service';
import {
  PlaceTypeActions,
  selectAllPlaceTypes,
  selectPlaceTypes,
  selectSelectedPlaceType,
  selectPlaceTypeLoading,
  selectPlaceTypeError,
  selectPlaceTypePage,
  selectPlaceTypeLimit,
  selectPlaceTypeTotalCount,
  selectHasMorePlaceTypes,
} from '../store/place-type/index';

@Injectable({ providedIn: 'root' })
export class PlaceTypesFacade {
  private store = inject(Store);

  // Selectors
  placeTypes$: Observable<PlaceTypeDto[]> = this.store.select(selectPlaceTypes);
  allPlaceTypes$: Observable<PlaceTypeDto[]> = this.store.select(selectAllPlaceTypes);
  selectedPlaceType$: Observable<PlaceTypeDto | null> = this.store.select(selectSelectedPlaceType);
  loading$: Observable<boolean> = this.store.select(selectPlaceTypeLoading);
  error$: Observable<string | null> = this.store.select(selectPlaceTypeError);
  page$: Observable<number> = this.store.select(selectPlaceTypePage);
  limit$: Observable<number> = this.store.select(selectPlaceTypeLimit);
  totalCount$: Observable<number> = this.store.select(selectPlaceTypeTotalCount);
  hasMore$: Observable<boolean> = this.store.select(selectHasMorePlaceTypes);

  // Actions
  loadPlaceTypes(page?: number, limit?: number): void {
    this.store.dispatch(PlaceTypeActions.loadPlaceTypes({ page, limit }));
  }

  loadAllPlaceTypes(): void {
    this.store.dispatch(PlaceTypeActions.loadAllPlaceTypes());
  }

  loadPlaceType(id: string): void {
    this.store.dispatch(PlaceTypeActions.loadPlaceType({ id }));
  }

  addPlaceType(placeType: Omit<PlaceTypeDto, 'id'>): void {
    this.store.dispatch(PlaceTypeActions.addPlaceType({ placeType }));
  }

  updatePlaceType(placeType: PlaceTypeDto): void {
    this.store.dispatch(PlaceTypeActions.updatePlaceType({ placeType }));
  }

  deletePlaceType(id: string): void {
    this.store.dispatch(PlaceTypeActions.deletePlaceType({ id }));
  }

  setSelectedPlaceType(placeType: PlaceTypeDto | null): void {
    this.store.dispatch(PlaceTypeActions.setSelectedPlaceType({ placeType }));
  }

  clearError(): void {
    this.store.dispatch(PlaceTypeActions.clearPlaceTypeError());
  }

  // Convenience methods
  selectPlaceType(placeType: PlaceTypeDto): void {
    this.store.dispatch(PlaceTypeActions.setSelectedPlaceType({ placeType }));
  }

  refreshPlaceTypes(): void {
    this.store.dispatch(PlaceTypeActions.loadAllPlaceTypes());
  }
}