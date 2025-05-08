import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@clerk/backend';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Injectable()
export class AuthService {
  async checkAdmin(@CurrentUser() currentUser: User, prisma: PrismaService) {
    try {
      // If no user is authenticated, return unauthorized
      if (!currentUser) {
        throw new UnauthorizedException('Authentication required');
      }

      // Query Prisma to check if the user has admin privileges
      const adminUser = await prisma.adminUser.findUnique({
        where: { clerkUserId: currentUser.id },
      });

      if (!adminUser) {
        throw new ForbiddenException('Not authorized as admin');
      }

      // User is authenticated and has admin privileges
      return {
        success: true,
        admin: {
          id: adminUser.id,
          role: adminUser.role,
          permissions: adminUser.permissions,
        },
      };
    } catch (error) {
      console.error('Admin authentication error:', error);

      // Re-throw NestJS exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // For other errors, throw an internal server error
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}
