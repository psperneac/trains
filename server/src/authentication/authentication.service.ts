import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User, UsersService } from '../app/api/support/users.module';
import { SCOPE_USER } from '../utils/constants';

import { RegisterDto, TokenPayload } from './authentication.model';

@Injectable()
export class AuthenticationService {
  logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  public async register(registrationData: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    const createdUser = await this.usersService.create({
      ...registrationData,
      password: hashedPassword,
      scope: SCOPE_USER
    });

    createdUser.password = undefined;
    return createdUser;
  }

  public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.usersService.getById(userId);
      await this.verifyPassword(oldPassword, user.password);
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.replace(userId, { ...user, password: hashedNewPassword });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('Failed to change password. Please check your old password.', HttpStatus.BAD_REQUEST);
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public getAuthToken(userId: string, scope: string) {
    // TODO: add expiry of max-session 15-30min
    // TODO: figure out how to refresh token when expired
    const payload: TokenPayload = {
      sub: userId,  // Standard JWT subject claim
      scope: scope,  // User scope/role
      userId: userId  // Keep for backward compatibility
    };
    console.log('Creating JWT token with payload:', payload);
    const token = this.jwtService.sign(payload);
    console.log('Generated token (first 50 chars):', token.substring(0, 50) + '...');

    // Decode and verify the token contains the right payload
    try {
      const decoded = this.jwtService.verify(token);
      console.log('Verified token payload:', decoded);
    } catch (error) {
      console.error('Token verification failed:', error);
    }

    return token;
  }
}
