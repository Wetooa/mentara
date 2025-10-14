/**
 * Rooms Enricher
 * Creates video chat rooms for therapy sessions
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class RoomsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Room');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Create rooms for video meetings that don't have one
    const videoMeetings = await this.prisma.meeting.findMany({
      where: {
        meetingType: 'video',
        Room: {
          none: {},
        },
      },
      take: 30,
    });

    for (const meeting of videoMeetings) {
      try {
        added += await this.createRoomForMeeting(meeting.id);
      } catch (error) {
        errors++;
      }
    }

    return {
      table: this.tableName,
      itemsAdded: added,
      itemsUpdated: 0,
      errors,
    };
  }

  private async createRoomForMeeting(meetingId: string): Promise<number> {
    const roomId = `room-${meetingId}`;

    await this.prisma.room.create({
      data: {
        id: roomId,
        meetingId,
        isActive: false, // Will be active during session
        createdAt: this.randomPastDate(5),
      },
    });

    return 1;
  }
}

