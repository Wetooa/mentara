import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNTS } from '../scripts/create-test-accounts';

const prisma = new PrismaClient();

/**
 * Enhanced seed script for test accounts with comprehensive test data
 */
async function seedTestData() {
  console.log('🌱 Starting enhanced test data seeding...\n');

  try {
    // Create test accounts first
    console.log('1. Creating base test accounts...');
    await createTestUsers();

    // Create test communities and relationships
    console.log('2. Creating test communities and memberships...');
    await createTestCommunities();

    // Create test conversations and messages
    console.log('3. Creating test conversations...');
    await createTestConversations();

    // Create test worksheets and assignments
    console.log('4. Creating test worksheets...');
    await createTestWorksheets();

    // Create test client-therapist relationships
    console.log('5. Creating test therapeutic relationships...');
    await createTestTherapeuticRelationships();

    // Create test sessions and bookings
    console.log('6. Creating test sessions...');
    await createTestSessions();

    // Create test notifications
    console.log('7. Creating test notifications...');
    await createTestNotifications();

    console.log('\n🎉 Enhanced test data seeding completed successfully!');
    await printTestDataSummary();

  } catch (error) {
    console.error('❌ Error during enhanced seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Create all test users from the TEST_ACCOUNTS configuration
 */
async function createTestUsers() {
  const allAccounts = [
    ...TEST_ACCOUNTS.clients,
    ...TEST_ACCOUNTS.therapists,
    ...TEST_ACCOUNTS.moderators,
    ...TEST_ACCOUNTS.admins,
    ...TEST_ACCOUNTS.mixed
  ];

  for (const account of allAccounts) {
    await createTestUser(account);
  }

  console.log(`   ✅ Created ${allAccounts.length} test users`);
}

/**
 * Create individual test user with role-specific data
 */
async function createTestUser(account: any) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: account.clerkId }
  });

  if (existingUser) {
    return; // Skip if already exists
  }

  // Create base user
  const user = await prisma.user.create({
    data: {
      id: account.clerkId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      isActive: account.isActive ?? true,
      bio: `${account.description} - Created for comprehensive auth endpoint testing`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.firstName}`,
      address: `Test Address ${Math.floor(Math.random() * 1000)}, Test City`,
      birthDate: new Date('1990-01-01'),
    }
  });

  // Create role-specific records
  await createRoleSpecificRecord(account);
}

/**
 * Create role-specific database records
 */
async function createRoleSpecificRecord(account: any) {
  switch (account.role) {
    case 'client':
      await prisma.client.create({
        data: {
          userId: account.clerkId,
          hasSeenTherapistRecommendations: account.description.includes('complete'),
        }
      });
      break;

    case 'therapist':
      await prisma.therapist.create({
        data: {
          userId: account.clerkId,
          status: account.status || 'pending',
          mobile: '+1234567890',
          province: 'Metro Manila',
          providerType: 'Licensed Clinical Psychologist',
          professionalLicenseType: 'PRC License',
          isPRCLicensed: 'Yes',
          prcLicenseNumber: `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          expirationDateOfLicense: new Date('2025-12-31'),
          practiceStartDate: new Date('2019-01-01'),
          areasOfExpertise: getTherapistExpertise(account.description),
          assessmentTools: ['PHQ-9', 'GAD-7', 'PCL-5'],
          therapeuticApproachesUsedList: getTherapeuticApproaches(account.description),
          languagesOffered: ['English', 'Tagalog'],
          providedOnlineTherapyBefore: true,
          comfortableUsingVideoConferencing: true,
          preferredSessionLength: [50, 60],
          privateConfidentialSpace: 'Yes, dedicated home office',
          compliesWithDataPrivacyAct: true,
          professionalLiabilityInsurance: 'Yes, fully covered',
          complaintsOrDisciplinaryActions: 'No complaints or actions',
          willingToAbideByPlatformGuidelines: true,
          expertise: getTherapistExpertise(account.description).map(e => e.toLowerCase()),
          approaches: getTherapeuticApproaches(account.description).map(a => a.toLowerCase()),
          languages: ['english', 'tagalog'],
          illnessSpecializations: getIllnessSpecializations(account.description),
          acceptTypes: ['insurance', 'self-pay'],
          treatmentSuccessRates: getTreatmentSuccessRates(account.description),
          sessionLength: '60 minutes',
          hourlyRate: getHourlyRate(account.description),
          submissionDate: new Date(),
          processingDate: account.status === 'approved' ? new Date() : null,
        }
      });
      break;

    case 'moderator':
      // Get communities for assignment
      const communities = await prisma.community.findMany({ take: 2 });
      await prisma.moderator.create({
        data: {
          userId: account.clerkId,
          permissions: getModeratorPermissions(account.description),
          assignedCommunityIds: communities.map(c => c.id),
        }
      });
      break;

    case 'admin':
      await prisma.admin.create({
        data: {
          userId: account.clerkId,
          permissions: getAdminPermissions(account.description),
          adminLevel: account.adminLevel || 'admin',
        }
      });
      break;
  }
}

/**
 * Create test communities with realistic data
 */
async function createTestCommunities() {
  const testCommunities = [
    {
      name: 'Anxiety Support Group',
      description: 'A supportive community for those dealing with anxiety disorders',
      slug: 'anxiety-support-test',
      imageUrl: '/images/communities/anxiety.jpg'
    },
    {
      name: 'Depression Recovery',
      description: 'Share experiences and find hope in recovery from depression',
      slug: 'depression-recovery-test',
      imageUrl: '/images/communities/depression.jpg'
    },
    {
      name: 'Trauma Survivors Network',
      description: 'Support network for trauma survivors and PTSD management',
      slug: 'trauma-survivors-test',
      imageUrl: '/images/communities/trauma.jpg'
    }
  ];

  for (const communityData of testCommunities) {
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: communityData.slug }
    });

    if (!existingCommunity) {
      await prisma.community.create({ data: communityData });
    }
  }

  // Create test memberships
  const communities = await prisma.community.findMany({
    where: { slug: { endsWith: '-test' } }
  });

  const clients = await getTestUsers('client');
  const moderators = await getTestUsers('moderator');

  // Add clients to communities
  for (const client of clients.slice(0, 2)) {
    for (const community of communities.slice(0, 2)) {
      await prisma.membership.upsert({
        where: {
          userId_communityId: {
            userId: client.id,
            communityId: community.id
          }
        },
        update: {},
        create: {
          userId: client.id,
          communityId: community.id,
          role: 'member'
        }
      });
    }
  }

  console.log(`   ✅ Created ${testCommunities.length} test communities with memberships`);
}

/**
 * Create test conversations and messages
 */
async function createTestConversations() {
  const clients = await getTestUsers('client');
  const therapists = await getTestUsers('therapist');

  if (clients.length > 0 && therapists.length > 0) {
    // Create client-therapist conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'DIRECT',
        name: `Session Chat: ${clients[0].firstName} & ${therapists[0].firstName}`,
        participants: {
          create: [
            { userId: clients[0].id, role: 'MEMBER' },
            { userId: therapists[0].id, role: 'MEMBER' }
          ]
        }
      }
    });

    // Create test messages
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          userId: clients[0].id,
          content: 'Hello, I'm looking forward to our session today.',
          type: 'TEXT'
        },
        {
          conversationId: conversation.id,
          userId: therapists[0].id,
          content: 'Hello! I'm ready when you are. How are you feeling today?',
          type: 'TEXT'
        }
      ]
    });

    console.log('   ✅ Created test conversations and messages');
  }
}

/**
 * Create test worksheets and assignments
 */
async function createTestWorksheets() {
  const clients = await getTestUsers('client');
  const therapists = await getTestUsers('therapist');

  if (clients.length > 0 && therapists.length > 0) {
    const worksheet = await prisma.worksheet.create({
      data: {
        title: 'Mood Tracking Worksheet',
        instructions: 'Track your daily mood and identify patterns',
        description: 'A comprehensive worksheet for mood tracking and self-reflection',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        status: 'assigned',
        clientId: clients[0].id,
        therapistId: therapists[0].id,
        isCompleted: false
      }
    });

    // Create worksheet material
    await prisma.worksheetMaterial.create({
      data: {
        worksheetId: worksheet.id,
        fileName: 'mood-tracking-template.pdf',
        filePath: '/test-materials/mood-tracking-template.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf'
      }
    });

    console.log('   ✅ Created test worksheets and materials');
  }
}

/**
 * Create test therapeutic relationships
 */
async function createTestTherapeuticRelationships() {
  const clients = await getTestUsers('client');
  const therapists = await getTestUsers('therapist');

  if (clients.length > 0 && therapists.length > 0) {
    // Create client-therapist relationships
    for (let i = 0; i < Math.min(clients.length, therapists.length); i++) {
      await prisma.clientTherapist.upsert({
        where: {
          clientId_therapistId: {
            clientId: clients[i].id,
            therapistId: therapists[i].id
          }
        },
        update: {},
        create: {
          clientId: clients[i].id,
          therapistId: therapists[i].id,
          assignedAt: new Date(),
          isActive: true
        }
      });
    }

    console.log(`   ✅ Created ${Math.min(clients.length, therapists.length)} therapeutic relationships`);
  }
}

/**
 * Create test sessions and bookings
 */
async function createTestSessions() {
  const relationships = await prisma.clientTherapist.findMany({
    include: { client: true, therapist: true }
  });

  for (const relationship of relationships.slice(0, 2)) {
    // Create past session
    await prisma.meeting.create({
      data: {
        clientId: relationship.clientId,
        therapistId: relationship.therapistId,
        startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour duration
        status: 'completed',
        meetingType: 'video',
        notes: 'Great progress in today\'s session. Patient showed improved coping strategies.',
        duration: 60
      }
    });

    // Create upcoming session
    await prisma.meeting.create({
      data: {
        clientId: relationship.clientId,
        therapistId: relationship.therapistId,
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour duration
        status: 'scheduled',
        meetingType: 'video',
        duration: 60
      }
    });
  }

  console.log('   ✅ Created test sessions and bookings');
}

/**
 * Create test notifications
 */
async function createTestNotifications() {
  const users = await getTestUsers('client');

  for (const user of users.slice(0, 2)) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          type: 'session_reminder',
          title: 'Upcoming Session Reminder',
          message: 'You have a therapy session scheduled for tomorrow at 3:00 PM',
          isRead: false
        },
        {
          userId: user.id,
          type: 'worksheet_assigned',
          title: 'New Worksheet Assigned',
          message: 'Your therapist has assigned you a new mood tracking worksheet',
          isRead: true
        }
      ]
    });
  }

  console.log('   ✅ Created test notifications');
}

/**
 * Helper functions for generating realistic test data
 */
function getTherapistExpertise(description: string): string[] {
  if (description.includes('specialist')) {
    return ['Trauma Therapy', 'EMDR', 'Complex PTSD'];
  }
  if (description.includes('approved')) {
    return ['Anxiety Disorders', 'Depression', 'Cognitive Behavioral Therapy'];
  }
  return ['General Counseling', 'Stress Management'];
}

function getTherapeuticApproaches(description: string): string[] {
  if (description.includes('specialist')) {
    return ['EMDR', 'Trauma-Focused CBT', 'Somatic Therapy'];
  }
  return ['Cognitive Behavioral Therapy', 'Mindfulness-Based Therapy'];
}

function getIllnessSpecializations(description: string): string[] {
  if (description.includes('specialist')) {
    return ['ptsd', 'complex-trauma', 'dissociative-disorders'];
  }
  return ['anxiety-disorders', 'mood-disorders'];
}

function getTreatmentSuccessRates(description: string): Record<string, number> {
  if (description.includes('specialist')) {
    return { "ptsd": 88, "trauma": 85, "anxiety": 92 };
  }
  return { "anxiety": 85, "depression": 78, "general": 80 };
}

function getHourlyRate(description: string): number {
  if (description.includes('specialist')) {
    return 200.00;
  }
  if (description.includes('approved')) {
    return 150.00;
  }
  return 125.00;
}

function getModeratorPermissions(description: string): string[] {
  if (description.includes('primary')) {
    return ['moderate_posts', 'moderate_comments', 'ban_users', 'manage_reports'];
  }
  if (description.includes('limited')) {
    return ['moderate_posts'];
  }
  return ['moderate_posts', 'moderate_comments'];
}

function getAdminPermissions(description: string): string[] {
  if (description.includes('super')) {
    return ['view', 'edit', 'delete', 'manage_users', 'manage_content', 'system_admin'];
  }
  if (description.includes('user manager')) {
    return ['view', 'edit', 'manage_users'];
  }
  if (description.includes('content')) {
    return ['view', 'edit', 'manage_content'];
  }
  return ['view', 'edit'];
}

async function getTestUsers(role: string) {
  return await prisma.user.findMany({
    where: {
      role: role,
      email: { contains: 'mentaratest.dev' }
    }
  });
}

/**
 * Print summary of created test data
 */
async function printTestDataSummary() {
  const users = await prisma.user.count({ where: { email: { contains: 'mentaratest.dev' } } });
  const communities = await prisma.community.count({ where: { slug: { endsWith: '-test' } } });
  const memberships = await prisma.membership.count();
  const conversations = await prisma.conversation.count();
  const messages = await prisma.message.count();
  const worksheets = await prisma.worksheet.count();
  const meetings = await prisma.meeting.count();
  const relationships = await prisma.clientTherapist.count();
  const notifications = await prisma.notification.count();

  console.log('\n📊 Test Data Summary:');
  console.log(`   • Users: ${users}`);
  console.log(`   • Communities: ${communities}`);
  console.log(`   • Memberships: ${memberships}`);
  console.log(`   • Conversations: ${conversations}`);
  console.log(`   • Messages: ${messages}`);
  console.log(`   • Worksheets: ${worksheets}`);
  console.log(`   • Meetings: ${meetings}`);
  console.log(`   • Therapeutic Relationships: ${relationships}`);
  console.log(`   • Notifications: ${notifications}`);
}

/**
 * Main execution
 */
async function main() {
  await seedTestData();
}

// Run if called directly
if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Error during test data seeding:', e);
    process.exit(1);
  });
}

export { seedTestData };