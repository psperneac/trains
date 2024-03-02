import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { HttpClient } from '@angular/common/http';
import { WalletDto } from '../../../models/wallet.model';

@Injectable()
export class WalletService extends AbstractService<WalletDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/wallets');
  }
}
