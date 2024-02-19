import { createAction, props } from '@ngrx/store';
import { PlayerDto } from '../../../models/player';

export const setSelectedPlayer = createAction('[Game] Set Selected Player', props<{ playerId: string }>());
