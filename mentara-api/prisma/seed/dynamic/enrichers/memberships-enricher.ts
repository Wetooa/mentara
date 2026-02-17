/**
 * Community Memberships Enricher
 * Ensures users are in minimum number of communities
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class MembershipsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Membership');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure all clients are in at least 1 community
    const clients = await this.prisma.client.findMany({
      include: {
        user: {
          include: {
            _count: { select: { memberships: true } },
          },
        },
      },
    });

    for (const client of clients) {
      try {
        const missing = Math.max(0, 1 - client.user._count.memberships);
        if (missing > 0) {
          added += await this.ensureUserInCommunities(client.userId, missing);
        }
      } catch (error) {
        errors++;
      }
    }

    // Ensure all therapists are in at least 1 community
    const therapists = await this.prisma.therapist.findMany({
      include: {
        user: {
          include: {
            _count: { select: { memberships: true } },
          },
        },
      },
    });

    for (const therapist of therapists) {
      try {
        const missing = Math.max(0, 1 - therapist.user._count.memberships);
        if (missing > 0) {
          added += await this.ensureUserInCommunities(
            therapist.userId,
            missing,
          );
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

  async ensureUserInCommunities(
    userId: string,
    minCount: number,
  ): Promise<number> {
    const existing = await this.prisma.membership.findMany({
      where: { userId },
      select: { communityId: true },
    });

    const missing = minCount - existing.length;
    if (missing <= 0) return 0;

    const existingIds = existing.map((m) => m.communityId);
    const availableCommunities = await this.prisma.community.findMany({
      where: { id: { notIn: existingIds } },
      take: missing,
    });

    for (const community of availableCommunities) {
      await this.prisma.membership.create({
        data: {
          userId,
          communityId: community.id,
        },
      });
    }

    return availableCommunities.length;
  }

  async ensureCommunityHasMembers(
    communityId: string,
    minMembers: number,
  ): Promise<number> {
    const existing = await this.prisma.membership.count({
      where: { communityId },
    });

    const missing = minMembers - existing;
    if (missing <= 0) return 0;

    const users = await this.prisma.user.findMany({
      where: {
        role: { in: ['client', 'therapist'] },
        memberships: {
          none: { communityId },
        },
      },
      take: missing,
    });

    for (const user of users) {
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          communityId,
        },
      });
    }

    return users.length;
  }
}
