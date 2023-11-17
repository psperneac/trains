import { FeaturePart } from '../../utils/feature-part';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlayerService } from './services/player.service';
import { PlayerDataService } from './services/player-data.service';
import { PlayerEffects, reducer as playerReducer } from './store';
import { PlayersPage } from './pages/players.page';

export const PLAYERS_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('players', playerReducer),
    EffectsModule.forFeature([PlayerEffects]),
  ],
  declarations: [
    PlayersPage,
    PlayersListComponent,
    PlayerFormComponent,
    PlayerEditPage,
    PlayerCreatePage,
  ],
  providers: [
    PlayerService,
    PlayerDataService,
  ],
  routes: [
    { path: '', component: PlayersPage, canActivate: [], canDeactivate: []},
    { path: 'create', component: PlayerCreatePage, canActivate: [], canDeactivate: []},
    { path: ':id', component: PlayerEditPage, canActivate: [loadOnePlayerGuardFn], canDeactivate: [],
      resolve: {
        playerTypes: resolvePlayerTypesFn
      }
    },
  ]
}
