/**
 * Hearts (Likes) Enricher
 * Ensures users give engagement and posts/comments receive hearts
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class HeartsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Heart');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure users have given minimum hearts
    const users = await this.prisma.user.findMany({
      where: { role: { in: ['client', 'therapist'] } },
      include: {
        _count: { select: { hearts: true } },
      },
    });

    for (const user of users) {
      try {
        const minHearts = user.role === 'client' ? 3 : 2;
        const missing = Math.max(0, minHearts - user._count.hearts);
        if (missing > 0) {
          added += await this.ensureUserGivesHearts(user.id, missing);
        }
      } catch (error) {
        errors++;
      }
    }

    return { table: this.tableName, itemsAdded: added, itemsUpdated: 0, errors };
  }

  async ensureUserGivesHearts(userId: string, minHearts: number): Promise<number> {
    // Get posts/comments user hasn't hearted yet
    const existingHearts = await this.prisma.heart.findMany({
      where: { userId },
      select: { postId: true, commentId: true },
    });

    const heartedPostIds = existingHearts.filter((h) => h.postId).map((h) => h.postId);
    const heartedCommentIds = existingHearts
      .filter((h) => h.commentId)
      .map((h) => h.commentId);

    // Get user's communities to find content to heart
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });

    if (memberships.length === 0) return 0;

    const communityIds = memberships.map((m) => m.communityId);

    // Get unhearded posts
    const posts = await this.prisma.post.findMany({
      where: {
        communityId: { in: communityIds },
        userId: { not: userId },
        id: { notIn: heartedPostIds as string[] },
      },
      take: minHearts,
    });

    const random = this.getRandom(userId, 'hearts');
    let added = 0;

    for (const post of posts) {
      await this.prisma.heart.create({
        data: {
          userId,
          postId: post.id,
          createdAt: this.randomDateAfter(post.createdAt, 5),
        },
      });
      added++;
    }

    return added;
  }
}

