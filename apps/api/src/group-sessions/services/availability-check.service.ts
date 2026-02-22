import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';

@Injectable()
export class AvailabilityCheckService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Check if user has availability for a given time slot
   * Returns true if there IS a conflict, false if available
   */
  async checkAvailability(
    userId: string,
    scheduledAt: Date,
    duration: number,
  ): Promise<boolean> {
    const endTime = new Date(scheduledAt.getTime() + duration * 60000);

    // Check for conflicts with one-on-one therapy sessions
    const meetingConflicts = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        startTime: { lt: endTime },
        endTime: { gt: scheduledAt },
      },
    });

    if (meetingConflicts.length > 0) {
      return true; // Has conflict with one-on-one session
    }

    // Check for conflicts with group therapy sessions
    const groupSessionConflicts =
      await this.prisma.groupSessionParticipant.findMany({
        where: {
          userId,
          attendanceStatus: { not: 'CANCELLED' },
          session: {
            status: { in: ['APPROVED', 'IN_PROGRESS'] },
            scheduledAt: { lt: endTime },
            // We need to check if scheduledAt + duration overlaps
          },
        },
        include: {
          session: {
            select: {
              scheduledAt: true,
              duration: true,
            },
          },
        },
      });

    // Check if any group session overlaps
    for (const participant of groupSessionConflicts) {
      const sessionEnd = new Date(
        participant.session.scheduledAt.getTime() +
        participant.session.duration * 60000,
      );

      // Check for overlap
      if (
        participant.session.scheduledAt < endTime &&
        sessionEnd > scheduledAt
      ) {
        return true; // Has conflict with group session
      }
    }

    // Also check if therapist, verify against their invitations
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (therapist) {
      const invitationConflicts =
        await this.prisma.groupSessionTherapistInvitation.findMany({
          where: {
            therapistId: userId,
            status: 'ACCEPTED',
            session: {
              status: { in: ['APPROVED', 'IN_PROGRESS'] },
              scheduledAt: { lt: endTime },
            },
          },
          include: {
            session: {
              select: {
                scheduledAt: true,
                duration: true,
              },
            },
          },
        });

      for (const invitation of invitationConflicts) {
        const sessionEnd = new Date(
          invitation.session.scheduledAt.getTime() +
          invitation.session.duration * 60000,
        );

        if (
          invitation.session.scheduledAt < endTime &&
          sessionEnd > scheduledAt
        ) {
          return true; // Has conflict with accepted group session
        }
      }
    }

    return false; // No conflicts, user is available
  }

  /**
   * Get conflicting events for a user
   */
  async getConflictingEvents(
    userId: string,
    scheduledAt: Date,
    duration: number,
  ) {
    const endTime = new Date(scheduledAt.getTime() + duration * 60000);
    const conflicts: any[] = [];

    // Get one-on-one meetings
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [{ clientId: userId }, { therapistId: userId }],
        status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
        startTime: { lt: endTime },
        endTime: { gt: scheduledAt },
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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
    });

    conflicts.push(
      ...meetings.map((m) => ({
        type: 'ONE_ON_ONE',
        id: m.id,
        startTime: m.startTime,
        endTime: m.endTime,
        details: m,
      })),
    );

    // Get group sessions
    const groupParticipations =
      await this.prisma.groupSessionParticipant.findMany({
        where: {
          userId,
          attendanceStatus: { not: 'CANCELLED' },
        },
        include: {
          session: {
            include: {
              community: true,
            },
          },
        },
      });

    for (const participation of groupParticipations) {
      const session = participation.session;
      const sessionEnd = new Date(
        session.scheduledAt.getTime() + session.duration * 60000,
      );

      if (session.scheduledAt < endTime && sessionEnd > scheduledAt) {
        conflicts.push({
          type: 'GROUP_SESSION',
          id: session.id,
          startTime: session.scheduledAt,
          endTime: sessionEnd,
          details: session,
        });
      }
    }

    return conflicts;
  }
}
