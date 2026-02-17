import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | string | unknown => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user as Record<string, unknown> | undefined;
    if (data === undefined) {
      return request.user as AuthenticatedUser;
    }
    if (data === 'id' || data === 'userId') {
      return user?.userId as string;
    }
    if (typeof data === 'string') {
      return user?.[data];
    }
    return request.user as AuthenticatedUser;
  },
);
