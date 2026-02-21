/**
 * Comments Enricher
 * Ensures users have minimum comments and posts have discussion
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class CommentsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Comment');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure clients have minimum comments (comments live on User)
    const clients = await this.prisma.client.findMany({
      include: {
        user: {
          include: {
            _count: { select: { comments: true } },
          },
        },
      },
    });

    for (const client of clients) {
      try {
        const missing = Math.max(0, 10 - client.user._count.comments);
        if (missing > 0) {
          added += await this.ensureUserHasComments(client.userId, missing);
        }
      } catch (error) {
        errors++;
      }
    }

    // Ensure therapists have minimum comments (comments live on User)
    const therapists = await this.prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: {
          include: {
            _count: { select: { comments: true } },
          },
        },
      },
    });

    for (const therapist of therapists) {
      try {
        const missing = Math.max(0, 5 - therapist.user._count.comments);
        if (missing > 0) {
          added += await this.ensureUserHasComments(therapist.userId, missing);
        }
      } catch (error) {
        errors++;
      }
    }

    // Ensure posts have minimum comments
    const postsWithCount = await this.prisma.post.findMany({
      take: 50,
      include: {
        _count: { select: { comments: true } },
      },
    });
    const posts = postsWithCount.filter((p) => p._count.comments < 2);

    for (const post of posts) {
      try {
        added += await this.ensurePostHasComments(post.id, 2);
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

  async ensureUserHasComments(
    userId: string,
    minComments: number,
  ): Promise<number> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { communityId: true },
    });

    if (memberships.length === 0) return 0;

    // Get posts to comment on (not user's own posts)
    const postsToCommentOn = await this.prisma.post.findMany({
      where: { userId: { not: userId } },
      orderBy: { createdAt: 'desc' },
      take: minComments * 2,
    });

    if (postsToCommentOn.length === 0) return 0;

    const random = this.getRandom(userId, 'comments');
    const templates = this.getCommentTemplates();

    const toCreate = Math.min(minComments, postsToCommentOn.length);

    for (let i = 0; i < toCreate; i++) {
      const post = postsToCommentOn[random.nextInt(postsToCommentOn.length)];
      const template = templates[i % templates.length];

      await this.prisma.comment.create({
        data: {
          postId: post.id,
          userId,
          content: template,
          createdAt: this.randomDateAfter(post.createdAt, 30),
        },
      });
    }

    return toCreate;
  }

  async ensurePostHasComments(
    postId: string,
    minComments: number,
  ): Promise<number> {
    const existing = await this.prisma.comment.count({
      where: { postId },
    });

    const missing = minComments - existing;
    if (missing <= 0) return 0;

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, createdAt: true },
    });

    if (!post) return 0;

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: post.userId },
        role: { in: ['client', 'therapist'] },
      },
      take: missing,
    });

    const templates = this.getCommentTemplates();

    for (let i = 0; i < Math.min(missing, users.length); i++) {
      await this.prisma.comment.create({
        data: {
          postId,
          userId: users[i].id,
          content: templates[i % templates.length],
          createdAt: this.randomDateAfter(post.createdAt, 15),
        },
      });
    }

    return Math.min(missing, users.length);
  }

  private getCommentTemplates(): string[] {
    return [
      'Thank you for sharing. I can relate to this so much.',
      "This is really helpful advice. I'll try implementing this.",
      "Sending you positive thoughts. You're not alone in this journey.",
      'Have you talked to your therapist about this?',
      "I've found that taking small steps really helps with this.",
      'This resonates with me. Thanks for being vulnerable and sharing.',
      "You're making great progress! Keep it up!",
      "I appreciate this perspective. It's helpful to hear different experiences.",
      'Wishing you strength and healing on your journey.',
      'This is exactly what I needed to hear today. Thank you!',
    ];
  }
}
