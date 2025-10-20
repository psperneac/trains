import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';

import { TokenPayload } from '../authentication/authentication.model';

export const getAuthorizationBearer = (module: TestingModule, userId: string, scope: string) => {
  scope = scope ?? 'ADMIN';
  const payload: TokenPayload = { sub: userId, scope, userId };
  const jwtService = module.get<JwtService>(JwtService);
  const token = jwtService.sign(payload);
  return `Bearer ${token}`;
};
