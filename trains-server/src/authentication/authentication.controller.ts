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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { RegisterDto, RequestWithUser } from './authentication.model';
import { LoggedIn, LocalAuthenticationGuard } from './authentication.guard';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  strategy: 'excludeAll',
})
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Verifies auth token and returns current user
   * @param request
   */
  @UseGuards(LoggedIn)
  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const authorization = this.authenticationService.getAuthorizationBearer(
      user.id,
    );
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
