import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { GameDto } from '../../services/game.service';

export const GameActions = createActionGroup({
  source: 'Game',
  events: {
    'Load Games': props<{ page?: number; limit?: number }>(),
    'Load Games Success': props<{ games: GameDto[]; page: number; limit: number; totalCount: number }>(),
    'Load Games Failure': props<{ error: string }>(),

    'Load All Games': emptyProps(),
    'Load All Games Success': props<{ games: GameDto[] }>(),
    'Load All Games Failure': props<{ error: string }>(),

    'Load Game': props<{ id: string }>(),
    'Load Game Success': props<{ game: GameDto }>(),
    'Load Game Failure': props<{ error: string }>(),

    'Add Game': props<{ game: Omit<GameDto, 'id'> }>(),
    'Add Game Success': props<{ game: GameDto }>(),
    'Add Game Failure': props<{ error: string }>(),

    'Update Game': props<{ game: GameDto }>(),
    'Update Game Success': props<{ game: GameDto }>(),
    'Update Game Failure': props<{ error: string }>(),

    'Delete Game': props<{ id: string }>(),
    'Delete Game Success': props<{ id: string }>(),
    'Delete Game Failure': props<{ error: string }>(),

    'Clear Game Error': emptyProps(),
    'Set Selected Game': props<{ game: GameDto | null }>(),
  },
});