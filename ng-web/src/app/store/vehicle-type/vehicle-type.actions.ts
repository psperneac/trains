import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { VehicleTypeDto } from '../../services/vehicle-type.service';

export const VehicleTypeActions = createActionGroup({
  source: 'VehicleType',
  events: {
    'Load Vehicle Types': props<{ page?: number; limit?: number }>(),
    'Load Vehicle Types Success': props<{ vehicleTypes: VehicleTypeDto[]; page: number; limit: number; totalCount: number }>(),
    'Load Vehicle Types Failure': props<{ error: string }>(),

    'Load All Vehicle Types': emptyProps(),
    'Load All Vehicle Types Success': props<{ vehicleTypes: VehicleTypeDto[] }>(),
    'Load All Vehicle Types Failure': props<{ error: string }>(),

    'Load Vehicle Type': props<{ id: string }>(),
    'Load Vehicle Type Success': props<{ vehicleType: VehicleTypeDto }>(),
    'Load Vehicle Type Failure': props<{ error: string }>(),

    'Add Vehicle Type': props<{ vehicleType: Omit<VehicleTypeDto, 'id'> }>(),
    'Add Vehicle Type Success': props<{ vehicleType: VehicleTypeDto }>(),
    'Add Vehicle Type Failure': props<{ error: string }>(),

    'Update Vehicle Type': props<{ vehicleType: VehicleTypeDto }>(),
    'Update Vehicle Type Success': props<{ vehicleType: VehicleTypeDto }>(),
    'Update Vehicle Type Failure': props<{ error: string }>(),

    'Delete Vehicle Type': props<{ id: string }>(),
    'Delete Vehicle Type Success': props<{ id: string }>(),
    'Delete Vehicle Type Failure': props<{ error: string }>(),

    'Clear Vehicle Type Error': emptyProps(),
    'Set Selected Vehicle Type': props<{ vehicleType: VehicleTypeDto | null }>(),
  },
});