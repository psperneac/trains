import { AbstractService } from '../../../helpers/abstract.service';
import { Injectable } from '@angular/core';
import { PlayerDto } from '../../../models/player';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PlayerService extends AbstractService<PlayerDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/players');
  }
}
