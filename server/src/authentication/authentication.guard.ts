import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class LocalAuthenticationGuard extends AuthGuard('local') {}

@Injectable()
export class LoggedIn extends AuthGuard('jwt') {}

@Injectable()
export class Admin implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.scope && user.scope === 'ADMIN';
  }
}

@Injectable()
export class UserOrAdmin implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.scope && (user.scope === 'ADMIN' || user.scope === 'USER');
  }
}