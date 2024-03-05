import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { withLatestFrom, tap, map, filter } from 'rxjs';
import { WalletDto } from '../../../models/wallet.model';
import { WalletSelectors, WalletActions } from '../store';

@Injectable({providedIn: 'root'})
export class WalletDataService {
  constructor(private readonly store: Store<{}>) {}

  resolveWallets() {
    return this.store.pipe(
      select(WalletSelectors.All),
      withLatestFrom(this.store.pipe(select(WalletSelectors.Loading))),
      tap(([data, loading]) => {
        if (!data && !loading) {
          this.store.dispatch(WalletActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading]) => data),
      filter(data => !!data),
    );
  }

  createWallet() {
    this.store.dispatch(WalletActions.selectOne({
      payload: {
      } as WalletDto
    }));
  }
}
