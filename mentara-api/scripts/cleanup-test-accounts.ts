import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNTS } from './create-test-accounts';

const prisma = new PrismaClient();

/**
 * Comprehensive test account cleanup utility
 */
async function cleanupTestAccounts() {
  console.log('🧹 Starting test account cleanup...\n');

  try {
    const testEmailPattern = 'mentaratest.dev';
    const testCommunityPattern = '-test';

    // Get statistics before cleanup
    const statsBefore = await getTestAccountStatistics();
    console.log('📊 Before cleanup:');
    printStatistics(statsBefore);

    // Clean up in specific order to respect foreign key constraints
    await cleanupTestData();
    await cleanupTestUsers();
    await cleanupTestCommunities();

    // Get statistics after cleanup
    const statsAfter = await getTestAccountStatistics();
    console.log('\n📊 After cleanup:');
    printStatistics(statsAfter);

    console.log('\n🎉 Test account cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up test data (messages, worksheets, sessions, etc.)
 */
async function cleanupTestData() {
  console.log('1. Cleaning up test data...');

  const testUsers = await prisma.user.findMany({
    where: { email: { contains: 'mentaratest.dev' } },
    select: { id: true }
  });

  const testUserIds = testUsers.map(u => u.id);

  if (testUserIds.length === 0) {
    console.log('   ⏭️  No test users found');
    return;
  }

  // Clean up notifications
  const deletedNotifications = await prisma.notification.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedNotifications.count} test notifications`);

  // Clean up worksheet submissions
  const deletedSubmissions = await prisma.worksheetSubmission.deleteMany({
    where: { 
      worksheet: {
        OR: [
          { clientId: { in: testUserIds } },
          { therapistId: { in: testUserIds } }
        ]
      }
    }
  });
  console.log(`   ✅ Deleted ${deletedSubmissions.count} worksheet submissions`);

  // Clean up worksheet materials
  const deletedMaterials = await prisma.worksheetMaterial.deleteMany({
    where: {
      worksheet: {
        OR: [
          { clientId: { in: testUserIds } },
          { therapistId: { in: testUserIds } }
        ]
      }
    }
  });
  console.log(`   ✅ Deleted ${deletedMaterials.count} worksheet materials`);

  // Clean up worksheets
  const deletedWorksheets = await prisma.worksheet.deleteMany({
    where: {
      OR: [
        { clientId: { in: testUserIds } },
        { therapistId: { in: testUserIds } }
      ]
    }
  });
  console.log(`   ✅ Deleted ${deletedWorksheets.count} test worksheets`);

  // Clean up meetings/sessions
  const deletedMeetings = await prisma.meeting.deleteMany({
    where: {
      OR: [
        { clientId: { in: testUserIds } },
        { therapistId: { in: testUserIds } }
      ]
    }
  });
  console.log(`   ✅ Deleted ${deletedMeetings.count} test meetings`);

  // Clean up message reactions
  const deletedReactions = await prisma.messageReaction.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedReactions.count} message reactions`);

  // Clean up message read receipts
  const deletedReadReceipts = await prisma.messageReadReceipt.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedReadReceipts.count} read receipts`);

  // Clean up messages
  const deletedMessages = await prisma.message.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedMessages.count} test messages`);

  // Clean up conversation participants
  const deletedParticipants = await prisma.conversationParticipant.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedParticipants.count} conversation participants`);

  // Clean up conversations (only those with no remaining participants)
  const conversationsToDelete = await prisma.conversation.findMany({
    where: {
      participants: { none: {} }
    },
    select: { id: true }
  });
  
  const deletedConversations = await prisma.conversation.deleteMany({
    where: { id: { in: conversationsToDelete.map(c => c.id) } }
  });
  console.log(`   ✅ Deleted ${deletedConversations.count} empty conversations`);

  // Clean up typing indicators
  const deletedTypingIndicators = await prisma.typingIndicator.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedTypingIndicators.count} typing indicators`);

  // Clean up user blocks
  const deletedUserBlocks = await prisma.userBlock.deleteMany({
    where: {
      OR: [
        { blockerId: { in: testUserIds } },
        { blockedId: { in: testUserIds } }
      ]
    }
  });
  console.log(`   ✅ Deleted ${deletedUserBlocks.count} user blocks`);
}

/**
 * Clean up test users and related records
 */
async function cleanupTestUsers() {
  console.log('\n2. Cleaning up test users...');

  const testUsers = await prisma.user.findMany({
    where: { email: { contains: 'mentaratest.dev' } },
    select: { id: true, role: true }
  });

  const testUserIds = testUsers.map(u => u.id);

  if (testUserIds.length === 0) {
    console.log('   ⏭️  No test users found');
    return;
  }

  // Clean up client-therapist relationships
  const deletedRelationships = await prisma.clientTherapist.deleteMany({
    where: {
      OR: [
        { clientId: { in: testUserIds } },
        { therapistId: { in: testUserIds } }
      ]
    }
  });
  console.log(`   ✅ Deleted ${deletedRelationships.count} client-therapist relationships`);

  // Clean up memberships
  const deletedMemberships = await prisma.membership.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedMemberships.count} community memberships`);

  // Clean up posts
  const deletedPosts = await prisma.post.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedPosts.count} test posts`);

  // Clean up comments
  const deletedComments = await prisma.comment.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedComments.count} test comments`);

  // Clean up role-specific records
  const deletedClients = await prisma.client.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedClients.count} client records`);

  const deletedTherapists = await prisma.therapist.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedTherapists.count} therapist records`);

  const deletedModerators = await prisma.moderator.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedModerators.count} moderator records`);

  const deletedAdmins = await prisma.admin.deleteMany({
    where: { userId: { in: testUserIds } }
  });
  console.log(`   ✅ Deleted ${deletedAdmins.count} admin records`);

  // Finally, delete the users themselves
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { contains: 'mentaratest.dev' } }
  });
  console.log(`   ✅ Deleted ${deletedUsers.count} test user accounts`);
}

/**
 * Clean up test communities
 */
async function cleanupTestCommunities() {
  console.log('\n3. Cleaning up test communities...');

  // Delete test communities (those ending with -test)
  const deletedCommunities = await prisma.community.deleteMany({
    where: { slug: { endsWith: '-test' } }
  });
  console.log(`   ✅ Deleted ${deletedCommunities.count} test communities`);
}

/**
 * Get test account statistics
 */
async function getTestAccountStatistics() {
  const users = await prisma.user.count({
    where: { email: { contains: 'mentaratest.dev' } }
  });

  const clients = await prisma.client.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  const therapists = await prisma.therapist.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  const moderators = await prisma.moderator.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  const admins = await prisma.admin.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  const communities = await prisma.community.count({
    where: { slug: { endsWith: '-test' } }
  });

  const memberships = await prisma.membership.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  const conversations = await prisma.conversation.count({
    where: {
      participants: {
        some: {
          user: { email: { contains: 'mentaratest.dev' } }
        }
      }
    }
  });

  const messages = await prisma.message.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  const worksheets = await prisma.worksheet.count({
    where: {
      OR: [
        { client: { user: { email: { contains: 'mentaratest.dev' } } } },
        { therapist: { user: { email: { contains: 'mentaratest.dev' } } } }
      ]
    }
  });

  const meetings = await prisma.meeting.count({
    where: {
      OR: [
        { client: { user: { email: { contains: 'mentaratest.dev' } } } },
        { therapist: { user: { email: { contains: 'mentaratest.dev' } } } }
      ]
    }
  });

  const notifications = await prisma.notification.count({
    where: { user: { email: { contains: 'mentaratest.dev' } } }
  });

  return {
    users,
    clients,
    therapists,
    moderators,
    admins,
    communities,
    memberships,
    conversations,
    messages,
    worksheets,
    meetings,
    notifications,
  };
}

/**
 * Print statistics in a formatted way
 */
function printStatistics(stats: any) {
  console.log(`   • Users: ${stats.users}`);
  console.log(`   • Clients: ${stats.clients}`);
  console.log(`   • Therapists: ${stats.therapists}`);
  console.log(`   • Moderators: ${stats.moderators}`);
  console.log(`   • Admins: ${stats.admins}`);
  console.log(`   • Communities: ${stats.communities}`);
  console.log(`   • Memberships: ${stats.memberships}`);
  console.log(`   • Conversations: ${stats.conversations}`);
  console.log(`   • Messages: ${stats.messages}`);
  console.log(`   • Worksheets: ${stats.worksheets}`);
  console.log(`   • Meetings: ${stats.meetings}`);
  console.log(`   • Notifications: ${stats.notifications}`);
}

/**
 * Cleanup specific account types
 */
async function cleanupByRole(role: string) {
  console.log(`🧹 Cleaning up ${role} test accounts...\n`);

  try {
    const users = await prisma.user.findMany({
      where: {
        email: { contains: 'mentaratest.dev' },
        role: role
      },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    console.log(`Found ${users.length} ${role} test accounts`);

    for (const user of users) {
      console.log(`   Cleaning up: ${user.firstName} ${user.lastName} (${user.email})`);

      // Delete role-specific records first
      switch (role) {
        case 'client':
          await prisma.client.deleteMany({ where: { userId: user.id } });
          break;
        case 'therapist':
          await prisma.therapist.deleteMany({ where: { userId: user.id } });
          break;
        case 'moderator':
          await prisma.moderator.deleteMany({ where: { userId: user.id } });
          break;
        case 'admin':
          await prisma.admin.deleteMany({ where: { userId: user.id } });
          break;
      }

      // Delete related data
      await prisma.notification.deleteMany({ where: { userId: user.id } });
      await prisma.membership.deleteMany({ where: { userId: user.id } });
      
      // Delete the user
      await prisma.user.delete({ where: { id: user.id } });
    }

    console.log(`✅ Cleaned up ${users.length} ${role} accounts`);

  } catch (error) {
    console.error(`❌ Error cleaning up ${role} accounts:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Verify Clerk users are deleted (would need Clerk MCP integration)
 */
async function verifyClerkCleanup() {
  console.log('\n🔍 Verifying Clerk user cleanup...');

  // This would require Clerk MCP integration to delete users from Clerk
  // For now, we'll just list the users that should be cleaned up from Clerk
  
  const allTestEmails = Object.values(TEST_ACCOUNTS).flat().map(account => account.email);
  
  console.log('📋 Test accounts that should be cleaned up from Clerk:');
  allTestEmails.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email}`);
  });

  console.log('\n⚠️  Note: Clerk user cleanup must be done separately using Clerk MCP or Clerk Dashboard');
}

/**
 * Reset test environment (cleanup + recreate)
 */
async function resetTestEnvironment() {
  console.log('🔄 Resetting test environment...\n');

  try {
    // First, cleanup existing test data
    await cleanupTestAccounts();

    console.log('\n🌱 Recreating test accounts...');

    // Import and run test account creation
    const { createTestAccounts } = await import('./create-test-accounts');
    await createTestAccounts();

    console.log('\n🎉 Test environment reset completed successfully!');

  } catch (error) {
    console.error('❌ Error resetting test environment:', error);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main() {
  const command = process.argv[2];
  const roleFilter = process.argv[3];

  switch (command) {
    case 'all':
      await cleanupTestAccounts();
      break;
    case 'role':
      if (!roleFilter) {
        console.log('Error: Please specify a role (client, therapist, moderator, admin)');
        process.exit(1);
      }
      await cleanupByRole(roleFilter);
      break;
    case 'reset':
      await resetTestEnvironment();
      break;
    case 'stats':
      const stats = await getTestAccountStatistics();
      console.log('📊 Current test account statistics:');
      printStatistics(stats);
      break;
    case 'verify-clerk':
      await verifyClerkCleanup();
      break;
    default:
      console.log('Usage: npm run cleanup-test-accounts [command] [options]');
      console.log('');
      console.log('Commands:');
      console.log('  all              - Clean up all test accounts and data');
      console.log('  role <role>      - Clean up specific role (client|therapist|moderator|admin)');
      console.log('  reset            - Clean up and recreate all test accounts');
      console.log('  stats            - Show current test account statistics');
      console.log('  verify-clerk     - List test accounts that need Clerk cleanup');
      console.log('');
      console.log('Examples:');
      console.log('  npm run cleanup-test-accounts all');
      console.log('  npm run cleanup-test-accounts role client');
      console.log('  npm run cleanup-test-accounts reset');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  });
}

export { 
  cleanupTestAccounts, 
  cleanupByRole, 
  resetTestEnvironment, 
  getTestAccountStatistics, 
  verifyClerkCleanup 
};