/**
 * Moderator Assignments Enricher
 * Ensures moderators are assigned to communities
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class ModeratorAssignmentsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'ModeratorCommunity');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure moderators have community assignments
    const moderators = await this.prisma.moderator.findMany({
      include: { user: true },
    });

    for (const moderator of moderators) {
      try {
        added += await this.ensureModeratorHasCommunity(moderator.userId, 1);
      } catch (error) {
        errors++;
      }
    }

    // Ensure communities have moderators
    const communities = await this.prisma.community.findMany({
      take: 20,
    });

    for (const community of communities) {
      try {
        added += await this.ensureCommunityHasModerator(community.id);
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

  async ensureModeratorHasCommunity(
    moderatorId: string,
    minCommunities: number,
  ): Promise<number> {
    const assignedCommunities = await this.prisma.moderatorCommunity.count({
      where: { moderatorId },
    });

    const missing = minCommunities - assignedCommunities;
    if (missing <= 0) return 0;

    const availableCommunities = await this.prisma.community.findMany({
      where: {
        moderatorCommunities: {
          none: { moderatorId },
        },
      },
      take: missing,
    });

    for (const community of availableCommunities) {
      await this.prisma.moderatorCommunity.create({
        data: {
          moderatorId,
          communityId: community.id,
          assignedAt: this.randomPastDate(60),
        },
      });
    }

    return availableCommunities.length;
  }

  async ensureCommunityHasModerator(communityId: string): Promise<number> {
    const existingModerators = await this.prisma.moderatorCommunity.count({
      where: { communityId },
    });

    if (existingModerators > 0) return 0;

    const moderatorsWithCount = await this.prisma.moderator.findMany({
      include: {
        _count: { select: { moderatorCommunities: true } },
      },
    });
    const moderator = moderatorsWithCount.sort(
      (a, b) => a._count.moderatorCommunities - b._count.moderatorCommunities,
    )[0];

    if (!moderator) return 0;

    await this.prisma.moderatorCommunity.create({
      data: {
        moderatorId: moderator.userId,
        communityId,
        assignedAt: this.randomPastDate(30),
      },
    });

    return 1;
  }
}
