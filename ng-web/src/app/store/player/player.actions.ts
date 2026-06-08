import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PlayerDto } from '../../services/player.service';

export const PlayerActions = createActionGroup({
  source: 'Player',
  events: {
    'Load Players': props<{ page?: number; limit?: number }>(),
    'Load Players Success': props<{ players: PlayerDto[]; page: number; limit: number; totalCount: number }>(),
    'Load Players Failure': props<{ error: string }>(),

    'Load All Players': emptyProps(),
    'Load All Players Success': props<{ players: PlayerDto[] }>(),
    'Load All Players Failure': props<{ error: string }>(),

    'Load Players By User Id': props<{ userId: string; page?: number; limit?: number }>(),
    'Load Players By User Id Success': props<{ players: PlayerDto[] }>(),
    'Load Players By User Id Failure': props<{ error: string }>(),

    'Load Players By Game Id': props<{ gameId: string; page?: number; limit?: number }>(),
    'Load Players By Game Id Success': props<{ players: PlayerDto[] }>(),
    'Load Players By Game Id Failure': props<{ error: string }>(),

    'Set Selected Player': props<{ player: PlayerDto | null }>(),
    'Clear Player Error': emptyProps(),
  },
});