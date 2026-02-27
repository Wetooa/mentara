import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingMeetings: any[];
  conflictType: 'therapist' | 'client' | 'both' | 'none';
}

@Injectable()
export class ConflictDetectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check for scheduling conflicts for both therapist and client
   */
  async checkSchedulingConflicts(
    therapistId: string,
    clientId: string,
    startTime: Date,
    duration: number,
  ): Promise<ConflictResult> {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const timeRange = { startTime, endTime };

    const [therapistConflicts, clientConflicts] = await Promise.all([
      this.checkTherapistConflicts(therapistId, timeRange),
      this.checkClientConflicts(clientId, timeRange),
    ]);

    const hasConflict =
      therapistConflicts.length > 0 || clientConflicts.length > 0;
    let conflictType: 'therapist' | 'client' | 'both' | 'none' = 'none';

    if (therapistConflicts.length > 0 && clientConflicts.length > 0) {
      conflictType = 'both';
    } else if (therapistConflicts.length > 0) {
      conflictType = 'therapist';
    } else if (clientConflicts.length > 0) {
      conflictType = 'client';
    }

    return {
      hasConflict,
      conflictingMeetings: [...therapistConflicts, ...clientConflicts],
      conflictType,
    };
  }

  /**
   * Check for conflicts in therapist's schedule
   */
  async checkTherapistConflicts(
    therapistId: string,
    timeRange: TimeRange,
  ): Promise<any[]> {
    return this.findConflictingMeetings({
      therapistId,
      timeRange,
      statuses: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
    });
  }

  /**
   * Check for conflicts in client's schedule
   */
  async checkClientConflicts(
    clientId: string,
    timeRange: TimeRange,
  ): Promise<any[]> {
    return this.findConflictingMeetings({
      clientId,
      timeRange,
      statuses: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
    });
  }

  /**
   * Check if updating a meeting would cause conflicts
   */
  async checkUpdateConflicts(
    meetingId: string,
    therapistId: string,
    clientId: string,
    newStartTime: Date,
    newDuration: number,
  ): Promise<ConflictResult> {
    const endTime = new Date(newStartTime.getTime() + newDuration * 60 * 1000);
    const timeRange = { startTime: newStartTime, endTime };

    // Find conflicts excluding the current meeting
    const conflicts = await this.findConflictingMeetings({
      therapistId,
      clientId,
      timeRange,
      statuses: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
      excludeMeetingId: meetingId,
    });

    const therapistConflicts = conflicts.filter(
      (m) => m.therapistId === therapistId,
    );
    const clientConflicts = conflicts.filter((m) => m.clientId === clientId);

    const hasConflict = conflicts.length > 0;
    let conflictType: 'therapist' | 'client' | 'both' | 'none' = 'none';

    if (therapistConflicts.length > 0 && clientConflicts.length > 0) {
      conflictType = 'both';
    } else if (therapistConflicts.length > 0) {
      conflictType = 'therapist';
    } else if (clientConflicts.length > 0) {
      conflictType = 'client';
    }

    return {
      hasConflict,
      conflictingMeetings: conflicts,
      conflictType,
    };
  }

  /**
   * Check for conflicts when bulk scheduling multiple meetings
   */
  async checkBulkConflicts(
    meetings: Array<{
      therapistId: string;
      clientId: string;
      startTime: Date;
      duration: number;
    }>,
  ): Promise<{ meetingIndex: number; conflicts: ConflictResult }[]> {
    const conflicts: { meetingIndex: number; conflicts: ConflictResult }[] = [];

    for (let i = 0; i < meetings.length; i++) {
      const meeting = meetings[i];

      // Check against existing meetings
      const existingConflicts = await this.checkSchedulingConflicts(
        meeting.therapistId,
        meeting.clientId,
        meeting.startTime,
        meeting.duration,
      );

      // Check against other meetings in the bulk operation
      const internalConflicts = this.checkInternalConflicts(
        meeting,
        meetings,
        i,
      );

      if (existingConflicts.hasConflict || internalConflicts.length > 0) {
        conflicts.push({
          meetingIndex: i,
          conflicts: {
            hasConflict: true,
            conflictingMeetings: [
              ...existingConflicts.conflictingMeetings,
              ...internalConflicts,
            ],
            conflictType: existingConflicts.conflictType,
          },
        });
      }
    }

    return conflicts;
  }

  private async findConflictingMeetings({
    therapistId,
    clientId,
    timeRange,
    statuses,
    excludeMeetingId,
  }: {
    therapistId?: string;
    clientId?: string;
    timeRange: TimeRange;
    statuses: string[];
    excludeMeetingId?: string;
  }): Promise<any[]> {
    const whereConditions: any[] = [];

    // Build more efficient query conditions using the new endTime field
    const overlapCondition = {
      startTime: { lt: timeRange.endTime },
      OR: [
        { endTime: { gt: timeRange.startTime } }, // Meeting ends after our start
        {
          // Fallback for meetings without endTime (legacy data)
          AND: [
            { endTime: null },
            {
              // Calculate endTime on the fly for legacy meetings
              startTime: { gte: timeRange.startTime },
            },
          ],
        },
      ],
      status: { in: statuses },
    };

    // Add therapist condition
    if (therapistId) {
      whereConditions.push({
        therapistId,
        ...overlapCondition,
      });
    }

    // Add client condition
    if (clientId) {
      whereConditions.push({
        clientId,
        ...overlapCondition,
      });
    }

    if (whereConditions.length === 0) {
      return [];
    }

    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: whereConditions,
        ...(excludeMeetingId && { id: { not: excludeMeetingId } }),
      },
      include: {
        client: {
          select: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        therapist: {
          select: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    // Additional filtering for meetings without endTime (legacy data)
    return meetings.filter((meeting) => {
      const meetingEndTime =
        meeting.endTime ||
        new Date(meeting.startTime.getTime() + meeting.duration * 60 * 1000);
      return this.hasTimeOverlap(
        timeRange.startTime,
        timeRange.endTime,
        meeting.startTime,
        meetingEndTime,
      );
    });
  }

  private checkInternalConflicts(
    currentMeeting: {
      therapistId: string;
      clientId: string;
      startTime: Date;
      duration: number;
    },
    allMeetings: Array<{
      therapistId: string;
      clientId: string;
      startTime: Date;
      duration: number;
    }>,
    currentIndex: number,
  ): any[] {
    const conflicts: any[] = [];
    const currentEndTime = new Date(
      currentMeeting.startTime.getTime() + currentMeeting.duration * 60 * 1000,
    );

    for (let i = 0; i < allMeetings.length; i++) {
      if (i === currentIndex) continue;

      const otherMeeting = allMeetings[i];
      const otherEndTime = new Date(
        otherMeeting.startTime.getTime() + otherMeeting.duration * 60 * 1000,
      );

      // Check if meetings involve the same people
      const sameTherapist =
        currentMeeting.therapistId === otherMeeting.therapistId;
      const sameClient = currentMeeting.clientId === otherMeeting.clientId;

      if (
        (sameTherapist || sameClient) &&
        this.hasTimeOverlap(
          currentMeeting.startTime,
          currentEndTime,
          otherMeeting.startTime,
          otherEndTime,
        )
      ) {
        conflicts.push({
          ...otherMeeting,
          conflictType:
            sameTherapist && sameClient
              ? 'both'
              : sameTherapist
                ? 'therapist'
                : 'client',
          isInternalConflict: true,
          conflictIndex: i,
        });
      }
    }

    return conflicts;
  }

  /**
   * Check if two time ranges overlap
   */
  hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Validate that a proposed meeting time doesn't conflict
   * Throws BadRequestException if conflicts are found
   */
  async validateNoConflicts(
    therapistId: string,
    clientId: string,
    startTime: Date,
    duration: number,
  ): Promise<void> {
    const conflicts = await this.checkSchedulingConflicts(
      therapistId,
      clientId,
      startTime,
      duration,
    );

    if (conflicts.hasConflict) {
      const conflictMessages = conflicts.conflictingMeetings.map((meeting) => {
        const meetingStart = meeting.startTime.toLocaleString();
        const meetingEnd = new Date(
          meeting.startTime.getTime() + meeting.duration * 60000,
        ).toLocaleString();
        return `Meeting from ${meetingStart} to ${meetingEnd}`;
      });

      throw new BadRequestException(
        `Time slot conflicts with existing meetings: ${conflictMessages.join(', ')}`,
      );
    }
  }
}
