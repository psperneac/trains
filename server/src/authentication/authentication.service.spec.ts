import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import User from '../app/api/users/users.entity';
import { UsersService } from '../app/api/users/users.service';
import { mockedConfigService } from '../utils/mocks/config.service.mock';

import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: JWT_MODULE_OPTIONS,
          useValue: { secretOrPrivateKey: 'secret' }
        },
        JwtService,
        AuthenticationService,
        { provide: ConfigService, useValue: mockedConfigService },
        { provide: getRepositoryToken(User), useValue: {} }
      ]
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
