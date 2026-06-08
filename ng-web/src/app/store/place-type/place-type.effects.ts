import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PlaceTypeService } from '../../services/place-type.service';
import { PlaceTypeActions } from './place-type.actions';

@Injectable()
export class PlaceTypeEffects {
  private actions$ = inject(Actions);
  private placeTypeService = inject(PlaceTypeService);

  loadPlaceTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceTypeActions.loadPlaceTypes),
      switchMap(({ page = 1, limit = 10 }) =>
        this.placeTypeService.getPlaceTypes(page, limit).pipe(
          map((response) =>
            PlaceTypeActions.loadPlaceTypesSuccess({
              placeTypes: response.data,
              page: response.page,
              limit: response.limit,
              totalCount: response.totalCount,
            })
          ),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load place types';
            return of(PlaceTypeActions.loadPlaceTypesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadAllPlaceTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceTypeActions.loadAllPlaceTypes),
      switchMap(() =>
        this.placeTypeService.getAllPlaceTypes().pipe(
          map((response) => PlaceTypeActions.loadAllPlaceTypesSuccess({ placeTypes: response })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load all place types';
            return of(PlaceTypeActions.loadAllPlaceTypesFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loadPlaceType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceTypeActions.loadPlaceType),
      switchMap(({ id }) =>
        this.placeTypeService.getPlaceType(id).pipe(
          map((placeType) => PlaceTypeActions.loadPlaceTypeSuccess({ placeType })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load place type';
            return of(PlaceTypeActions.loadPlaceTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  addPlaceType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceTypeActions.addPlaceType),
      switchMap(({ placeType }) =>
        this.placeTypeService.createPlaceType(placeType).pipe(
          map((newPlaceType) => PlaceTypeActions.addPlaceTypeSuccess({ placeType: newPlaceType })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to add place type';
            return of(PlaceTypeActions.addPlaceTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  updatePlaceType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceTypeActions.updatePlaceType),
      switchMap(({ placeType }) =>
        this.placeTypeService.updatePlaceType(placeType).pipe(
          map((updatedPlaceType) => PlaceTypeActions.updatePlaceTypeSuccess({ placeType: updatedPlaceType })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to update place type';
            return of(PlaceTypeActions.updatePlaceTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  deletePlaceType$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PlaceTypeActions.deletePlaceType),
      switchMap(({ id }) =>
        this.placeTypeService.deletePlaceType(id).pipe(
          map(() => PlaceTypeActions.deletePlaceTypeSuccess({ id })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to delete place type';
            return of(PlaceTypeActions.deletePlaceTypeFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}