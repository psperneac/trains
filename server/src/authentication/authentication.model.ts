import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

import { User } from '../app/api/support/users.module';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface TokenPayload {
  userId: string;
}
