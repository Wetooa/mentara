import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user role from the request object.
 * Assumes that the request.user object has been populated by the JwtAuthGuard.
 */
export const CurrentUserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.role || null;
  },
);
