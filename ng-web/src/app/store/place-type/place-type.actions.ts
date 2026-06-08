import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PlaceTypeDto } from '../../services/place-type.service';

export const PlaceTypeActions = createActionGroup({
  source: 'PlaceType',
  events: {
    'Load Place Types': props<{ page?: number; limit?: number }>(),
    'Load Place Types Success': props<{ placeTypes: PlaceTypeDto[]; page: number; limit: number; totalCount: number }>(),
    'Load Place Types Failure': props<{ error: string }>(),

    'Load All Place Types': emptyProps(),
    'Load All Place Types Success': props<{ placeTypes: PlaceTypeDto[] }>(),
    'Load All Place Types Failure': props<{ error: string }>(),

    'Load Place Type': props<{ id: string }>(),
    'Load Place Type Success': props<{ placeType: PlaceTypeDto }>(),
    'Load Place Type Failure': props<{ error: string }>(),

    'Add Place Type': props<{ placeType: Omit<PlaceTypeDto, 'id'> }>(),
    'Add Place Type Success': props<{ placeType: PlaceTypeDto }>(),
    'Add Place Type Failure': props<{ error: string }>(),

    'Update Place Type': props<{ placeType: PlaceTypeDto }>(),
    'Update Place Type Success': props<{ placeType: PlaceTypeDto }>(),
    'Update Place Type Failure': props<{ error: string }>(),

    'Delete Place Type': props<{ id: string }>(),
    'Delete Place Type Success': props<{ id: string }>(),
    'Delete Place Type Failure': props<{ error: string }>(),

    'Clear Place Type Error': emptyProps(),
    'Set Selected Place Type': props<{ placeType: PlaceTypeDto | null }>(),
  },
});