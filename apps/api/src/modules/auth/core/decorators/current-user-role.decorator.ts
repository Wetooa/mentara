import { createParamDecorator, type ExecutionContext, Inject } from '@nestjs/common';
import { type Request } from 'express';
import { PrismaService } from 'src/core/prisma/prisma.service';
import '../../types';

export const CurrentUserRole = createParamDecorator(
  async (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const clerkId = request.userId;

    if (!clerkId) {
      return null;
    }

    // First, check if role was extracted from JWT token by JwtAuthGuard
    // This is the preferred method as it avoids database queries
    if (request.userRole) {
      return request.userRole;
    }

    // Fallback to database lookup for backwards compatibility
    // Note: This should rarely be needed if JWT tokens are properly configured
    // Consider removing this fallback in future versions for better performance
    try {
      // Create temporary PrismaService instance for database lookup
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
);
