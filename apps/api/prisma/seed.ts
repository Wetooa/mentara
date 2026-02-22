#!/usr/bin/env tsx
/**
 * Mentara Database Seeding System
 *
 * A simplified, reliable database seeding system that creates realistic test data
 * for development, testing, and demo environments.
 *
 * Usage:
 *   npm run db:seed              # Default (medium) seeding (empty DB only, or use --force to wipe)
 *   npm run db:seed -- --add     # Additive: ensure test data + top up to config + enrichers (never wipes)
 *   npm run db:seed -- --force   # Wipe all tables then full seed
 *   npm run db:seed:light        # Minimal data
 *   npm run db:seed:medium       # Balanced data
 *   npm run db:seed:heavy        # Rich data
 */

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG, SeedMode } from './seed/config';
import { generateUsers, ensureTestAccounts, addUsersUpTo } from './seed/generators/users';
import {
  generateCommunities,
  ensureTestCommunities,
  addCommunitiesUpTo,
} from './seed/generators/communities';
import { generateRelationships } from './seed/generators/relationships';
import { generateContent } from './seed/generators/content';
import { generateTherapyData } from './seed/generators/therapy';
import { HybridSeedOrchestrator } from './seed/dynamic/hybrid-seed-orchestrator';

const prisma = new PrismaClient();

/**
 * Truncate all tables in the public schema (CASCADE) for a clean force-reseed.
 */
async function truncateAllTables(prismaInstance: PrismaClient): Promise<void> {
  await prismaInstance.$executeRawUnsafe(`
    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
      LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
}

interface SeedOptions {
  mode: SeedMode;
  force?: boolean;
  additive?: boolean;
  verbose?: boolean;
}

class DatabaseSeeder {
  private options: SeedOptions;
  private startTime: Date;

  constructor(options: SeedOptions) {
    this.options = options;
    this.startTime = new Date();
  }

  async seed(): Promise<void> {
    console.log('🌱 Mentara Database Seeding System');
    console.log('=====================================');
    console.log(`📊 Mode: ${this.options.mode}`);
    if (this.options.additive) console.log('📥 Additive mode (no tables wiped)');
    console.log(`🕐 Started at: ${this.startTime.toISOString()}`);
    console.log('');

    try {
      if (this.options.additive) {
        await this.seedAdditive();
        return;
      }

      if (!this.options.force) {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
          console.log(`⏭️  Database already seeded with ${userCount} users`);
          console.log('   Use --force to wipe and reseed, or --add to add more data');
          return;
        }
      } else {
        console.log('🧹 Force reseed: clearing all tables...');
        await truncateAllTables(prisma);
        console.log('✅ Tables cleared');
        console.log('');
      }

      const config = SEED_CONFIG[this.options.mode];
      this.log(`📋 Configuration: ${JSON.stringify(config, null, 2)}`);

      // Sequential seeding with dependency management
      console.log('👥 Step 1: Creating users and profiles...');
      const usersData = await generateUsers(prisma, config.users);
      console.log(`✅ Created ${usersData.users.length} users`);

      console.log('🏘️  Step 2: Creating communities...');
      const communitiesData = await generateCommunities(
        prisma,
        config.communities,
      );
      console.log(
        `✅ Created ${communitiesData.communities.length} communities`,
      );

      console.log('🤝 Step 3: Creating relationships and memberships...');
      const relationshipsData = await generateRelationships(
        prisma,
        config.relationships,
        usersData,
        communitiesData,
      );
      console.log(
        `✅ Created ${relationshipsData.clientTherapistRelationships.length} client-therapist relationships`,
      );

      console.log('💬 Step 4: Creating content and engagement...');
      const contentData = await generateContent(
        prisma,
        config.content,
        usersData,
        communitiesData,
      );
      console.log(
        `✅ Created ${contentData.posts.length} posts and ${contentData.comments.length} comments`,
      );

      console.log('🩺 Step 5: Creating therapy data...');
      const therapyData = await generateTherapyData(
        prisma,
        config.therapy,
        relationshipsData,
        usersData,
      );
      console.log(
        `✅ Created ${therapyData.meetings.length} meetings and ${therapyData.worksheets.length} worksheets`,
      );

      // NEW: Dynamic enrichment phase
      console.log('');
      console.log('✨ Step 6: Dynamic enrichment (ensuring minimums)...');
      const hybridOrchestrator = new HybridSeedOrchestrator();
      const enrichmentReport = await hybridOrchestrator.enrichAllTables(prisma);

      if (enrichmentReport.totalItemsAdded > 0) {
        console.log(
          `\n  📊 Enrichment added ${enrichmentReport.totalItemsAdded} items`,
        );
      }

      // Verification
      console.log('');
      console.log('✅ Step 7: Verifying minimum requirements...');
      await hybridOrchestrator.verifyMinimumRequirements(prisma);

      const duration = Date.now() - this.startTime.getTime();
      console.log('');
      console.log('🎉 Hybrid database seeding completed successfully!');
      console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
      await this.printSummary();
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  /**
   * Additive seed: ensure test data exists, top up users/communities to config, then run enrichers.
   * Never truncates or overwrites existing data.
   */
  private async seedAdditive(): Promise<void> {
    const config = SEED_CONFIG[this.options.mode];

    console.log('📌 Step 1: Ensuring test accounts exist...');
    const accountsCreated = await ensureTestAccounts(prisma);
    console.log(`✅ Test accounts: ${accountsCreated} created (rest already existed)`);
    console.log('');

    console.log('📌 Step 2: Ensuring test communities and room structure...');
    const communitiesEnsured = await ensureTestCommunities(prisma);
    console.log(`✅ Test communities: ${communitiesEnsured} created (rest already existed)`);
    console.log('');

    console.log('📌 Step 3: Topping up users to config targets...');
    const usersAdded = await addUsersUpTo(prisma, config.users);
    console.log(`✅ Users added: ${usersAdded}`);
    console.log('');

    console.log('📌 Step 4: Topping up communities to config targets...');
    const communitiesAdded = await addCommunitiesUpTo(prisma, config.communities);
    console.log(`✅ Communities added: ${communitiesAdded}`);
    console.log('');

    console.log('✨ Step 5: Dynamic enrichment (relationships, posts, comments, meetings, etc.)...');
    const hybridOrchestrator = new HybridSeedOrchestrator();
    const enrichmentReport = await hybridOrchestrator.enrichAllTables(prisma);
    if (enrichmentReport.totalItemsAdded > 0) {
      console.log(`\n  📊 Enrichment added ${enrichmentReport.totalItemsAdded} items`);
    }
    console.log('');

    console.log('✅ Step 6: Verifying minimum requirements...');
    await hybridOrchestrator.verifyMinimumRequirements(prisma);

    const duration = Date.now() - this.startTime.getTime();
    console.log('');
    console.log('🎉 Additive seeding completed successfully!');
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    await this.printSummary();
  }

  private log(message: string): void {
    if (this.options.verbose) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  private async printSummary(): Promise<void> {
    console.log('');
    console.log('📊 Database Summary:');
    console.log('===================');

    const counts = await Promise.all([
      prisma.user.count(),
      prisma.community.count(),
      prisma.clientTherapist.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.meeting.count(),
      prisma.worksheet.count(),
      prisma.preAssessment.count(),
      prisma.groupTherapySession.count(),
    ]);

    const [
      users,
      communities,
      relationships,
      posts,
      comments,
      meetings,
      worksheets,
      assessments,
      groupSessions,
    ] = counts;

    console.log(`👥 Users: ${users}`);
    console.log(`🏘️  Communities: ${communities}`);
    console.log(`🤝 Client-Therapist Pairs: ${relationships}`);
    console.log(`📝 Posts: ${posts}`);
    console.log(`💬 Comments: ${comments}`);
    console.log(`📅 Meetings: ${meetings}`);
    console.log(`📋 Worksheets: ${worksheets}`);
    console.log(`🧠 Assessments: ${assessments}`);
    console.log(`📆 Group Sessions: ${groupSessions}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  const modeArg = args
    .find((arg) => arg.startsWith('--mode='))
    ?.split('=')[1] as SeedMode;
  const mode: SeedMode = modeArg || 'medium';
  const force = args.includes('--force');
  const additive = args.includes('--add');
  const verbose = args.includes('--verbose');

  if (force && additive) {
    console.error('❌ Cannot use both --force and --add');
    process.exit(1);
  }

  if (!['light', 'medium', 'heavy'].includes(mode)) {
    console.error('❌ Invalid mode. Use: light, medium, or heavy');
    process.exit(1);
  }

  const seeder = new DatabaseSeeder({ mode, force, additive, verbose });

  try {
    await seeder.seed();
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseSeeder };
