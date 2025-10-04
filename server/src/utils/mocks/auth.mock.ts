import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User, UsersService } from '../../app/api/support/users.module';
import { AuthenticationService } from '../../authentication/authentication.service';
import { JwtStrategy } from '../../authentication/jwt.strategy';
import { LocalStrategy } from '../../authentication/local.strategy';

import { mockedConfigService } from './config.service.mock';
import { mockedUsersRepository } from './users.repository.mock';

export const authMocks = [
  { provide: ConfigService, useValue: mockedConfigService },
  { provide: JWT_MODULE_OPTIONS, useValue: { secretOrPrivateKey: 'secret' } },
  JwtService,
  JwtStrategy,
  LocalStrategy,
  UsersService,
  AuthenticationService,
  { provide: getRepositoryToken(User), useValue: mockedUsersRepository }
];
