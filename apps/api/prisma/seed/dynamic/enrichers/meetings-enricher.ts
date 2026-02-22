/**
 * Meetings Enricher
 * Ensures client-therapist relationships have sufficient meetings
 */

import { PrismaClient, MeetingStatus } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class MeetingsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Meeting');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    const relationships = await this.prisma.clientTherapist.findMany({
      where: { status: 'active' },
    });

    for (const relationship of relationships) {
      try {
        const count = await this.prisma.meeting.count({
          where: {
            clientId: relationship.clientId,
            therapistId: relationship.therapistId,
          },
        });
        const missing = Math.max(0, 3 - count);
        if (missing > 0) {
          added += await this.ensureRelationshipHasMeetings(
            relationship.clientId,
            relationship.therapistId,
            missing,
          );
        }
      } catch (error) {
        errors++;
      }
    }

    const completedMeetings = await this.prisma.meeting.findMany({
      where: {
        status: 'COMPLETED',
        meetingNotes: { none: {} },
      },
      take: 50,
    });

    for (const meeting of completedMeetings) {
      try {
        await this.ensureMeetingHasNotes(meeting.id);
        added++;
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

  async ensureRelationshipHasMeetings(
    clientId: string,
    therapistId: string,
    minMeetings: number,
  ): Promise<number> {
    const random = this.getRandom(`${clientId}-${therapistId}`, 'meetings');

    for (let i = 0; i < minMeetings; i++) {
      const isPast = i < Math.floor(minMeetings * 0.7); // 70% past meetings
      const daysOffset = isPast
        ? random.nextIntRange(7, 60) // Past: 7-60 days ago
        : random.nextIntRange(1, 14); // Future: 1-14 days ahead

      const startTime = isPast
        ? this.randomPastDate(daysOffset)
        : this.randomFutureDate(daysOffset);

      const duration = random.pickRandom([30, 60, 90]);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const status: MeetingStatus = isPast
        ? MeetingStatus.COMPLETED
        : random.pickRandom([
            MeetingStatus.SCHEDULED,
            MeetingStatus.CONFIRMED,
            MeetingStatus.WAITING,
          ]);

      const meeting = await this.prisma.meeting.create({
        data: {
          clientId,
          therapistId,
          startTime,
          endTime,
          duration,
          status,
          title: 'Therapy Session',
          meetingType: 'video',
          createdAt: this.randomPastDate(daysOffset + 5),
        },
      });

      // Add notes to completed meetings
      if (status === 'COMPLETED') {
        await this.ensureMeetingHasNotes(meeting.id);
      }
    }

    return minMeetings;
  }

  async ensureMeetingHasNotes(meetingId: string): Promise<number> {
    const existing = await this.prisma.meetingNotes.findFirst({
      where: { meetingId },
    });

    if (existing) return 0;

    const notes = [
      'Client showed good progress in managing anxiety symptoms. Practiced deep breathing.',
      'Discussed recent stressors and developed coping strategies. CBT techniques applied.',
      'Reviewed homework assignment. Client is making steady progress toward treatment goals.',
      'Explored family dynamics and their impact on current challenges. Good insight shown.',
      'Focused on mindfulness practices. Client reports improved sleep quality.',
    ];

    const random = this.getRandom(meetingId, 'notes');

    const noteIndex = random.nextInt(notes.length);
    await this.prisma.meetingNotes.create({
      data: {
        id: `${meetingId}-notes`,
        meetingId,
        notes: notes[noteIndex],
      },
    });

    return 1;
  }
}
