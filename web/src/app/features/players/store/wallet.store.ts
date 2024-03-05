import { Injectable } from '@angular/core';
import { AbstractActions } from '../../../helpers/abstract.actions';
import { WalletDto } from '../../../models/wallet.model';
import { AbstractEntityState, createAdapter, createInitialState, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { Actions } from '@ngrx/effects';
import { Router } from '@angular/router';
import { WalletService } from '../services/wallet.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';

class WalletActionsTypes extends AbstractActions<WalletDto> {
  constructor() {
    super('Wallet');
  }
}

export const WalletActions = new WalletActionsTypes();

export interface WalletState extends AbstractEntityState<WalletDto> {
}

export const walletAdapter = createAdapter<WalletDto>();
const walletInitialState = createInitialState(walletAdapter);
const walletReducerInternal = defaultCreateReducer(WalletActions, walletAdapter, walletInitialState);

export function walletReducer(state: WalletState | undefined, action: any) {
  return walletReducerInternal(state, action);
}

const selectors = walletAdapter.getSelectors();
const walletState = (state) => state['wallets'] as WalletState;

class WalletSelectorsType extends AbstractSelectors<WalletState, WalletDto> {
  constructor() {
    super(walletState, selectors);
  }
}

export const WalletSelectors = new WalletSelectorsType();

@Injectable()
export class WalletEffects extends AbstractEffects<WalletState, WalletDto> {
  constructor(
    readonly actions$: Actions,
    readonly walletService: WalletService,
    readonly store: Store<AppState>,
    readonly router: Router) {
    super(actions$, walletService, store, router, WalletActions, WalletSelectors);
  }
}
