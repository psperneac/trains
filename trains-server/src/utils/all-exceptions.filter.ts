import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  Logger, UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';

export const GlobalResponseError: (statusCode: number, message: string, code: string, request: Request, stack: any) => IResponseError = (
  statusCode: number,
  message: string,
  code: string,
  request: Request,
  stack: any
): IResponseError => {
  return {
    type: 'error',
    statusCode: statusCode,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
    stack: (process.env.NODE_ENV === 'development' ? stack : undefined)
  };
};

export interface IResponseError {
  type: 'error',
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
  stack?: any;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  catch(ex: Error, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    let message = (ex as any)?.message?.message;
    let code = 'HttpException';

    Logger.error(process.env, message, (ex as any)?.stack, `${request.method} ${request.url}`);

    let status;

    switch (ex.constructor) {
      case HttpException:
        status = (ex as HttpException).getStatus();
        break;
      case QueryFailedError:  // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (ex as QueryFailedError).message;
        code = (ex as any).code;
        break;
      case EntityNotFoundError:  // this is another TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (ex as EntityNotFoundError).message;
        code = (ex as any).code;
        break;
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (ex as CannotCreateEntityIdMapError).message;
        code = (ex as any).code;
        break;
      case UnauthorizedException:
        status = HttpStatus.UNAUTHORIZED;
        message = (ex as UnauthorizedException).message;
        code = (ex as any).code;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR
        code = ex.constructor.toString();
        break;
    }

    response.status(status).json(GlobalResponseError(status, message, code, request,
      (ex as any)?.stack.split('\n').map(str => str.trim())));
  }
}

