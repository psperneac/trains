import { ConfigService } from '@nestjs/config';
import { mockedConfigService } from './config.service.mock';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../../authentication/jwt.strategy';
import { UsersService } from '../../app/api/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from '../../app/api/users/users.entity';
import { mockedUsersRepository } from './users.repository.mock';
import { LocalStrategy } from '../../authentication/local.strategy';
import { AuthenticationService } from '../../authentication/authentication.service';

export const authMocks = [
  { provide: ConfigService, useValue: mockedConfigService },
  { provide: JWT_MODULE_OPTIONS, useValue: { secretOrPrivateKey: 'secret' } },
  JwtService,
  JwtStrategy,
  LocalStrategy,
  UsersService,
  AuthenticationService,
  { provide: getRepositoryToken(User), useValue: mockedUsersRepository },
];
