/**
 * Rooms Enricher
 * Ensures communities have room groups with rooms (discussion rooms).
 * Room in this schema is a community discussion room, not a meeting video room.
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

    const roomGroups = await this.prisma.roomGroup.findMany({
      include: { _count: { select: { rooms: true } } },
    });

    for (const group of roomGroups) {
      if (group._count.rooms > 0) continue;
      try {
        await this.prisma.room.create({
          data: {
            name: 'General',
            order: 0,
            roomGroupId: group.id,
          },
        });
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
}
