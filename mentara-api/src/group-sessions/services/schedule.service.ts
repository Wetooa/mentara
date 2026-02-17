import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface ScheduleEvent {
  id: string;
  type: 'ONE_ON_ONE' | 'GROUP_SESSION';
  title: string;
  scheduledAt: Date;
  endTime: Date;
  duration: number;
  status: string;
  location?: string;
  virtualLink?: string;
  details: any;
}

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get unified schedule for a user (therapist or client)
   */
  async getUserSchedule(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      includeCompleted?: boolean;
    },
  ): Promise<ScheduleEvent[]> {
    const events: ScheduleEvent[] = [];

    // Build date filter
    const dateFilter: any = {};
    if (filters?.startDate) {
      dateFilter.gte = filters.startDate;
    }
    if (filters?.endDate) {
      dateFilter.lte = filters.endDate;
    }

    // Get one-on-one therapy sessions
    const meetingWhere: any = {
      OR: [{ clientId: userId }, { therapistId: userId }],
    };

    if (Object.keys(dateFilter).length > 0) {
      meetingWhere.startTime = dateFilter;
    }

    if (!filters?.includeCompleted) {
      meetingWhere.status = { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] };
    }

    const meetings = await this.prisma.meeting.findMany({
      where: meetingWhere,
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

    // Transform meetings to events
    for (const meeting of meetings) {
      const isTherapist = meeting.therapistId === userId;
      const otherPerson = isTherapist
        ? `${meeting.client.user.firstName} ${meeting.client.user.lastName}`
        : `${meeting.therapist.user.firstName} ${meeting.therapist.user.lastName}`;

      const endTime =
        meeting.endTime ?? new Date(meeting.startTime.getTime() + 60 * 60000); // Default 60 min

      events.push({
        id: meeting.id,
        type: 'ONE_ON_ONE',
        title: `Therapy Session with ${otherPerson}`,
        scheduledAt: meeting.startTime,
        endTime,
        duration: Math.round(
          (endTime.getTime() - meeting.startTime.getTime()) / 60000,
        ),
        status: meeting.status,
        details: meeting,
      });
    }

    // Get group therapy sessions (as participant)
    const participationWhere: any = {
      userId,
      attendanceStatus: { not: 'CANCELLED' },
    };

    if (!filters?.includeCompleted) {
      participationWhere.session = {
        status: { in: ['APPROVED', 'IN_PROGRESS'] },
      };
    }

    if (Object.keys(dateFilter).length > 0) {
      participationWhere.session = {
        ...participationWhere.session,
        scheduledAt: dateFilter,
      };
    }

    const groupParticipations =
      await this.prisma.groupSessionParticipant.findMany({
        where: participationWhere,
        include: {
          session: {
            include: {
              community: true,
              therapistInvitations: {
                where: { status: 'ACCEPTED' },
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
      });

    for (const participation of groupParticipations) {
      const session = participation.session;
      const endTime = new Date(
        session.scheduledAt.getTime() + session.duration * 60000,
      );

      events.push({
        id: session.id,
        type: 'GROUP_SESSION',
        title: session.title,
        scheduledAt: session.scheduledAt,
        endTime,
        duration: session.duration,
        status: session.status,
        location: session.location ?? undefined,
        virtualLink: session.virtualLink ?? undefined,
        details: session,
      });
    }

    // Check if user is therapist and get sessions where they're invited
    const therapist = await this.prisma.therapist.findUnique({
      where: { userId },
    });

    if (therapist) {
      const invitationWhere: any = {
        therapistId: userId,
        status: 'ACCEPTED',
      };

      if (!filters?.includeCompleted) {
        invitationWhere.session = {
          status: { in: ['APPROVED', 'IN_PROGRESS'] },
        };
      }

      if (Object.keys(dateFilter).length > 0) {
        invitationWhere.session = {
          ...invitationWhere.session,
          scheduledAt: dateFilter,
        };
      }

      const invitations =
        await this.prisma.groupSessionTherapistInvitation.findMany({
          where: invitationWhere,
          include: {
            session: {
              include: {
                community: true,
              },
            },
          },
        });

      for (const invitation of invitations) {
        const session = invitation.session;
        const endTime = new Date(
          session.scheduledAt.getTime() + session.duration * 60000,
        );

        // Don't duplicate if already in participants list
        if (!events.some((e) => e.id === session.id)) {
          events.push({
            id: session.id,
            type: 'GROUP_SESSION',
            title: `${session.title} (Facilitating)`,
            scheduledAt: session.scheduledAt,
            endTime,
            duration: session.duration,
            status: session.status,
            location: session.location ?? undefined,
            virtualLink: session.virtualLink ?? undefined,
            details: session,
          });
        }
      }
    }

    // Sort events by scheduled time
    return events.sort(
      (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
    );
  }
}
