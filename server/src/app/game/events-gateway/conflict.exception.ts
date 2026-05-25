import { HttpException, HttpStatus } from '@nestjs/common';

export class ConflictException extends HttpException {
  constructor(
    public readonly reason: string,
    public readonly currentVersion: number,
    public readonly currentEntity: any,
  ) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        reason,
        currentVersion,
        currentEntity,
      },
      HttpStatus.CONFLICT,
    );
  }
}