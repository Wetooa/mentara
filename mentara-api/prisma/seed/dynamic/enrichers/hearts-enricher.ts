/**
 * Hearts (Likes) Enricher
 * Ensures users give engagement and posts receive hearts (PostHeart)
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class HeartsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'PostHeart');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    const users = await this.prisma.user.findMany({
      where: { role: { in: ['client', 'therapist'] } },
      include: {
        _count: {
          select: { postHearts: true, commentHearts: true },
        },
      },
    });

    for (const user of users) {
      try {
        const totalHearts =
          user._count.postHearts + user._count.commentHearts;
        const minHearts = user.role === 'client' ? 3 : 2;
        const missing = Math.max(0, minHearts - totalHearts);
        if (missing > 0) {
          added += await this.ensureUserGivesHearts(user.id, missing);
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

  async ensureUserGivesHearts(
    userId: string,
    minHearts: number,
  ): Promise<number> {
    const existingPostHearts = await this.prisma.postHeart.findMany({
      where: { userId },
      select: { postId: true },
    });
    const heartedPostIds = existingPostHearts.map((h) => h.postId);

    const posts = await this.prisma.post.findMany({
      where: {
        userId: { not: userId },
        id: heartedPostIds.length > 0 ? { notIn: heartedPostIds } : undefined,
      },
      take: minHearts,
    });

    let count = 0;
    for (const post of posts) {
      await this.prisma.postHeart.create({
        data: {
          userId,
          postId: post.id,
        },
      });
      count++;
    }

    return count;
  }
}
