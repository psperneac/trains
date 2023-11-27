import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { UserPreferenceDto } from '../../../models/user';

@Injectable()
export class UserPreferenceService extends AbstractService<UserPreferenceDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/user-preferences');
  }
}
