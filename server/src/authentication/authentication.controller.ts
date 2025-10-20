import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  SerializeOptions,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { Response } from 'express';

import { AllExceptionsFilter } from '../utils/all-exceptions.filter';

import { LocalAuthenticationGuard, LoggedIn } from './authentication.guard';
import { RegisterDto, ChangePasswordDto, RequestWithUser } from './authentication.model';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(AllExceptionsFilter)
@SerializeOptions({
  strategy: 'excludeAll'
})
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Verifies auth token and returns current user
   * @param request
   * @param response contains logged-in user if login ok or error if login not ok
   */
  @UseGuards(LoggedIn)
  @Get()
  authenticate(@Req() request: RequestWithUser, @Res() response: Response) {
    const user = request.user;
    user.password = undefined;
    return response.status(HttpStatus.OK).send({ ...user });
  }

  /**
   * Registers a new user in the system
   * @param registrationData details of the new user
   * @param response newly registered user details or error
   */
  @Post('register')
  async register(@Body() registrationData: RegisterDto, @Res() response: Response) {
    const created = await this.authenticationService.register(registrationData);
    return response.status(HttpStatus.CREATED).send({ ...created });
  }

  /**
   * Changes the password of the authenticated user
   * @param changePasswordData old and new password details
   * @param request authenticated user request
   * @param response success or error response
   */
  @UseGuards(LoggedIn)
  @Post('change-password')
  async changePassword(@Body() changePasswordData: ChangePasswordDto, @Req() request: RequestWithUser, @Res() response: Response) {
    await this.authenticationService.changePassword(request.user._id.toString(), changePasswordData.oldPassword, changePasswordData.newPassword);
    return response.status(HttpStatus.OK).send({ message: 'Password changed successfully' });
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    console.log('Login user data:', { _id: user._id, scope: user.scope, email: user.email });
    const token = this.authenticationService.getAuthToken(user._id.toString(), user.scope);
    user.password = undefined;
    return response
      .setHeader('Authorization', `Bearer ${token}`)
      .status(HttpStatus.OK)
      .send({ ...user, authToken: token });
  }

  // @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  @HttpCode(200)
  // @UseGuards(LoggedIn) -- logout should be allowed even if not logged in
  async logOut(@Req() _request: RequestWithUser, @Res() response: Response) {
    // we have no way to currently un-authenticate tokens already sent out
    // app is stateless / session less, so this doesn't do anything
    // TODO: find way to un-authenticate tokens already sent out and remove them from server
    return response.send(JSON.stringify({ ok: true }));
  }
}
