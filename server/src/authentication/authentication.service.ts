import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserDto, UsersService } from '../app/api/support/users.module';
import { SCOPE_USER, SCOPE_ADMIN } from '../utils/constants';

import { RegisterDto, TokenPayload } from './authentication.model';

@Injectable()
export class AuthenticationService {
  logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  public async register(registrationData: RegisterDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    const createdUser = await this.usersService.create({
      ...registrationData,
      password: hashedPassword,
      scope: SCOPE_USER as any
    });

    return createdUser as any;
  }

  public async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.usersService.getById(userId);
      await this.verifyPassword(oldPassword, user.password);
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.replace(userId, { email: user.email, username: user.username, scope: user.scope as any, password: hashedNewPassword });
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
    const payload: TokenPayload = {
      sub: userId,
      scope: scope,
      userId: userId
    };
    const token = this.jwtService.sign(payload);

    const decoded = this.jwtService.verify(token);
    if (decoded.sub !== userId || decoded.scope !== scope) {
      throw new Error('Token verification failed: payload mismatch');
    }

    return token;
  }
}
