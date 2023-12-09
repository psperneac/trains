import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { UserDto } from '../../../models/user';

@Injectable()
export class UserService extends AbstractService<UserDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/users');
  }
}
