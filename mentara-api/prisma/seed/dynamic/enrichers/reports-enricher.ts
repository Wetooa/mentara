/**
 * Reports Enricher
 * Creates content moderation reports for testing
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class ReportsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Report');
  }

  async enrich(): Promise<EnrichmentResult> {
    let added = 0;
    let errors = 0;

    // Create a few reports for testing moderation features
    // Only create if we have very few reports
    const existingReports = await this.prisma.report.count();

    if (existingReports < 3) {
      try {
        const postsToReport = await this.prisma.post.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
        });

        const users = await this.prisma.user.findMany({
          where: { role: 'client' },
          take: 3,
        });

        for (let i = 0; i < Math.min(postsToReport.length, users.length); i++) {
          const post = postsToReport[i];
          const reporter = users[i];

          await this.prisma.report.create({
            data: {
              reporterId: reporter.id,
              reportedUserId: post.userId,
              postId: post.id,
              reason: this.getReportReasons()[i % this.getReportReasons().length],
              status: i === 0 ? 'resolved' : 'pending',
              createdAt: this.randomPastDate(15),
            },
          });
          added++;
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

  private getReportReasons(): string[] {
    return [
      'Inappropriate content',
      'Spam or misleading information',
      'Harassment or bullying',
    ];
  }
}

