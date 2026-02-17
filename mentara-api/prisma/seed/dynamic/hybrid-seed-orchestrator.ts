/**
 * Hybrid Seed Orchestrator
 *
 * Combines legacy generators with dynamic enrichment
 * Flow: Legacy seed → Dynamic enrichment → Verification
 */

import { PrismaClient } from '@prisma/client';
import { MembershipsEnricher } from './enrichers/memberships-enricher';
import { RelationshipsEnricher } from './enrichers/relationships-enricher';
import { AvailabilityEnricher } from './enrichers/availability-enricher';
import { PostsEnricher } from './enrichers/posts-enricher';
import { CommentsEnricher } from './enrichers/comments-enricher';
import { HeartsEnricher } from './enrichers/hearts-enricher';
import { MeetingsEnricher } from './enrichers/meetings-enricher';
import { WorksheetsEnricher } from './enrichers/worksheets-enricher';
import { MessagesEnricher } from './enrichers/messages-enricher';
import { AssessmentsEnricher } from './enrichers/assessments-enricher';
import { ReviewsEnricher } from './enrichers/reviews-enricher';
import { NotificationsEnricher } from './enrichers/notifications-enricher';
import { ModeratorAssignmentsEnricher } from './enrichers/moderator-assignments-enricher';
import { MessageInteractionsEnricher } from './enrichers/message-interactions-enricher';
import { RoomsEnricher } from './enrichers/rooms-enricher';
import { ReportsEnricher } from './enrichers/reports-enricher';
import { UserBlocksEnricher } from './enrichers/user-blocks-enricher';
import { PaymentsEnricher } from './enrichers/payments-enricher';
import { GroupSessionsEnricher } from './enrichers/group-sessions-enricher';
import { EnrichmentResult } from './enrichers/base-enricher';

export interface HybridSeedReport {
  enrichmentResults: EnrichmentResult[];
  totalItemsAdded: number;
  totalErrors: number;
  duration: number;
}

export class HybridSeedOrchestrator {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run table-by-table enrichment
   * Ensures all minimum data requirements are met
   */
  async enrichAllTables(prisma: PrismaClient): Promise<HybridSeedReport> {
    console.log('  🔍 Running dynamic enrichment...\n');

    // Initialize all enrichers in dependency order
    const enrichers = [
      // Tier 1: No dependencies
      { name: 'Memberships', enricher: new MembershipsEnricher(prisma) },
      { name: 'Relationships', enricher: new RelationshipsEnricher(prisma) },
      { name: 'Availability', enricher: new AvailabilityEnricher(prisma) },

      // Tier 2: Depends on memberships
      { name: 'Assessments', enricher: new AssessmentsEnricher(prisma) },
      { name: 'Posts', enricher: new PostsEnricher(prisma) },
      {
        name: 'Moderators',
        enricher: new ModeratorAssignmentsEnricher(prisma),
      },

      // Tier 3: Depends on posts
      { name: 'Comments', enricher: new CommentsEnricher(prisma) },
      { name: 'Hearts', enricher: new HeartsEnricher(prisma) },

      // Tier 4: Depends on relationships
      { name: 'Meetings', enricher: new MeetingsEnricher(prisma) },
      { name: 'Worksheets', enricher: new WorksheetsEnricher(prisma) },
      { name: 'Messages', enricher: new MessagesEnricher(prisma) },

      // Tier 5: Depends on meetings/messages
      { name: 'Reviews', enricher: new ReviewsEnricher(prisma) },
      { name: 'Reactions', enricher: new MessageInteractionsEnricher(prisma) },
      { name: 'Rooms', enricher: new RoomsEnricher(prisma) },
      { name: 'Notifications', enricher: new NotificationsEnricher(prisma) },

      // Tier 6: Edge cases & system
      { name: 'GroupSessions', enricher: new GroupSessionsEnricher(prisma) },
      { name: 'Reports', enricher: new ReportsEnricher(prisma) },
      { name: 'Blocks', enricher: new UserBlocksEnricher(prisma) },
      { name: 'Payments', enricher: new PaymentsEnricher(prisma) },
    ];

    const results: EnrichmentResult[] = [];
    let totalAdded = 0;
    let totalErrors = 0;

    for (let i = 0; i < enrichers.length; i++) {
      const { name, enricher } = enrichers[i];
      process.stdout.write(`  [${i + 1}/${enrichers.length}] ${name}...`);

      try {
        const result = await enricher.enrich();
        results.push(result);
        totalAdded += result.itemsAdded;
        totalErrors += result.errors;

        if (result.itemsAdded > 0) {
          console.log(` ✅ +${result.itemsAdded}`);
        } else {
          console.log(` ✓ (satisfied)`);
        }
      } catch (error) {
        console.log(` ❌ Error: ${error}`);
        totalErrors++;
      }
    }

    const duration = Date.now() - this.startTime;

    return {
      enrichmentResults: results,
      totalItemsAdded: totalAdded,
      totalErrors: totalErrors,
      duration,
    };
  }

  /**
   * Verify all minimum requirements are met
   */
  async verifyMinimumRequirements(prisma: PrismaClient): Promise<boolean> {
    console.log('\n  🔍 Verifying minimum requirements...');

    const checks = [
      await this.verifyClientRequirements(prisma),
      await this.verifyTherapistRequirements(prisma),
      await this.verifyCommunityRequirements(prisma),
    ];

    const allSatisfied = checks.every((c) => c);

    if (allSatisfied) {
      console.log('  ✅ All minimum requirements satisfied!\n');
    } else {
      console.log('  ⚠️  Some requirements not fully satisfied\n');
    }

    return allSatisfied;
  }

  private async verifyClientRequirements(
    prisma: PrismaClient,
  ): Promise<boolean> {
    const clients = await prisma.client.findMany({
      include: {
        user: {
          include: {
            _count: {
              select: {
                posts: true,
                comments: true,
                memberships: true,
              },
            },
          },
        },
      },
    });

    let violations = 0;
    for (const client of clients) {
      const c = client.user._count;
      if (c.posts < 5) violations++;
      if (c.comments < 10) violations++;
      if (c.memberships < 1) violations++;
    }

    console.log(
      `     Clients: ${violations === 0 ? '✅' : '⚠️'} (${violations} violations)`,
    );
    return violations === 0;
  }

  private async verifyTherapistRequirements(
    prisma: PrismaClient,
  ): Promise<boolean> {
    const therapists = await prisma.therapist.findMany({
      where: { status: 'APPROVED' },
      include: {
        _count: {
          select: {
            assignedClients: true,
            meetings: true,
          },
        },
        user: {
          include: {
            _count: {
              select: { posts: true },
            },
          },
        },
      },
    });

    let violations = 0;
    for (const therapist of therapists) {
      if (therapist._count.assignedClients < 2) violations++;
      if (therapist.user._count.posts < 2) violations++;
      if (therapist._count.meetings < 4) violations++;
    }

    console.log(
      `     Therapists: ${violations === 0 ? '✅' : '⚠️'} (${violations} violations)`,
    );
    return violations === 0;
  }

  private async verifyCommunityRequirements(
    prisma: PrismaClient,
  ): Promise<boolean> {
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });

    let violations = 0;
    for (const community of communities) {
      if (community._count.memberships < 8) violations++;
    }

    console.log(
      `     Communities: ${violations === 0 ? '✅' : '⚠️'} (${violations} violations)`,
    );
    return violations === 0;
  }
}
