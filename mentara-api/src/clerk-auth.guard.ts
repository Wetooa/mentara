import { createClerkClient } from '@clerk/backend';
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
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request?.cookies?.__session as string | undefined;

    if (!token) {
      return false;
    }

    try {
      const session = await this.clerkClient.verifyToken(token);

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
