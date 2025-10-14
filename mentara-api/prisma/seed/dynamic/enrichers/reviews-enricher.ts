/**
 * Reviews Enricher
 * Ensures therapists receive reviews from completed sessions
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class ReviewsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Review');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Ensure therapists have minimum reviews
    const therapists = await this.prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: true,
        _count: { select: { reviews: true } },
      },
    });

    for (const therapist of therapists) {
      try {
        const missing = Math.max(0, 1 - therapist._count.reviews);
        if (missing > 0) {
          added += await this.ensureTherapistHasReviews(
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

  async ensureTherapistHasReviews(
    therapistId: string,
    minReviews: number,
  ): Promise<number> {
    // Get completed meetings for this therapist
    const completedMeetings = await this.prisma.meeting.findMany({
      where: {
        therapistId,
        status: 'COMPLETED',
        Review: {
          none: {},
        },
      },
      take: minReviews,
    });

    const random = this.getRandom(therapistId, 'reviews');
    const templates = this.getReviewTemplates();

    for (const meeting of completedMeetings) {
      const template = templates[random.nextInt(templates.length)];

      await this.prisma.review.create({
        data: {
          clientId: meeting.clientId,
          therapistId,
          meetingId: meeting.id,
          rating: random.nextIntRange(4, 5), // 4-5 stars
          reviewText: template,
          createdAt: this.randomDateAfter(meeting.endTime, 3),
        },
      });
    }

    return completedMeetings.length;
  }

  private getReviewTemplates(): string[] {
    return [
      'Very professional and empathetic. Really helped me work through my challenges.',
      "Excellent therapist! I feel like I'm making real progress in my sessions.",
      'Great listener and provides practical strategies that actually work.',
      'Highly recommend! Very knowledgeable and creates a safe, supportive environment.',
      'Wonderful experience. I feel heard and understood in every session.',
    ];
  }
}
