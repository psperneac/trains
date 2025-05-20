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
import { RegisterDto, RequestWithUser } from './authentication.model';
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

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const authorization = this.authenticationService.getAuthorizationBearer(user._id.toString());
    user.password = undefined;
    return response
      .setHeader('Authorization', authorization)
      .status(HttpStatus.OK)
      .send({ ...user, authorization });
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
