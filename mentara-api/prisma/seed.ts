#!/usr/bin/env tsx
/**
 * Mentara Database Seeding System
 * 
 * A simplified, reliable database seeding system that creates realistic test data
 * for development, testing, and demo environments.
 * 
 * Usage:
 *   npm run db:seed           # Default (medium) seeding
 *   npm run db:seed:light     # Minimal data for development
 *   npm run db:seed:medium    # Balanced data for testing
 *   npm run db:seed:heavy     # Rich data for demos
 */

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG, SeedMode } from './seed/config';
import { generateUsers } from './seed/generators/users';
import { generateCommunities } from './seed/generators/communities';
import { generateRelationships } from './seed/generators/relationships';
import { generateContent } from './seed/generators/content';
import { generateTherapyData } from './seed/generators/therapy';
import { HybridSeedOrchestrator } from './seed/dynamic/hybrid-seed-orchestrator';

const prisma = new PrismaClient();

interface SeedOptions {
  mode: SeedMode;
  force?: boolean;
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
    console.log(`🕐 Started at: ${this.startTime.toISOString()}`);
    console.log('');

    try {
      // Check if database already has data
      if (!this.options.force) {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
          console.log(`⏭️  Database already seeded with ${userCount} users`);
          console.log('   Use --force flag to reseed');
          return;
        }
      }

      const config = SEED_CONFIG[this.options.mode];
      this.log(`📋 Configuration: ${JSON.stringify(config, null, 2)}`);

      // Sequential seeding with dependency management
      console.log('👥 Step 1: Creating users and profiles...');
      const usersData = await generateUsers(prisma, config.users);
      console.log(`✅ Created ${usersData.users.length} users`);

      console.log('🏘️  Step 2: Creating communities...');
      const communitiesData = await generateCommunities(prisma, config.communities);
      console.log(`✅ Created ${communitiesData.communities.length} communities`);

      console.log('🤝 Step 3: Creating relationships and memberships...');
      const relationshipsData = await generateRelationships(
        prisma, 
        config.relationships, 
        usersData, 
        communitiesData
      );
      console.log(`✅ Created ${relationshipsData.clientTherapistRelationships.length} client-therapist relationships`);

      console.log('💬 Step 4: Creating content and engagement...');
      const contentData = await generateContent(
        prisma, 
        config.content, 
        usersData, 
        communitiesData
      );
      console.log(`✅ Created ${contentData.posts.length} posts and ${contentData.comments.length} comments`);

      console.log('🩺 Step 5: Creating therapy data...');
      const therapyData = await generateTherapyData(
        prisma, 
        config.therapy, 
        relationshipsData,
        usersData
      );
      console.log(`✅ Created ${therapyData.meetings.length} meetings and ${therapyData.worksheets.length} worksheets`);

      // NEW: Dynamic enrichment phase
      console.log('');
      console.log('✨ Step 6: Dynamic enrichment (ensuring minimums)...');
      const hybridOrchestrator = new HybridSeedOrchestrator();
      const enrichmentReport = await hybridOrchestrator.enrichAllTables(prisma);
      
      if (enrichmentReport.totalItemsAdded > 0) {
        console.log(`\n  📊 Enrichment added ${enrichmentReport.totalItemsAdded} items`);
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
    ]);

    const [users, communities, relationships, posts, comments, meetings, worksheets, assessments] = counts;

    console.log(`👥 Users: ${users}`);
    console.log(`🏘️  Communities: ${communities}`);
    console.log(`🤝 Client-Therapist Pairs: ${relationships}`);
    console.log(`📝 Posts: ${posts}`);
    console.log(`💬 Comments: ${comments}`);
    console.log(`📅 Meetings: ${meetings}`);
    console.log(`📋 Worksheets: ${worksheets}`);
    console.log(`🧠 Assessments: ${assessments}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const modeArg = args.find(arg => arg.startsWith('--mode='))?.split('=')[1] as SeedMode;
  const mode: SeedMode = modeArg || 'medium';
  const force = args.includes('--force');
  const verbose = args.includes('--verbose');

  // Validate mode
  if (!['light', 'medium', 'heavy'].includes(mode)) {
    console.error('❌ Invalid mode. Use: light, medium, or heavy');
    process.exit(1);
  }

  const seeder = new DatabaseSeeder({ mode, force, verbose });
  
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