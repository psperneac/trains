import { SetMetadata } from '@nestjs/common';

/**
 * Defines the annotation for scopes. @Scopes('ADMIN', 'USERS'). Limits access to controller method
 * to users with either role. Absence of annotation allows all to access method.
 * @param scopes
 * @constructor
 */
export const Scopes = (...scopes: string[]) => SetMetadata('scopes', scopes);
