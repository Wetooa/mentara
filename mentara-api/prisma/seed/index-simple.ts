// Ultra-Fast Development Seed Script
// Simple 4-phase seeding for rapid development with all role tables

import { PrismaClient, User, Community } from '@prisma/client';
import { SEED_CONFIG, ILLNESS_COMMUNITIES } from './config';
import { seedUsers } from './users.seed';
import { seedCommunities, seedMemberships, seedModeratorCommunityAssignments } from './communities.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ultra-fast development seeding...');
  console.log('📊 Creating minimal data for development with all role tables...');

  try {
    // Phase 1: Create Essential Users (3 of each role)
    console.log('\n📍 PHASE 1: Creating Users and Role Tables');
    const { users, clients, therapists, moderators, admins } = await seedUsers(prisma, 'simple');

    // Phase 2: Create Basic Communities
    console.log('\n📍 PHASE 2: Creating Communities');
    const communities = await seedCommunities(prisma);

    // Phase 3: Create Basic Memberships (join clients to communities)
    console.log('\n📍 PHASE 3: Creating Community Memberships');
    await seedMemberships(prisma, users, communities);

    // Phase 4: Create Moderator-Community Relationships
    console.log('\n📍 PHASE 4: Creating Moderator-Community Assignments');
    await seedModeratorCommunityAssignments(prisma, moderators, communities);

    // Summary
    console.log('\n🎉 Ultra-fast seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Total Users: ${users.length}`);
    console.log(`   🔹 Clients: ${clients.length} (with Client table entries)`);
    console.log(`   🔹 Therapists: ${therapists.length} (with Therapist table entries)`);
    console.log(`   🔹 Admins: ${admins.length} (with Admin table entries)`);
    console.log(`   🔹 Moderators: ${moderators.length} (with Moderator table entries)`);
    console.log(`   🏘️  Communities: ${communities.length}`);
    console.log('\n✨ Ready for development! All user roles and tables created.');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });