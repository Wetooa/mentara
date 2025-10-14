/**
 * Dynamic Seed Orchestrator
 *
 * Main orchestration logic for idempotent, smart database seeding
 */

import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_MINIMUM_REQUIREMENTS,
  MinimumRequirements,
} from './minimum-requirements';
import { ClientDataEnricher } from './enrichers/client-data-enricher';
import { TherapistDataEnricher } from './enrichers/therapist-data-enricher';

export interface DatabaseAudit {
  users: { total: number; byRole: Record<string, number> };
  communities: { total: number; withMinMembers: number };
  posts: { total: number; byUser: Record<string, number> };
  comments: { total: number; byUser: Record<string, number> };
  meetings: { total: number; byStatus: Record<string, number> };
  clientTherapistRelationships: number;
  communityMemberships: number;
}

export interface DataGap {
  entityType: string;
  entityId: string;
  entityName?: string;
  gaps: {
    field: string;
    current: number;
    required: number;
    missing: number;
  }[];
}

export interface SeedReport {
  audit: DatabaseAudit;
  gaps: DataGap[];
  itemsAdded: {
    posts: number;
    comments: number;
    meetings: number;
    memberships: number;
    messages: number;
    [key: string]: number;
  };
  duration: number;
  satisfied: boolean;
}

export class DynamicSeedOrchestrator {
  private requirements: MinimumRequirements;
  private startTime: number;

  constructor(
    requirements: MinimumRequirements = DEFAULT_MINIMUM_REQUIREMENTS,
  ) {
    this.requirements = requirements;
    this.startTime = Date.now();
  }

  /**
   * Main entry point: Ensure all minimum data requirements are met
   */
  async ensureMinimumData(prisma: PrismaClient): Promise<SeedReport> {
    console.log('🔍 Step 1: Auditing existing database...');
    const audit = await this.auditDatabase(prisma);
    this.displayAudit(audit);

    console.log('\n📊 Step 2: Identifying data gaps...');
    const gaps = await this.identifyGaps(prisma, audit);
    this.displayGaps(gaps);

    console.log('\n✨ Step 3: Filling data gaps...');
    const itemsAdded = await this.fillGaps(prisma, gaps);

    console.log('\n✅ Step 4: Verifying requirements...');
    const finalAudit = await this.auditDatabase(prisma);
    const finalGaps = await this.identifyGaps(prisma, finalAudit);

    const duration = Date.now() - this.startTime;

    return {
      audit: finalAudit,
      gaps: finalGaps,
      itemsAdded,
      duration,
      satisfied: finalGaps.length === 0,
    };
  }

  /**
   * Audit current database state
   */
  private async auditDatabase(prisma: PrismaClient): Promise<DatabaseAudit> {
    const [
      userCount,
      usersByRole,
      communityCount,
      postCount,
      commentCount,
      meetingCount,
      relationshipCount,
      membershipCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.community.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.meeting.count(),
      prisma.clientTherapist.count(),
      prisma.communityMember.count(),
    ]);

    return {
      users: {
        total: userCount,
        byRole: Object.fromEntries(
          usersByRole.map((r) => [r.role, r._count._all]),
        ),
      },
      communities: {
        total: communityCount,
        withMinMembers: 0, // TODO: Calculate
      },
      posts: {
        total: postCount,
        byUser: {}, // TODO: Calculate if needed
      },
      comments: {
        total: commentCount,
        byUser: {},
      },
      meetings: {
        total: meetingCount,
        byStatus: {},
      },
      clientTherapistRelationships: relationshipCount,
      communityMemberships: membershipCount,
    };
  }

  /**
   * Identify what data is missing for each entity
   */
  private async identifyGaps(
    prisma: PrismaClient,
    audit: DatabaseAudit,
  ): Promise<DataGap[]> {
    const gaps: DataGap[] = [];

    // Check clients
    const clients = await prisma.client.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        _count: {
          select: {
            posts: true,
            comments: true,
            clientTherapists: true,
            communityMembers: true,
          },
        },
      },
    });

    for (const client of clients) {
      const clientGaps = [];
      const req = this.requirements.client;

      if (client._count.posts < req.posts) {
        clientGaps.push({
          field: 'posts',
          current: client._count.posts,
          required: req.posts,
          missing: req.posts - client._count.posts,
        });
      }

      if (client._count.comments < req.comments) {
        clientGaps.push({
          field: 'comments',
          current: client._count.comments,
          required: req.comments,
          missing: req.comments - client._count.comments,
        });
      }

      if (client._count.communityMembers < req.communityMemberships) {
        clientGaps.push({
          field: 'communityMemberships',
          current: client._count.communityMembers,
          required: req.communityMemberships,
          missing: req.communityMemberships - client._count.communityMembers,
        });
      }

      if (clientGaps.length > 0) {
        gaps.push({
          entityType: 'client',
          entityId: client.userId,
          entityName: `${client.user.firstName} ${client.user.lastName}`,
          gaps: clientGaps,
        });
      }
    }

    // Check therapists
    const therapists = await prisma.therapist.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        _count: {
          select: {
            clientTherapists: true,
            posts: true,
            comments: true,
            meetings: true,
          },
        },
      },
    });

    for (const therapist of therapists) {
      const therapistGaps = [];
      const req = this.requirements.therapist;

      if (therapist._count.clientTherapists < req.clientRelationships) {
        therapistGaps.push({
          field: 'clientRelationships',
          current: therapist._count.clientTherapists,
          required: req.clientRelationships,
          missing: req.clientRelationships - therapist._count.clientTherapists,
        });
      }

      if (therapist._count.posts < req.posts) {
        therapistGaps.push({
          field: 'posts',
          current: therapist._count.posts,
          required: req.posts,
          missing: req.posts - therapist._count.posts,
        });
      }

      if (therapistGaps.length > 0) {
        gaps.push({
          entityType: 'therapist',
          entityId: therapist.userId,
          entityName: `${therapist.user.firstName} ${therapist.user.lastName}`,
          gaps: therapistGaps,
        });
      }
    }

    return gaps;
  }

  /**
   * Fill identified data gaps
   */
  private async fillGaps(
    prisma: PrismaClient,
    gaps: DataGap[],
  ): Promise<Record<string, number>> {
    const itemsAdded: Record<string, number> = {
      posts: 0,
      comments: 0,
      meetings: 0,
      memberships: 0,
      messages: 0,
      worksheets: 0,
      availability: 0,
      clientRelationships: 0,
    };

    if (gaps.length === 0) {
      console.log('  ✅ No gaps found - all requirements satisfied!');
      return itemsAdded;
    }

    console.log(`  Found ${gaps.length} entities with missing data`);

    // Initialize enrichers
    const clientEnricher = new ClientDataEnricher(prisma);
    const therapistEnricher = new TherapistDataEnricher(prisma);

    // Process each gap
    for (const gap of gaps) {
      console.log(`  📝 Enriching ${gap.entityType}: ${gap.entityName}`);

      for (const dataGap of gap.gaps) {
        console.log(`     Adding ${dataGap.missing} ${dataGap.field}`);

        try {
          let added = 0;

          // Route to appropriate enricher
          if (gap.entityType === 'client') {
            added = await this.enrichClientData(
              clientEnricher,
              gap.entityId,
              dataGap.field,
              dataGap.current,
              dataGap.required,
            );
          } else if (gap.entityType === 'therapist') {
            added = await this.enrichTherapistData(
              therapistEnricher,
              gap.entityId,
              dataGap.field,
              dataGap.current,
              dataGap.required,
            );
          }

          itemsAdded[dataGap.field] = (itemsAdded[dataGap.field] ?? 0) + added;
        } catch (error) {
          console.error(`     ❌ Failed to add ${dataGap.field}:`, error);
        }
      }
    }

    return itemsAdded;
  }

  /**
   * Enrich client data
   */
  private async enrichClientData(
    enricher: ClientDataEnricher,
    clientId: string,
    field: string,
    current: number,
    required: number,
  ): Promise<number> {
    switch (field) {
      case 'posts':
        return enricher.ensureMinimumPosts(clientId, current, required);
      case 'comments':
        return enricher.ensureMinimumComments(clientId, current, required);
      case 'communityMemberships':
        return enricher.ensureMinimumCommunityMemberships(
          clientId,
          current,
          required,
        );
      default:
        console.warn(`Unknown client field: ${field}`);
        return 0;
    }
  }

  /**
   * Enrich therapist data
   */
  private async enrichTherapistData(
    enricher: TherapistDataEnricher,
    therapistId: string,
    field: string,
    current: number,
    required: number,
  ): Promise<number> {
    switch (field) {
      case 'clientRelationships':
        return enricher.ensureMinimumClientRelationships(
          therapistId,
          current,
          required,
        );
      case 'posts':
        // Therapists can use same post enricher as clients
        return 0; // TODO: Implement therapist posts
      case 'availability':
        return enricher.ensureAvailabilitySchedule(therapistId, required);
      default:
        console.warn(`Unknown therapist field: ${field}`);
        return 0;
    }
  }

  /**
   * Display audit results
   */
  private displayAudit(audit: DatabaseAudit): void {
    console.log(`  👥 Users: ${audit.users.total}`);
    console.log(`     - Clients: ${audit.users.byRole['client'] ?? 0}`);
    console.log(`     - Therapists: ${audit.users.byRole['therapist'] ?? 0}`);
    console.log(`     - Admins: ${audit.users.byRole['admin'] ?? 0}`);
    console.log(`     - Moderators: ${audit.users.byRole['moderator'] ?? 0}`);
    console.log(`  🏘️  Communities: ${audit.communities.total}`);
    console.log(`  💬 Posts: ${audit.posts.total}`);
    console.log(`  💭 Comments: ${audit.comments.total}`);
    console.log(`  🩺 Meetings: ${audit.meetings.total}`);
    console.log(
      `  🤝 Client-Therapist Relationships: ${audit.clientTherapistRelationships}`,
    );
    console.log(`  👥 Community Memberships: ${audit.communityMemberships}`);
  }

  /**
   * Display identified gaps
   */
  private displayGaps(gaps: DataGap[]): void {
    if (gaps.length === 0) {
      console.log('  ✅ All minimum requirements satisfied!');
      return;
    }

    console.log(`  ⚠️  Found ${gaps.length} entities needing more data:`);

    const summary: Record<string, number> = {};
    gaps.forEach((gap) => {
      gap.gaps.forEach((g) => {
        summary[g.field] = (summary[g.field] ?? 0) + g.missing;
      });
    });

    Object.entries(summary).forEach(([field, count]) => {
      console.log(`     - ${field}: ${count} items needed`);
    });
  }
}
