import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  GroupSessionStatus,
  AttendanceStatus,
  InvitationStatus,
} from '@prisma/client';
import { PrismaService } from '../../providers/prisma-client.provider';
import { AvailabilityCheckService } from './availability-check.service';

@Injectable()
export class GroupSessionParticipantService {
  private readonly logger = new Logger(GroupSessionParticipantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityCheck: AvailabilityCheckService,
  ) { }

  /**
   * User joins a group session
   */
  async joinSession(userId: string, sessionId: string) {
    // Get session
    const session = await this.prisma.groupTherapySession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify session is APPROVED
    if (session.status !== GroupSessionStatus.APPROVED) {
      throw new BadRequestException('Session is not open for joining');
    }

    // Verify user is member of the community
    await this.verifyCommunityMembership(userId, session.communityId);

    // Check if session is full
    if (session._count.participants >= session.maxParticipants) {
      throw new ConflictException('Session is full');
    }

    // Check if user already joined
    const existing = await this.prisma.groupSessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You have already joined this session');
    }

    // Check user availability
    const hasConflict = await this.availabilityCheck.checkAvailability(
      userId,
      session.scheduledAt,
      session.duration,
    );

    if (hasConflict) {
      throw new ConflictException(
        'You have a scheduling conflict with this session',
      );
    }

    // Add user as participant
    const participant = await this.prisma.groupSessionParticipant.create({
      data: {
        sessionId,
        userId,
        attendanceStatus: AttendanceStatus.REGISTERED,
      },
      include: {
        session: {
          select: {
            title: true,
            scheduledAt: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`User ${userId} joined session ${sessionId}`);

    return participant;
  }

  /**
   * User leaves a group session
   */
  async leaveSession(userId: string, sessionId: string) {
    // Get participant record
    const participant = await this.prisma.groupSessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      include: {
        session: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not registered for this session');
    }

    // Cannot leave if session already started or completed
    if (participant.session.status === GroupSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot leave a session in progress');
    }

    if (participant.session.status === GroupSessionStatus.COMPLETED) {
      throw new BadRequestException('Cannot leave a completed session');
    }

    // Update participant record (soft delete - mark as cancelled)
    await this.prisma.groupSessionParticipant.update({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
      data: {
        attendanceStatus: AttendanceStatus.CANCELLED,
        leftAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} left session ${sessionId}`);

    return { message: 'Successfully left the session' };
  }

  /**
   * Get participants for a session
   */
  async getParticipants(sessionId: string) {
    return this.prisma.groupSessionParticipant.findMany({
      where: {
        sessionId,
        attendanceStatus: { not: AttendanceStatus.CANCELLED },
      },
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
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  /**
   * Get sessions user has joined
   */
  async getSessionsForUser(userId: string, upcoming?: boolean) {
    const where: any = {
      userId,
      attendanceStatus: { not: AttendanceStatus.CANCELLED },
    };

    if (upcoming) {
      where.session = {
        scheduledAt: { gte: new Date() },
      };
    }

    return this.prisma.groupSessionParticipant.findMany({
      where,
      include: {
        session: {
          include: {
            community: true,
            createdBy: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            therapistInvitations: {
              where: { status: InvitationStatus.ACCEPTED },
              include: {
                therapist: {
                  include: {
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
          },
        },
      },
      orderBy: {
        session: {
          scheduledAt: 'asc',
        },
      },
    });
  }

  /**
   * Verify user is member of community
   */
  private async verifyCommunityMembership(userId: string, communityId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
    });

    if (!membership) {
      throw new UnauthorizedException(
        'You must be a member of this community to join',
      );
    }
  }
}
