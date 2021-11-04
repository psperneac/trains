import { TokenPayload } from '../authentication/authentication.model';
import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';

export const getAuthorizationBearer = (
  module: TestingModule,
  userId: string,
) => {
  const payload: TokenPayload = { userId };
  const jwtService = module.get<JwtService>(JwtService);
  const token = jwtService.sign(payload);
  return `Bearer ${token}`;
};
