import { FeaturePart } from '../../utils/feature-part';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { mapTemplatesResolveFn } from '../map-templates/services/map-template-data.service';
import { PlayerService } from './services/player.service';
import {
  PlayerDataService,
  loadOnePlayerGuardFn,
  playersResolveFn,
  createPlayerGuardFn
} from './services/player-data.service';
import { PlayerEffects, playerReducer } from './store';
import { WalletEffects, walletReducer } from './store';
import { PlayersPage } from './pages/players.page';
import { PlayersListComponent } from './components/players-list.component';
import { PlayerFormComponent } from './components/player-form.component';
import { PlayerEditPage } from './pages/player-edit.page';
import { WalletDataService } from './services/wallet-data.service';
import { WalletService } from './services/wallet.service';

export const PLAYERS_FEATURE: FeaturePart = {
  imports: [
    StoreModule.forFeature('players', playerReducer),
    StoreModule.forFeature('wallets', walletReducer),
    EffectsModule.forFeature([PlayerEffects, WalletEffects]),
  ],
  declarations: [
    PlayersPage,
    PlayersListComponent,
    PlayerFormComponent,
    PlayerEditPage,
  ],
  providers: [
    PlayerService,
    PlayerDataService,
    WalletService,
    WalletDataService
  ],
  routes: [
    { path: '', component: PlayersPage, canActivate: [], canDeactivate: [], resolve: {
        players: playersResolveFn,
        maps: mapTemplatesResolveFn,
      }},
    { path: 'create', component: PlayerEditPage, canActivate: [createPlayerGuardFn], canDeactivate: []},
    { path: ':id', component: PlayerEditPage, canActivate: [loadOnePlayerGuardFn], canDeactivate: []},
  ]
}
