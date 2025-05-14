import { clerkClient } from '@clerk/clerk-sdk-node';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import prisma from 'lib/prisma';
import { CurrentUserId } from 'src/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  async getUsers() {
    return clerkClient.users.getUserList();
  }

  async getUser(userId: string) {
    return clerkClient.users.getUser(userId);
  }

  async checkAdmin(@CurrentUserId() userId: string) {
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { id: userId },
      });

      if (!adminUser) {
        throw new ForbiddenException('Not authorized as admin');
      }

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
