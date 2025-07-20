// Main Seed Orchestrator
// Coordinates all seeding modules in the correct order

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG } from './config';
import { seedUsers } from './users.seed';
import { seedCommunities, seedMemberships } from './communities.seed';
import { 
  seedClientTherapistRelationships, 
  seedMeetings, 
  seedTherapistAvailability 
} from './relationships.seed';
import { seedPreAssessments } from './assessments.seed';
import { seedCommunityContent } from './content.seed';
import { seedMessaging } from './messaging.seed';
import { seedWorksheets } from './worksheets.seed';
import { seedReviews } from './reviews.seed';
import { seedSessions } from './sessions.seed';
import { seedNotifications } from './notifications.seed';
import { seedTherapistRequests } from './therapist-requests.seed';
import { seedAuditLogs } from './audit-logs.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('📊 Seed configuration:', SEED_CONFIG);

  try {
    // Phase 1: Users
    console.log('\n📍 PHASE 1: Creating Users');
    const { users, clients, therapists } = await seedUsers(prisma);

    // Phase 2: Communities
    console.log('\n📍 PHASE 2: Creating Communities');
    const communities = await seedCommunities(prisma);

    // Phase 3: Memberships
    console.log('\n📍 PHASE 3: Creating Community Memberships');
    await seedMemberships(prisma, users, communities);

    // Phase 4: Client-Therapist Relationships
    console.log('\n📍 PHASE 4: Creating Client-Therapist Relationships');
    const relationships = await seedClientTherapistRelationships(
      prisma,
      clients,
      therapists,
    );

    // Phase 5: Pre-assessments
    console.log('\n📍 PHASE 5: Creating Pre-Assessments');
    await seedPreAssessments(prisma, clients);

    // Phase 6: Meetings
    console.log('\n📍 PHASE 6: Creating Meetings');
    await seedMeetings(prisma, relationships);

    // Phase 7: Community Content
    console.log('\n📍 PHASE 7: Creating Community Content');
    await seedCommunityContent(prisma, communities, users);

    // Phase 8: Therapist Availability
    console.log('\n📍 PHASE 8: Creating Therapist Availability');
    await seedTherapistAvailability(prisma, therapists);

    // Phase 9: Messaging System
    console.log('\n📍 PHASE 9: Creating Conversations and Messages');
    const messagingData = await seedMessaging(prisma, relationships, users);

    // Phase 10: Worksheets and Therapy Materials
    console.log('\n📍 PHASE 10: Creating Worksheets and Submissions');
    const worksheetData = await seedWorksheets(prisma, relationships);

    // Phase 11: Therapist Reviews
    console.log('\n📍 PHASE 11: Creating Therapist Reviews');
    const meetings = []; // Placeholder for meetings data
    const reviewData = await seedReviews(prisma, relationships, meetings, users);

    // Phase 12: Session Records
    console.log('\n📍 PHASE 12: Creating Session Records and Notes');
    const sessionData = await seedSessions(prisma, relationships, meetings, users);

    // Phase 13: Notifications System
    console.log('\n📍 PHASE 13: Creating Notifications and Device Tokens');
    const notificationData = await seedNotifications(prisma, users, relationships, meetings, worksheetData?.worksheets || [], messagingData?.messages || []);

    // Phase 14: Therapist Requests
    console.log('\n📍 PHASE 14: Creating Client-Therapist Requests');
    const requests = await seedTherapistRequests(prisma, clients, therapists, relationships);

    // Phase 15: Admin and System Audit Logs
    console.log('\n📍 PHASE 15: Creating Audit Logs');
    const audits = await seedAuditLogs(prisma, users, users.filter(u => u.role === 'admin'));

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Users: ${users.length} total`);
    console.log(`   🔹 Clients: ${clients.length}`);
    console.log(`   🔹 Therapists: ${therapists.length}`);
    console.log(`   🔹 Admins: ${SEED_CONFIG.USERS.ADMINS}`);
    console.log(`   🔹 Moderators: ${SEED_CONFIG.USERS.MODERATORS}`);
    console.log(`   🏘️  Communities: ${communities.length}`);
    console.log(`   🤝 Client-Therapist Relationships: ${relationships.length}`);
    console.log(`   📅 Meetings: ${relationships.length * SEED_CONFIG.RELATIONSHIPS.MEETINGS_PER_RELATIONSHIP} (average)`);
    console.log(`   📋 Pre-assessments: ${Math.floor(clients.length * SEED_CONFIG.ASSESSMENTS.COMPLETION_RATE)}`);
    console.log(`   📝 Posts per community: ${SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY}`);
    console.log(`   💬 Comments per post: ${SEED_CONFIG.COMMUNITIES.COMMENTS_PER_POST}`);
    console.log(`   💬 Conversations: ${messagingData?.conversations?.length || 'N/A'}`);
    console.log(`   📚 Worksheets: ${worksheetData?.worksheets?.length || 'N/A'}`);
    console.log(`   ⭐ Reviews: ${reviewData?.reviews?.length || 'N/A'}`);
    console.log(`   📊 Session Records: ${sessionData?.sessionLogs?.length || 'N/A'}`);
    console.log(`   🔔 Notifications: ${notificationData?.notifications?.length || 'N/A'}`);
    console.log(`   📤 Therapist Requests: ${requests?.length || 'N/A'}`);
    console.log(`   📋 Audit Logs: ${audits?.length || 'N/A'}`);
    
    console.log('\n✨ Comprehensive platform seeding complete!');
    console.log('🏘️  Communities are ready for assessment-based recommendations');
    console.log('📱 Discord-like room structure created for all communities');
    console.log('💬 Reddit-like content and interaction system populated');
    console.log('📲 Messaging system with therapy conversations active');
    console.log('📚 Worksheets and therapy materials ready for assignment');
    console.log('⭐ Review system populated for therapist recommendations');
    console.log('📊 Session tracking and progress monitoring enabled');
    console.log('🔔 Notification system with realistic user engagement');
    console.log('📤 Client-therapist request workflow populated');
    console.log('📋 Audit logs ready for admin compliance monitoring');
    
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