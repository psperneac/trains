import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { VehicleTypeService } from '../../services/vehicle-type.service';
import { VehicleTypeActions } from './vehicle-type.actions';

@Injectable()
export class VehicleTypeEffects {
  private actions$ = inject(Actions);
  private vehicleTypeService = inject(VehicleTypeService);

  loadVehicleTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleTypeActions.loadVehicleTypes),
      switchMap(({ page = 1, limit = 0 }) =>
        this.vehicleTypeService.getVehicleTypes(page, limit).pipe(
          map((response) =>
            VehicleTypeActions.loadVehicleTypesSuccess({
              vehicleTypes: response.data,
              page: response.page,
              limit: response.limit,
              totalCount: response.totalCount,
            })
          ),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load vehicle types';
            return of(VehicleTypeActions.loadVehicleTypesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadAllVehicleTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleTypeActions.loadAllVehicleTypes),
      switchMap(() =>
        this.vehicleTypeService.getAllVehicleTypes().pipe(
          map((response) => VehicleTypeActions.loadAllVehicleTypesSuccess({ vehicleTypes: response })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load all vehicle types';
            return of(VehicleTypeActions.loadAllVehicleTypesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadVehicleType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleTypeActions.loadVehicleType),
      switchMap(({ id }) =>
        this.vehicleTypeService.getVehicleType(id).pipe(
          map((vehicleType) => VehicleTypeActions.loadVehicleTypeSuccess({ vehicleType })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load vehicle type';
            return of(VehicleTypeActions.loadVehicleTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  addVehicleType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleTypeActions.addVehicleType),
      switchMap(({ vehicleType }) =>
        this.vehicleTypeService.createVehicleType(vehicleType).pipe(
          map((newVehicleType) => VehicleTypeActions.addVehicleTypeSuccess({ vehicleType: newVehicleType })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to add vehicle type';
            return of(VehicleTypeActions.addVehicleTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  updateVehicleType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleTypeActions.updateVehicleType),
      switchMap(({ vehicleType }) =>
        this.vehicleTypeService.updateVehicleType(vehicleType).pipe(
          map((updatedVehicleType) => VehicleTypeActions.updateVehicleTypeSuccess({ vehicleType: updatedVehicleType })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to update vehicle type';
            return of(VehicleTypeActions.updateVehicleTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  deleteVehicleType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleTypeActions.deleteVehicleType),
      switchMap(({ id }) =>
        this.vehicleTypeService.deleteVehicleType(id).pipe(
          map(() => VehicleTypeActions.deleteVehicleTypeSuccess({ id })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to delete vehicle type';
            return of(VehicleTypeActions.deleteVehicleTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}