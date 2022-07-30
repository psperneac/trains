import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  HttpException,
  Logger,
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

  catch(exception: Error, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    let message = (exception as any)?.message?.message;
    let code = 'HttpException';

    Logger.error(process.env, message, (exception as any)?.stack, `${request.method} ${request.url}`);

    let status;

    switch (exception.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
        break;
      case QueryFailedError:  // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as QueryFailedError).message;
        code = (exception as any).code;
        break;
      case EntityNotFoundError:  // this is another TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as EntityNotFoundError).message;
        code = (exception as any).code;
        break;
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as CannotCreateEntityIdMapError).message;
        code = (exception as any).code;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR
        code = exception.constructor.toString();
        break;
    }

    response.status(status).json(GlobalResponseError(status, message, code, request,
      (exception as any)?.stack.split('\n').map(str => str.trim())));

    // }
    //
    //   const statusCode =
    //     exception instanceof HttpException
    //       ? exception.getStatus()
    //       : HttpStatus.INTERNAL_SERVER_ERROR;
    //   const message =
    //     exception instanceof HttpException
    //       ? exception.message
    //       : 'Internal server error';
    //
    //   const devErrorResponse: any = {
    //     statusCode,
    //     timestamp: new Date().toISOString(),
    //     path: request.url,
    //     method: request.method,
    //     errorName: exception?.name,
    //     message: exception?.message,
    //   };
    //
    //   const prodErrorResponse: any = {
    //     statusCode,
    //     message,
    //   };
    //
    //   this.logger.log(`request method: ${request.method} request url${request.url}`, JSON.stringify(devErrorResponse));
    //
    //   response
    //     .status(statusCode)
    //     .json(
    //       process.env.NODE_ENV === 'development'
    //         ? devErrorResponse
    //         : prodErrorResponse,
    //     );
  }
}

