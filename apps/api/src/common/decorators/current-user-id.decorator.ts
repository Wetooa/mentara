import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user ID (clerkId) from the request object.
 * Assumes that the request.user object has been populated by the JwtAuthGuard.
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    // Supporting both clerkId and id for compatibility
    return request.user?.id || request.user?.clerkId || null;
  },
);
