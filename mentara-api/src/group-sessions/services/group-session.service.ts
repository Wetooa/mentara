import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaClient, GroupSessionStatus } from '@prisma/client';

@Injectable()
export class GroupSessionService {
  private readonly logger = new Logger(GroupSessionService.name);

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new group therapy session
   */
  async createSession(
    moderatorId: string,
    communityId: string,
    data: {
      title: string;
      description?: string;
      sessionType: 'VIRTUAL' | 'IN_PERSON';
      scheduledAt: Date;
      duration: number;
      maxParticipants: number;
      virtualLink?: string;
      location?: string;
      locationAddress?: string;
      therapistIds: string[];
    },
  ) {
    // Verify moderator has access to this community
    await this.verifyModeratorAccess(moderatorId, communityId);

    // Verify therapists are in the community
    await this.verifyTherapistsInCommunity(data.therapistIds, communityId);

    // Verify session is in the future
    if (new Date(data.scheduledAt) <= new Date()) {
      throw new BadRequestException('Session must be scheduled in the future');
    }

    // Create the session
    const session = await this.prisma.groupTherapySession.create({
      data: {
        title: data.title,
        description: data.description,
        communityId,
        createdById: moderatorId,
        sessionType: data.sessionType,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        maxParticipants: data.maxParticipants,
        virtualLink: data.virtualLink,
        location: data.location,
        locationAddress: data.locationAddress,
        status: GroupSessionStatus.PENDING_APPROVAL,
      },
      include: {
        community: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(
      `Group session created: ${session.id} by moderator ${moderatorId}`,
    );

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string) {
    const session = await this.prisma.groupTherapySession.findUnique({
      where: { id: sessionId },
      include: {
        community: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        therapistInvitations: {
          include: {
            therapist: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Group session not found');
    }

    return session;
  }

  /**
   * Get sessions for a community
   */
  async getSessionsByCommunity(
    communityId: string,
    filters?: {
      status?: GroupSessionStatus;
      upcoming?: boolean;
    },
  ) {
    const where: any = { communityId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.upcoming) {
      where.scheduledAt = { gte: new Date() };
    }

    return this.prisma.groupTherapySession.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        therapistInvitations: {
          select: {
            status: true,
            therapist: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  /**
   * Cancel a session
   */
  async cancelSession(sessionId: string, moderatorId: string, reason?: string) {
    const session = await this.getSession(sessionId);

    // Verify moderator is the creator
    if (session.createdById !== moderatorId) {
      throw new UnauthorizedException(
        'Only the creator can cancel this session',
      );
    }

    // Cannot cancel completed sessions
    if (session.status === GroupSessionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed session');
    }

    // Update session status
    const updated = await this.prisma.groupTherapySession.update({
      where: { id: sessionId },
      data: {
        status: GroupSessionStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    this.logger.log(`Group session cancelled: ${sessionId}`);

    return updated;
  }

  /**
   * Update session to APPROVED status
   */
  async approveSession(sessionId: string) {
    return this.prisma.groupTherapySession.update({
      where: { id: sessionId },
      data: {
        status: GroupSessionStatus.APPROVED,
      },
    });
  }

  /**
   * Verify moderator has access to community
   */
  private async verifyModeratorAccess(
    moderatorId: string,
    communityId: string,
  ) {
    const moderatorCommunity = await this.prisma.moderatorCommunity.findUnique({
      where: {
        moderatorId_communityId: {
          moderatorId,
          communityId,
        },
      },
    });

    if (!moderatorCommunity) {
      throw new UnauthorizedException(
        'You do not have moderator access to this community',
      );
    }
  }

  /**
   * Verify all therapists are members of the community
   */
  private async verifyTherapistsInCommunity(
    therapistIds: string[],
    communityId: string,
  ) {
    for (const therapistId of therapistIds) {
      const membership = await this.prisma.membership.findUnique({
        where: {
          userId_communityId: {
            userId: therapistId,
            communityId,
          },
        },
      });

      if (!membership) {
        throw new BadRequestException(
          `Therapist ${therapistId} is not a member of this community`,
        );
      }

      // Verify the user is actually a therapist
      const therapist = await this.prisma.therapist.findUnique({
        where: { userId: therapistId },
      });

      if (!therapist) {
        throw new BadRequestException(`User ${therapistId} is not a therapist`);
      }
    }
  }
}
