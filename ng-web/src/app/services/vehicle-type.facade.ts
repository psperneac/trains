import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { VehicleTypeDto } from './vehicle-type.service';
import {
  VehicleTypeActions,
  selectAllVehicleTypes,
  selectVehicleTypes,
  selectSelectedVehicleType,
  selectVehicleTypeLoading,
  selectVehicleTypeError,
  selectVehicleTypePage,
  selectVehicleTypeLimit,
  selectVehicleTypeTotalCount,
  selectHasMoreVehicleTypes,
} from '../store/vehicle-type/index';

@Injectable({ providedIn: 'root' })
export class VehicleTypesFacade {
  private store = inject(Store);

  vehicleTypes$: Observable<VehicleTypeDto[]> = this.store.select(selectVehicleTypes);
  allVehicleTypes$: Observable<VehicleTypeDto[]> = this.store.select(selectAllVehicleTypes);
  selectedVehicleType$: Observable<VehicleTypeDto | null> = this.store.select(selectSelectedVehicleType);
  loading$: Observable<boolean> = this.store.select(selectVehicleTypeLoading);
  error$: Observable<string | null> = this.store.select(selectVehicleTypeError);
  page$: Observable<number> = this.store.select(selectVehicleTypePage);
  limit$: Observable<number> = this.store.select(selectVehicleTypeLimit);
  totalCount$: Observable<number> = this.store.select(selectVehicleTypeTotalCount);
  hasMore$: Observable<boolean> = this.store.select(selectHasMoreVehicleTypes);

  loadVehicleTypes(page?: number, limit?: number): void {
    this.store.dispatch(VehicleTypeActions.loadVehicleTypes({ page, limit }));
  }

  loadAllVehicleTypes(): void {
    this.store.dispatch(VehicleTypeActions.loadAllVehicleTypes());
  }

  loadVehicleType(id: string): void {
    this.store.dispatch(VehicleTypeActions.loadVehicleType({ id }));
  }

  addVehicleType(vehicleType: Omit<VehicleTypeDto, 'id'>): void {
    this.store.dispatch(VehicleTypeActions.addVehicleType({ vehicleType }));
  }

  updateVehicleType(vehicleType: VehicleTypeDto): void {
    this.store.dispatch(VehicleTypeActions.updateVehicleType({ vehicleType }));
  }

  deleteVehicleType(id: string): void {
    this.store.dispatch(VehicleTypeActions.deleteVehicleType({ id }));
  }

  setSelectedVehicleType(vehicleType: VehicleTypeDto | null): void {
    this.store.dispatch(VehicleTypeActions.setSelectedVehicleType({ vehicleType }));
  }

  clearError(): void {
    this.store.dispatch(VehicleTypeActions.clearVehicleTypeError());
  }

  selectVehicleType(vehicleType: VehicleTypeDto): void {
    this.store.dispatch(VehicleTypeActions.setSelectedVehicleType({ vehicleType }));
  }

  refreshVehicleTypes(): void {
    this.store.dispatch(VehicleTypeActions.loadAllVehicleTypes());
  }
}