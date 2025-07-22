// Ultra-Fast Development Seed Script
// Complete seeding with reduced data counts for rapid development

import { PrismaClient, User, Community } from '@prisma/client';
import { SIMPLE_SEED_CONFIG, ILLNESS_COMMUNITIES } from './config';
import { seedUsers } from './users.seed';
import { seedCommunities, seedMemberships, seedModeratorCommunityAssignments } from './communities.seed';
import { 
  seedClientTherapistRelationships, 
  seedMeetings, 
  seedMeetingNotes,
  seedTherapistAvailability 
} from './relationships.seed';
import { seedPreAssessments } from './assessments.seed';
import { seedCommunityContent } from './content.seed';
import { seedMessaging } from './messaging.seed';
import { seedWorksheets } from './worksheets.seed';
import { seedReviews } from './reviews.seed';
import { seedNotifications } from './notifications.seed';
import { seedPaymentMethods, seedPayments } from './payments.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ultra-fast development seeding...');
  console.log('📊 Creating minimal data for development with all features...');

  try {
    // Phase 1: Users
    console.log('\n📍 PHASE 1: Creating Users');
    const { users, clients, therapists, moderators, admins } = await seedUsers(prisma, 'simple');

    // Phase 2: Communities
    console.log('\n📍 PHASE 2: Creating Communities');
    const communities = await seedCommunities(prisma);

    // Phase 3: Memberships
    console.log('\n📍 PHASE 3: Creating Community Memberships');
    await seedMemberships(prisma, users, communities);

    // Phase 3.5: Moderator-Community Assignments
    console.log('\n📍 PHASE 3.5: Creating Moderator-Community Assignments');
    await seedModeratorCommunityAssignments(prisma, moderators, communities);

    // Phase 4: Client-Therapist Relationships
    console.log('\n📍 PHASE 4: Creating Client-Therapist Relationships');
    const relationships = await seedClientTherapistRelationships(
      prisma,
      clients,
      therapists,
      'simple'
    );

    // Phase 5: Pre-assessments
    console.log('\n📍 PHASE 5: Creating Pre-Assessments');
    await seedPreAssessments(prisma, clients, 'simple');

    // Phase 6: Meetings
    console.log('\n📍 PHASE 6: Creating Meetings');
    const meetings = await seedMeetings(prisma, relationships, 'simple');

    // Phase 6.5: Meeting Notes
    console.log('\n📍 PHASE 6.5: Creating Meeting Notes');
    await seedMeetingNotes(prisma, meetings);

    // Phase 7: Payment Methods
    console.log('\n📍 PHASE 7: Creating Payment Methods');
    const paymentMethods = await seedPaymentMethods(prisma, users);

    // Phase 8: Payment Transactions
    console.log('\n📍 PHASE 8: Creating Payment Transactions');
    const payments = await seedPayments(prisma, meetings, paymentMethods);

    // Phase 9: Community Content
    console.log('\n📍 PHASE 9: Creating Community Content');
    await seedCommunityContent(prisma, communities, users);

    // Phase 10: Therapist Availability
    console.log('\n📍 PHASE 10: Creating Therapist Availability');
    await seedTherapistAvailability(prisma, therapists);

    // Phase 11: Messaging System
    console.log('\n📍 PHASE 11: Creating Conversations and Messages');
    const messagingData = await seedMessaging(prisma, relationships, users);

    // Phase 12: Worksheets and Therapy Materials
    console.log('\n📍 PHASE 12: Creating Worksheets and Submissions');
    const worksheetData = await seedWorksheets(prisma, relationships);

    // Phase 13: Therapist Reviews
    console.log('\n📍 PHASE 13: Creating Therapist Reviews');
    const reviewData = await seedReviews(prisma, relationships, meetings, users);

    // Phase 14: Notifications System
    console.log('\n📍 PHASE 14: Creating Notifications and Device Tokens');
    const notificationData = await seedNotifications(prisma, users, relationships, meetings, worksheetData?.worksheets || [], messagingData?.messages || [], 'simple');

    // Summary
    console.log('\n🎉 Ultra-fast seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Users: ${users.length} total`);
    console.log(`   🔹 Clients: ${clients.length}`);
    console.log(`   🔹 Therapists: ${therapists.length}`);
    console.log(`   🔹 Admins: ${admins.length}`);
    console.log(`   🔹 Moderators: ${moderators.length}`);
    console.log(`   🏘️  Communities: ${communities.length}`);
    console.log(`   🤝 Client-Therapist Relationships: ${relationships.length}`);
    console.log(`   📅 Meetings: ${meetings.length}`);
    console.log(`   📋 Pre-assessments: Created for development`);
    console.log(`   📝 Posts per community: Minimal for development`);
    console.log(`   💬 Conversations: ${messagingData?.conversations?.length || 'N/A'}`);
    console.log(`   📚 Worksheets: ${worksheetData?.worksheets?.length || 'N/A'}`);
    console.log(`   ⭐ Reviews: ${reviewData?.reviews?.length || 'N/A'}`);
    console.log(`   🔔 Notifications: ${notificationData?.notifications?.length || 'N/A'}`);
    console.log(`   💳 Payment Methods: ${paymentMethods?.length || 'N/A'}`);
    console.log(`   💰 Payment Transactions: ${payments?.length || 'N/A'}`);
    
    console.log('\n✨ Ready for development! All features seeded with minimal data.');
    
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