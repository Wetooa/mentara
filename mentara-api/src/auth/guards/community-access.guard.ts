import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/providers/prisma-client.provider';

// Decorator for requiring community membership
export const RequireCommunityMembership = () =>
  SetMetadata('require_community_membership', true);

// Decorator for requiring room access (community membership + room visibility)
export const RequireRoomAccess = () => SetMetadata('require_room_access', true);

// Decorator for requiring posting permission in room
export const RequirePostingRole = () =>
  SetMetadata('require_posting_role', true);

// Decorator for requiring moderator role in community context
export const RequireCommunityModerator = () =>
  SetMetadata('require_community_moderator', true);

@Injectable()
export class CommunityAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.userId || request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if community membership is required
    const requiresCommunityMembership =
      this.reflector.getAllAndOverride<boolean>(
        'require_community_membership',
        [context.getHandler(), context.getClass()],
      );

    if (requiresCommunityMembership) {
      const communityId = await this.extractCommunityId(request);
      if (communityId) {
        await this.validateCommunityMembership(userId, communityId);
      }
    }

    // Check if room access is required
    const requiresRoomAccess = this.reflector.getAllAndOverride<boolean>(
      'require_room_access',
      [context.getHandler(), context.getClass()],
    );

    if (requiresRoomAccess) {
      const roomId = await this.extractRoomId(request);
      if (roomId) {
        await this.validateRoomAccess(userId, roomId);
      }
    }

    // Check if posting role is required
    const requiresPostingRole = this.reflector.getAllAndOverride<boolean>(
      'require_posting_role',
      [context.getHandler(), context.getClass()],
    );

    if (requiresPostingRole) {
      const roomId = await this.extractRoomId(request);
      if (roomId) {
        await this.validatePostingPermission(userId, roomId);
      }
    }

    // Check if community moderator role is required
    const requiresCommunityModerator =
      this.reflector.getAllAndOverride<boolean>('require_community_moderator', [
        context.getHandler(),
        context.getClass(),
      ]);

    if (requiresCommunityModerator) {
      const communityId = await this.extractCommunityId(request);
      if (communityId) {
        await this.validateCommunityModerator(userId, communityId);
      }
    }

    return true;
  }

  private async extractCommunityId(request: any): Promise<string | null> {
    // Direct community ID from params
    if (request.params?.communityId) {
      return request.params.communityId;
    }

    // Community ID from body
    if (request.body?.communityId) {
      return request.body.communityId;
    }

    // Extract from room ID
    const roomId = request.params?.roomId || request.body?.roomId;
    if (roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        include: {
          roomGroup: {
            include: {
              community: true,
            },
          },
        },
      });
      return room?.roomGroup?.community?.id || null;
    }

    // Extract from post ID
    const postId =
      request.params?.id || request.params?.postId || request.body?.postId;
    if (postId && request.path.includes('post')) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          room: {
            include: {
              roomGroup: {
                include: {
                  community: true,
                },
              },
            },
          },
        },
      });
      return post?.room?.roomGroup?.community?.id || null;
    }

    return null;
  }

  private async extractRoomId(request: any): Promise<string | null> {
    // Direct room ID from params
    if (request.params?.roomId) {
      return request.params.roomId;
    }

    // Room ID from body
    if (request.body?.roomId) {
      return request.body.roomId;
    }

    // Extract from post ID
    const postId =
      request.params?.id || request.params?.postId || request.body?.postId;
    if (postId && request.path.includes('post')) {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { roomId: true },
      });
      return post?.roomId || null;
    }

    // Extract from comment ID
    const commentId = request.params?.id || request.params?.commentId;
    if (commentId && request.path.includes('comment')) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          post: {
            select: { roomId: true },
          },
        },
      });
      return comment?.post?.roomId || null;
    }

    return null;
  }

  private async validateCommunityMembership(
    userId: string,
    communityId: string,
  ): Promise<void> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        communityId,
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this community to access this resource',
      );
    }
  }

  private async validateRoomAccess(
    userId: string,
    roomId: string,
  ): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomGroup: {
          include: {
            community: {
              include: {
                memberships: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const membership = room.roomGroup.community.memberships[0];
    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this community to access this room',
      );
    }

    // Additional room-level access checks can be added here if needed
    // For now, community membership grants access to all rooms within the community
  }

  private async validatePostingPermission(
    userId: string,
    roomId: string,
  ): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        roomGroup: {
          include: {
            community: {
              include: {
                memberships: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const membership = room.roomGroup.community.memberships[0];
    if (!membership) {
      throw new ForbiddenException(
        'You must be a member of this community to post',
      );
    }

    // Check room posting role requirements
    const userRole = membership.role;
    const requiredRole = room.postingRole;

    // Define role hierarchy
    const roleHierarchy = {
      member: 0,
      moderator: 1,
      admin: 2,
    };

    const userRoleLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
    const requiredRoleLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0;

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenException(
        `You need ${requiredRole} role or higher to post in this room`,
      );
    }
  }

  private async validateCommunityModerator(
    userId: string,
    communityId: string,
  ): Promise<void> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        communityId,
        role: {
          in: ['moderator', 'admin'],
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You must be a moderator or admin of this community',
      );
    }
  }

  // Helper method to get user's role in a community
  async getUserCommunityRole(
    userId: string,
    communityId: string,
  ): Promise<string | null> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        communityId,
      },
      select: {
        role: true,
      },
    });

    return membership?.role || null;
  }

  // Helper method to check if user can perform moderation actions
  async canModerate(userId: string, communityId: string): Promise<boolean> {
    try {
      await this.validateCommunityModerator(userId, communityId);
      return true;
    } catch {
      return false;
    }
  }
}
