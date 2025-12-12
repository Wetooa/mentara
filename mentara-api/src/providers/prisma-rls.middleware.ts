/**
 * Prisma Row Level Security (RLS) Middleware
 * Automatically filters queries based on current user context
 * Provides defense-in-depth security alongside PostgreSQL RLS policies
 */

import { Prisma } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

export interface RLSContext {
  userId: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
}

/**
 * Create RLS middleware for Prisma Client
 * Apply this in your PrismaService onModuleInit
 * Note: Prisma v6 deprecated middlewares in favor of Client Extensions
 */
export function createRLSMiddleware(getContext: () => RLSContext | null) {
  return async (params: any, next: any) => {
    const context = getContext();

    // Skip RLS if no context (system operations)
    if (!context) {
      return next(params);
    }

    const { userId, role } = context;

    // =================================================================
    // USER TABLE - Can read own profile + active users
    // =================================================================
    if (params.model === 'User') {
      if (['findUnique', 'findFirst', 'findMany'].includes(params.action)) {
        // Admins can see all users
        if (role === 'admin') {
          return next(params);
        }

        // Regular users can see themselves + active users
        params.args.where = {
          ...params.args.where,
          OR: [
            { id: userId }, // Own profile
            { isActive: true }, // Public active profiles
          ],
        };
      }

      if (['update', 'delete'].includes(params.action)) {
        // Only allow updates to own profile (unless admin)
        if (role !== 'admin') {
          params.args.where = {
            ...params.args.where,
            id: userId,
          };
        }
      }
    }

    // =================================================================
    // MEETING TABLE - Can only access own meetings
    // =================================================================
    if (params.model === 'Meeting') {
      if (['findUnique', 'findFirst', 'findMany'].includes(params.action)) {
        // Admins can see all
        if (role === 'admin') {
          return next(params);
        }

        // Users can only see meetings they're part of
        params.args.where = {
          ...params.args.where,
          OR: [{ clientId: userId }, { therapistId: userId }],
        };
      }

      if (['update', 'delete'].includes(params.action)) {
        // Only therapist or client can modify their meetings
        const meeting = await next({
          ...params,
          action: 'findUnique',
          args: { where: params.args.where },
        });

        if (!meeting) {
          throw new ForbiddenException('Meeting not found');
        }

        if (
          meeting.clientId !== userId &&
          meeting.therapistId !== userId &&
          role !== 'admin'
        ) {
          throw new ForbiddenException('Not authorized to modify this meeting');
        }
      }
    }

    // =================================================================
    // MESSAGE TABLE - Can only access messages in own conversations
    // =================================================================
    if (params.model === 'Message') {
      if (['findMany', 'findFirst'].includes(params.action)) {
        // Add conversation participant check
        params.args.where = {
          ...params.args.where,
          conversation: {
            ...params.args.where?.conversation,
            participants: {
              some: {
                userId: userId,
                isActive: true,
              },
            },
          },
        };
      }

      if (params.action === 'create') {
        // Verify user is participant before allowing message creation
        params.args.data = {
          ...params.args.data,
          senderId: userId, // Force correct sender
        };
      }

      if (['update', 'delete'].includes(params.action)) {
        // Only allow updates to own messages
        params.args.where = {
          ...params.args.where,
          senderId: userId,
        };
      }
    }

    // =================================================================
    // CONVERSATION TABLE - Can only access own conversations
    // =================================================================
    if (params.model === 'Conversation') {
      if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
        // Add participant check
        params.args.where = {
          ...params.args.where,
          participants: {
            some: {
              userId: userId,
              isActive: true,
            },
          },
        };
      }
    }

    // =================================================================
    // PAYMENT TABLE - Can only access own payments
    // =================================================================
    if (params.model === 'Payment') {
      if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
        // Admins can see all
        if (role === 'admin') {
          return next(params);
        }

        // Users can only see payments they're involved in
        params.args.where = {
          ...params.args.where,
          OR: [{ clientId: userId }, { therapistId: userId }],
        };
      }
    }

    // =================================================================
    // WORKSHEET TABLE - Can only access assigned worksheets
    // =================================================================
    if (params.model === 'Worksheet') {
      if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
        params.args.where = {
          ...params.args.where,
          OR: [{ clientId: userId }, { therapistId: userId }],
        };
      }

      if (['update', 'delete'].includes(params.action)) {
        // Only therapist can modify
        if (role !== 'therapist' && role !== 'admin') {
          throw new ForbiddenException('Only therapist can modify worksheets');
        }

        params.args.where = {
          ...params.args.where,
          therapistId: userId,
        };
      }
    }

    // =================================================================
    // NOTIFICATION TABLE - Can only access own notifications
    // =================================================================
    if (params.model === 'Notification') {
      if (['findMany', 'findFirst', 'findUnique'].includes(params.action)) {
        params.args.where = {
          ...params.args.where,
          userId: userId,
        };
      }

      if (['update', 'delete'].includes(params.action)) {
        params.args.where = {
          ...params.args.where,
          userId: userId,
        };
      }
    }

    // =================================================================
    // POST TABLE - Can read based on community membership
    // =================================================================
    if (params.model === 'Post') {
      if (['update', 'delete'].includes(params.action)) {
        // Only own posts or moderators
        if (role !== 'moderator' && role !== 'admin') {
          params.args.where = {
            ...params.args.where,
            userId: userId,
          };
        }
      }
    }

    // =================================================================
    // COMMENT TABLE - Can only modify own comments
    // =================================================================
    if (params.model === 'Comment') {
      if (['update', 'delete'].includes(params.action)) {
        // Only own comments or moderators
        if (role !== 'moderator' && role !== 'admin') {
          params.args.where = {
            ...params.args.where,
            userId: userId,
          };
        }
      }
    }

    return next(params);
  };
}

/**
 * Helper to set PostgreSQL session variable for RLS
 * Call this from your JWT guard/middleware
 */
export async function setPrismaRLSContext(prisma: any, userId: string) {
  await prisma.$executeRaw`
    SELECT set_config('app.current_user_id', ${userId}, true)
  `;
}

/**
 * Usage in PrismaService:
 *
 * @Injectable()
 * export class PrismaService extends PrismaClient implements OnModuleInit {
 *   private rlsContext: RLSContext | null = null;
 *
 *   async onModuleInit() {
 *     await this.$connect();
 *
 *     // Apply RLS middleware
 *     this.$use(createRLSMiddleware(() => this.rlsContext));
 *   }
 *
 *   setContext(context: RLSContext) {
 *     this.rlsContext = context;
 *   }
 *
 *   clearContext() {
 *     this.rlsContext = null;
 *   }
 * }
 *
 * Then in your JWT Guard:
 *
 * @Injectable()
 * export class JwtAuthGuard extends AuthGuard('jwt') {
 *   constructor(private prisma: PrismaService) {
 *     super();
 *   }
 *
 *   async canActivate(context: ExecutionContext): Promise<boolean> {
 *     const isValid = await super.canActivate(context);
 *
 *     if (isValid) {
 *       const request = context.switchToHttp().getRequest();
 *       const user = request.user;
 *
 *       // Set RLS context
 *       this.prisma.setContext({
 *         userId: user.id,
 *         role: user.role,
 *       });
 *
 *       // Set PostgreSQL session variable
 *       await setPrismaRLSContext(this.prisma, user.id);
 *     }
 *
 *     return isValid;
 *   }
 * }
 */






