import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger();

  async canActivate(context: ExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = request?.cookies?.__session as string | undefined;

    if (!token) {
      return false;
    }

    try {
      await clerkClient.verifyToken(token);
    } catch (error) {
      this.logger.error('Error verifying token', error);
      return false;
    }

    return true;
  }
}
