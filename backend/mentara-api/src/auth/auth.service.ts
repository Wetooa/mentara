import { Injectable } from '@nestjs/common';
import { createClerkClient, User } from '@clerk/backend';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Injectable()
export class AuthService {
  async checkAdmin(
    @CurrentUser() currentUser: User,
    prisma: PrismaService,
  ): Promise<boolean> {
    try {
      // If no user is authenticated, return unauthorized
      if (!currentUser) {
        return false;
      }

      // Query Prisma to check if the user has admin privileges
      const adminUser = await prisma.adminUser.findUnique({
        where: { clerkUserId: currentUser.id },
      });

      if (!adminUser) {
        return false;
      }

      // User is authenticated and has admin privileges
      return true;
    } catch (error) {
      console.error('Admin authentication error:', error);
      return false;
    }
  }
}
