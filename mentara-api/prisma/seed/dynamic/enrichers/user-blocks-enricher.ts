/**
 * User Blocks Enricher
 * Creates minimal block relationships for edge case testing
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class UserBlocksEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'UserBlock');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Create minimal block relationships (just for testing)
    const existingBlocks = await this.prisma.userBlock.count();

    if (existingBlocks < 2) {
      try {
        const users = await this.prisma.user.findMany({
          where: { role: 'client' },
          take: 4,
        });

        if (users.length >= 4) {
          // Create 2 block relationships for testing
          await this.prisma.userBlock.create({
            data: {
              blockerId: users[0].id,
              blockedId: users[1].id,
              createdAt: this.randomPastDate(20),
            },
          });

          await this.prisma.userBlock.create({
            data: {
              blockerId: users[2].id,
              blockedId: users[3].id,
              createdAt: this.randomPastDate(10),
            },
          });

          added = 2;
        }
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
