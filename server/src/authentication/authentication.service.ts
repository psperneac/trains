import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserPreference } from '../app/api/users/user-preference.entity';
import { UserPreferencesService } from '../app/api/users/user-preference.module';
import { RegisterDto, TokenPayload } from './authentication.model';
import { JwtService } from '@nestjs/jwt';
import { SCOPE_USER } from '../utils/constants';
import { UsersService } from '../app/api/users/users.service';
import { User } from '../app/api/users/users.entity';

@Injectable()
export class AuthenticationService {
  logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly jwtService: JwtService) {}

  public async register(registrationData: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    const createdUser = await this.usersService.create({
      ...registrationData,
      password: hashedPassword,
      scope: SCOPE_USER
    });

    const preferences = await this.userPreferencesService.create({
      user: createdUser,
      content: {}
    });

    createdUser.password = undefined;
    return createdUser;
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
  }

  public getAuthorizationBearer(userId: string) {
    // TODO: add expiry of max-session 15-30min
    // TODO: figure out how to refresh token when expired
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Bearer ${token}`;
  }
}
