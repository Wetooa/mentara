import { verifyToken } from '@clerk/backend';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { createClerkClient } from '@clerk/backend';

declare module 'express' {
  interface Request {
    userId: string;
    userRole?: string;
  }
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger();

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request?.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    try {
      const session = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY ?? '',
      });

      if (!session.sub) {
        return false;
      }

      // Set userId from token
      request.userId = session.sub;

      // Use Clerk server-side API to get user with metadata including role
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY ?? '',
      });

      try {
        const user = await clerkClient.users.getUser(session.sub);
        const role = user.publicMetadata?.role as string | undefined;

        request.userRole = role;
        console.log('Fetched user role from Clerk:', role);

        return true;
      } catch (clerkError) {
        console.error('Error fetching user from Clerk:', clerkError);
        // Continue without role if Clerk API call fails
        request.userRole = undefined;
        return true;
      }
    } catch (error) {
      this.logger.error(
        'Error verifying token',
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }
}
