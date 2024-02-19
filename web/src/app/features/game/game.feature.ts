import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeaturePart } from '../../utils/feature-part';
import { GameDataService } from './services/game-data.service';
import { GameService } from './services/game.service';
import { GameEffects } from './store/game.effects';
import { reducer as gameReducer } from './store/game.reducers';

export const GAME_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('game', gameReducer),
    EffectsModule.forFeature([GameEffects]),
  ],
  declarations: [],
  providers: [GameService, GameDataService],
  routes: [],
}
