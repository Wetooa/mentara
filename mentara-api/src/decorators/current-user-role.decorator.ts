import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';
import { PrismaService } from 'src/providers/prisma-client.provider';

export const CurrentUserRole = createParamDecorator(
  async (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const clerkId = request.userId;

    if (!clerkId) {
      return null;
    }

    // First, check if role was extracted from Clerk token by ClerkAuthGuard
    if (request.userRole) {
      return request.userRole;
    }

    // Fallback to database lookup for backwards compatibility
    try {
      const prisma = new PrismaService();
      const user = await prisma.user.findUnique({
        where: { id: clerkId },
        select: { role: true },
      });

      await prisma.$disconnect();
      return user?.role ?? null;
    } catch (error) {
      console.error(
        'Error getting user role from database:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  },
);;
