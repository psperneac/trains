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
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { RegisterDto, RequestWithUser } from './authentication.model';
import { LoggedIn, LocalAuthenticationGuard } from './authentication.guard';
import { AllExceptionsFilter } from '../utils/all-exceptions.filter';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(AllExceptionsFilter)
@SerializeOptions({
  strategy: 'excludeAll',
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
    const authorization = this.authenticationService.getAuthorizationBearer(user.id);
    user.password = undefined;
    return response
      .setHeader('Authorization', authorization)
      .status(HttpStatus.OK)
      .send({ ...user, authorization });
  }

  // @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  @HttpCode(200)
  @UseGuards(LoggedIn)
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    // we have no way to currently un-authenticate tokens already sent out
    // app is stateless / session less, so this doesn't do anything
    return response.send(JSON.stringify({ ok: true }));
  }
}
