import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    userId: string;
  }
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger();

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request?.cookies?.__session as string | undefined;

    if (!token) {
      return false;
    }

    try {
      const session = await clerkClient.verifyToken(token);

      request.userId = session.sub;

      return true;
    } catch (error) {
      this.logger.error(
        'Error verifying token',
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }
}
