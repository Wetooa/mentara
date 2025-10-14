/**
 * Therapist Availability Enricher
 * Ensures therapists have availability schedules
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class AvailabilityEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'TherapistAvailability');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    const therapists = await this.prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: { user: true },
    });

    for (const therapist of therapists) {
      try {
        added += await this.ensureTherapistAvailability(therapist.userId, 3);
      } catch (error) {
        errors++;
      }
    }

    return { table: this.tableName, itemsAdded: added, itemsUpdated: 0, errors };
  }

  async ensureTherapistAvailability(therapistId: string, minDays: number): Promise<number> {
    const existingDays = await this.prisma.therapistAvailability.groupBy({
      where: { therapistId, isAvailable: true },
      by: ['dayOfWeek'],
    });

    const missing = minDays - existingDays.length;
    if (missing <= 0) return 0;

    const random = this.getRandom(therapistId, 'availability');
    const weekdays = ['1', '2', '3', '4', '5']; // Mon-Fri
    const usedDays = new Set(existingDays.map((d) => d.dayOfWeek));
    const availableDays = weekdays.filter((d) => !usedDays.has(d));

    let added = 0;
    for (let i = 0; i < Math.min(missing, availableDays.length); i++) {
      const dayOfWeek = availableDays[i];
      const startHour = random.nextIntRange(9, 14); // 9am-2pm
      const endHour = random.nextIntRange(startHour + 4, 18); // End 4-6 hours later

      await this.prisma.therapistAvailability.create({
        data: {
          therapistId,
          dayOfWeek,
          startTime: `${startHour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:00`,
          isAvailable: true,
        },
      });
      added++;
    }

    return added;
  }
}

