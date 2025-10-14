/**
 * Posts Enricher
 * Ensures users have minimum posts and communities have content
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class PostsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Post');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure clients have minimum posts
    const clients = await this.prisma.client.findMany({
      include: {
        user: true,
        _count: { select: { posts: true } },
      },
    });

    for (const client of clients) {
      try {
        const missing = Math.max(0, 5 - client._count.posts);
        if (missing > 0) {
          added += await this.ensureUserHasPosts(client.userId, missing);
        }
      } catch (error) {
        errors++;
      }
    }

    // Ensure therapists have minimum posts
    const therapists = await this.prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: true,
        _count: { select: { posts: true } },
      },
    });

    for (const therapist of therapists) {
      try {
        const missing = Math.max(0, 2 - therapist._count.posts);
        if (missing > 0) {
          added += await this.ensureUserHasPosts(therapist.userId, missing);
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

  async ensureUserHasPosts(userId: string, minPosts: number): Promise<number> {
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });

    if (memberships.length === 0) {
      return 0; // Can't create posts without community membership
    }

    const random = this.getRandom(userId, 'posts');
    const topics = this.getPostTopics();

    for (let i = 0; i < minPosts; i++) {
      const communityId =
        memberships[random.nextInt(memberships.length)].communityId;
      const topic = topics[i % topics.length];

      await this.prisma.post.create({
        data: {
          userId,
          communityId,
          content: topic,
          createdAt: this.randomPastDate(60),
        },
      });
    }

    return minPosts;
  }

  async ensureCommunityHasPosts(
    communityId: string,
    minPosts: number,
  ): Promise<number> {
    const existing = await this.prisma.post.count({
      where: { communityId },
    });

    const missing = minPosts - existing;
    if (missing <= 0) return 0;

    const members = await this.prisma.communityMember.findMany({
      where: { communityId },
      take: 10,
    });

    if (members.length === 0) return 0;

    const random = this.getRandom(communityId, 'posts');

    for (let i = 0; i < missing; i++) {
      const member = members[random.nextInt(members.length)];
      const topic = this.getPostTopics()[i % this.getPostTopics().length];

      await this.prisma.post.create({
        data: {
          userId: member.userId,
          communityId,
          content: topic,
          createdAt: this.randomPastDate(45),
        },
      });
    }

    return missing;
  }

  private getPostTopics(): string[] {
    return [
      "I've been feeling more anxious lately. Anyone else experiencing this?",
      'Just wanted to share a small victory today. I managed to go outside for a walk!',
      'Looking for recommendations on mindfulness apps. What do you use?',
      'Had a tough therapy session today, but feeling hopeful about the progress.',
      'Does anyone have tips for managing stress at work?',
      'Grateful for this supportive community. You all help more than you know.',
      'Struggling with sleep lately. Any suggestions for better sleep hygiene?',
      'Celebrating 30 days of consistent therapy attendance! 🎉',
      'What coping strategies have worked best for you?',
      'Feeling overwhelmed but trying to take it one day at a time.',
    ];
  }
}
