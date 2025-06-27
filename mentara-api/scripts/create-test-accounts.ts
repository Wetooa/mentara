import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test account configuration
const TEST_ACCOUNTS = {
  clients: [
    {
      clerkId: 'user_2z5S2iaKkRuHpe3BygkU0R3NnDu',
      email: 'test.client.basic@mentaratest.dev',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'client',
      description: 'Basic client with minimal profile data'
    },
    {
      clerkId: 'user_2z5S4N84dgKfWuXzXGYjtXbkWVC',
      email: 'test.client.complete@mentaratest.dev',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      role: 'client',
      description: 'Client with complete profile data'
    },
    {
      clerkId: 'user_2z5S76EFlCdnil28daogAv2A4bB',
      email: 'test.client.inactive@mentaratest.dev',
      firstName: 'Jennifer',
      lastName: 'Chen',
      role: 'client',
      description: 'Inactive client for edge testing',
      isActive: false
    }
  ],
  therapists: [
    {
      clerkId: 'user_2z5S92KNAdBfAg5sBvMAtZvMiIz',
      email: 'test.therapist.approved@mentaratest.dev',
      firstName: 'Dr. Michael',
      lastName: 'Thompson',
      role: 'therapist',
      description: 'Approved therapist with full credentials',
      status: 'approved'
    },
    {
      clerkId: 'user_2z5SBGCUI2ypqCYmIMEanA335FT',
      email: 'test.therapist.pending@mentaratest.dev',
      firstName: 'Dr. Lisa',
      lastName: 'Park',
      role: 'therapist',
      description: 'Pending approval therapist',
      status: 'pending'
    },
    {
      clerkId: 'user_2z5SDHpsxW80HEoqRHkQCon9bHZ',
      email: 'test.therapist.specialist@mentaratest.dev',
      firstName: 'Dr. Amanda',
      lastName: 'Williams',
      role: 'therapist',
      description: 'Specialist therapist with expertise',
      status: 'approved'
    }
  ],
  moderators: [
    {
      clerkId: 'user_2z5SGmYtYcImUQ8tTOnmM166iZV',
      email: 'test.moderator.primary@mentaratest.dev',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'moderator',
      description: 'Primary content moderator'
    },
    {
      clerkId: 'user_2z5SL6dkZ1D1Yq9WBI3rKb2QN1P',
      email: 'test.moderator.community@mentaratest.dev',
      firstName: 'Taylor',
      lastName: 'Davis',
      role: 'moderator',
      description: 'Community-focused moderator'
    },
    {
      clerkId: 'user_2z5SO5MFy8ISp3f6bjWW8xYfd4q',
      email: 'test.moderator.limited@mentaratest.dev',
      firstName: 'Jordan',
      lastName: 'Smith',
      role: 'moderator',
      description: 'Limited permission moderator'
    }
  ],
  admins: [
    {
      clerkId: 'user_2z5SQlOzBOgmVn6KStIDToQViDA',
      email: 'test.admin.super@mentaratest.dev',
      firstName: 'Robert',
      lastName: 'Anderson',
      role: 'admin',
      description: 'Super admin with full permissions',
      adminLevel: 'super'
    },
    {
      clerkId: 'user_2z5STvOT1aof3ypYHO0KpKFto0S',
      email: 'test.admin.user.manager@mentaratest.dev',
      firstName: 'Linda',
      lastName: 'Martinez',
      role: 'admin',
      description: 'User management focused admin',
      adminLevel: 'admin'
    },
    {
      clerkId: 'user_2z5SVREYNRPeHeoAiUQq5pC4z42',
      email: 'test.admin.content@mentaratest.dev',
      firstName: 'David',
      lastName: 'Wilson',
      role: 'admin',
      description: 'Content management focused admin',
      adminLevel: 'admin'
    }
  ],
  mixed: [
    {
      clerkId: 'user_2z5SXR5HOdwZSaPifK0xLU1ttDU',
      email: 'test.mixed.client.to.therapist@mentaratest.dev',
      firstName: 'Emily',
      lastName: 'Garcia',
      role: 'client',
      description: 'Client transitioning to therapist'
    },
    {
      clerkId: 'user_2z5SZPFs86juZvlUsAFqY1PPCNs',
      email: 'test.mixed.therapist.moderator@mentaratest.dev',
      firstName: 'Dr. Kevin',
      lastName: 'Lee',
      role: 'therapist',
      description: 'Therapist with moderator privileges',
      status: 'approved'
    },
    {
      clerkId: 'user_2z5SauPsyJpHaTEzrLvJXfkdhKi',
      email: 'test.mixed.inactive.admin@mentaratest.dev',
      firstName: 'Patricia',
      lastName: 'Brown',
      role: 'admin',
      description: 'Inactive admin for security testing',
      isActive: false,
      adminLevel: 'admin'
    }
  ]
};

/**
 * Create test accounts in the database
 */
async function createTestAccounts() {
  console.log('🧪 Starting test account creation...\n');

  try {
    // Create client test accounts
    console.log('👥 Creating client test accounts...');
    for (const client of TEST_ACCOUNTS.clients) {
      await createClientAccount(client);
    }

    // Create therapist test accounts
    console.log('\n🏥 Creating therapist test accounts...');
    for (const therapist of TEST_ACCOUNTS.therapists) {
      await createTherapistAccount(therapist);
    }

    // Create moderator test accounts
    console.log('\n🛡️ Creating moderator test accounts...');
    for (const moderator of TEST_ACCOUNTS.moderators) {
      await createModeratorAccount(moderator);
    }

    // Create admin test accounts
    console.log('\n👑 Creating admin test accounts...');
    for (const admin of TEST_ACCOUNTS.admins) {
      await createAdminAccount(admin);
    }

    // Create mixed role test accounts
    console.log('\n🔄 Creating mixed role test accounts...');
    for (const mixed of TEST_ACCOUNTS.mixed) {
      await createMixedAccount(mixed);
    }

    console.log('\n🎉 All test accounts created successfully!');
    console.log('\nTest Account Summary:');
    console.log(`• Clients: ${TEST_ACCOUNTS.clients.length}`);
    console.log(`• Therapists: ${TEST_ACCOUNTS.therapists.length}`);
    console.log(`• Moderators: ${TEST_ACCOUNTS.moderators.length}`);
    console.log(`• Admins: ${TEST_ACCOUNTS.admins.length}`);
    console.log(`• Mixed: ${TEST_ACCOUNTS.mixed.length}`);
    console.log(`• Total: ${Object.values(TEST_ACCOUNTS).reduce((acc, arr) => acc + arr.length, 0)}`);

  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Create a client test account
 */
async function createClientAccount(account: any) {
  const existingUser = await prisma.user.findUnique({
    where: { id: account.clerkId }
  });

  if (existingUser) {
    console.log(`   ⏭️  Client user already exists: ${account.firstName} ${account.lastName}`);
    return;
  }

  // Create User record
  const user = await prisma.user.create({
    data: {
      id: account.clerkId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      isActive: account.isActive ?? true,
      bio: `Test client account: ${account.description}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.firstName}`,
    }
  });

  // Create Client record
  const client = await prisma.client.create({
    data: {
      userId: account.clerkId,
      hasSeenTherapistRecommendations: false,
    }
  });

  console.log(`   ✅ Created client: ${account.firstName} ${account.lastName} (${account.description})`);
}

/**
 * Create a therapist test account
 */
async function createTherapistAccount(account: any) {
  const existingUser = await prisma.user.findUnique({
    where: { id: account.clerkId }
  });

  if (existingUser) {
    console.log(`   ⏭️  Therapist user already exists: ${account.firstName} ${account.lastName}`);
    return;
  }

  // Create User record
  const user = await prisma.user.create({
    data: {
      id: account.clerkId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      bio: `Test therapist account: ${account.description}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.firstName}`,
    }
  });

  // Create Therapist record with realistic data
  const therapist = await prisma.therapist.create({
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
      areasOfExpertise: ['Anxiety Disorders', 'Depression', 'Trauma Therapy'],
      assessmentTools: ['PHQ-9', 'GAD-7', 'PCL-5'],
      therapeuticApproachesUsedList: ['Cognitive Behavioral Therapy', 'Dialectical Behavior Therapy'],
      languagesOffered: ['English', 'Tagalog'],
      providedOnlineTherapyBefore: true,
      comfortableUsingVideoConferencing: true,
      preferredSessionLength: [50, 60],
      privateConfidentialSpace: 'Yes, I have a private home office',
      compliesWithDataPrivacyAct: true,
      professionalLiabilityInsurance: 'Yes, fully covered',
      complaintsOrDisciplinaryActions: 'No complaints or actions',
      willingToAbideByPlatformGuidelines: true,
      expertise: ['anxiety', 'depression', 'trauma'],
      approaches: ['CBT', 'DBT', 'mindfulness'],
      languages: ['english', 'tagalog'],
      illnessSpecializations: ['anxiety-disorders', 'mood-disorders', 'ptsd'],
      acceptTypes: ['insurance', 'self-pay'],
      treatmentSuccessRates: {
        "anxiety": 85,
        "depression": 78,
        "trauma": 82
      },
      sessionLength: '60 minutes',
      hourlyRate: 150.00,
      submissionDate: new Date(),
      processingDate: account.status === 'approved' ? new Date() : undefined,
    }
  });

  console.log(`   ✅ Created therapist: ${account.firstName} ${account.lastName} (${account.description})`);
}

/**
 * Create a moderator test account
 */
async function createModeratorAccount(account: any) {
  const existingUser = await prisma.user.findUnique({
    where: { id: account.clerkId }
  });

  if (existingUser) {
    console.log(`   ⏭️  Moderator user already exists: ${account.firstName} ${account.lastName}`);
    return;
  }

  // Create User record
  const user = await prisma.user.create({
    data: {
      id: account.clerkId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      bio: `Test moderator account: ${account.description}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.firstName}`,
    }
  });

  // Get some communities to assign to moderator
  const communities = await prisma.community.findMany({ take: 2 });

  // Create Moderator record
  const moderator = await prisma.moderator.create({
    data: {
      userId: account.clerkId,
      permissions: ['moderate_posts', 'moderate_comments', 'ban_users'],
      assignedCommunities: communities.map(c => c.id),
    }
  });

  console.log(`   ✅ Created moderator: ${account.firstName} ${account.lastName} (${account.description})`);
}

/**
 * Create an admin test account
 */
async function createAdminAccount(account: any) {
  const existingUser = await prisma.user.findUnique({
    where: { id: account.clerkId }
  });

  if (existingUser) {
    console.log(`   ⏭️  Admin user already exists: ${account.firstName} ${account.lastName}`);
    return;
  }

  // Create User record
  const user = await prisma.user.create({
    data: {
      id: account.clerkId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      isActive: account.isActive ?? true,
      bio: `Test admin account: ${account.description}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.firstName}`,
    }
  });

  // Create Admin record
  const admin = await prisma.admin.create({
    data: {
      userId: account.clerkId,
      permissions: account.adminLevel === 'super' 
        ? ['view', 'edit', 'delete', 'manage_users', 'manage_content', 'system_admin']
        : ['view', 'edit', 'manage_users'],
      adminLevel: account.adminLevel || 'admin',
    }
  });

  console.log(`   ✅ Created admin: ${account.firstName} ${account.lastName} (${account.description})`);
}

/**
 * Create a mixed role test account
 */
async function createMixedAccount(account: any) {
  const existingUser = await prisma.user.findUnique({
    where: { id: account.clerkId }
  });

  if (existingUser) {
    console.log(`   ⏭️  Mixed user already exists: ${account.firstName} ${account.lastName}`);
    return;
  }

  // Create User record
  const user = await prisma.user.create({
    data: {
      id: account.clerkId,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      role: account.role,
      isActive: account.isActive ?? true,
      bio: `Test mixed account: ${account.description}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.firstName}`,
    }
  });

  // Create role-specific records based on account type
  if (account.role === 'client') {
    await prisma.client.create({
      data: {
        userId: account.clerkId,
        hasSeenTherapistRecommendations: true,
      }
    });
  } else if (account.role === 'therapist') {
    await prisma.therapist.create({
      data: {
        userId: account.clerkId,
        status: account.status || 'approved',
        mobile: '+1234567890',
        province: 'Metro Manila',
        providerType: 'Licensed Clinical Psychologist',
        professionalLicenseType: 'PRC License',
        isPRCLicensed: 'Yes',
        prcLicenseNumber: `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        expirationDateOfLicense: new Date('2025-12-31'),
        practiceStartDate: new Date('2019-01-01'),
        areasOfExpertise: ['Group Therapy', 'Family Counseling'],
        assessmentTools: ['PHQ-9', 'GAD-7'],
        therapeuticApproachesUsedList: ['CBT', 'Family Systems'],
        languagesOffered: ['English', 'Tagalog'],
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [50],
        privateConfidentialSpace: 'Yes',
        compliesWithDataPrivacyAct: true,
        professionalLiabilityInsurance: 'Yes',
        complaintsOrDisciplinaryActions: 'No',
        willingToAbideByPlatformGuidelines: true,
        expertise: ['family-therapy', 'group-therapy'],
        approaches: ['CBT', 'family-systems'],
        languages: ['english', 'tagalog'],
        illnessSpecializations: ['relationship-issues'],
        acceptTypes: ['insurance'],
        treatmentSuccessRates: { "family-therapy": 90 },
        sessionLength: '50 minutes',
        hourlyRate: 125.00,
        submissionDate: new Date(),
        processingDate: new Date(),
      }
    });

    // Also create moderator record for therapist-moderator
    if (account.description.includes('moderator')) {
      const communities = await prisma.community.findMany({ take: 1 });
      await prisma.moderator.create({
        data: {
          userId: account.clerkId,
          permissions: ['moderate_posts'],
          assignedCommunities: communities.map(c => c.id),
        }
      });
    }
  } else if (account.role === 'admin') {
    await prisma.admin.create({
      data: {
        userId: account.clerkId,
        permissions: ['view', 'edit'],
        adminLevel: account.adminLevel || 'admin',
      }
    });
  }

  console.log(`   ✅ Created mixed account: ${account.firstName} ${account.lastName} (${account.description})`);
}

/**
 * Validate test accounts
 */
async function validateTestAccounts() {
  console.log('\n🔍 Validating test accounts...');

  const allTestEmails = Object.values(TEST_ACCOUNTS).flat().map(account => account.email);
  
  const users = await prisma.user.findMany({
    where: {
      email: { in: allTestEmails }
    },
    include: {
      client: true,
      therapist: true,
      moderator: true,
      admin: true,
    }
  });

  console.log(`   Found ${users.length} test users in database`);
  
  // Validate each role type
  const clients = users.filter(u => u.role === 'client');
  const therapists = users.filter(u => u.role === 'therapist');
  const moderators = users.filter(u => u.role === 'moderator');
  const admins = users.filter(u => u.role === 'admin');

  console.log(`   • Clients: ${clients.length} (${clients.filter(c => c.client).length} with Client records)`);
  console.log(`   • Therapists: ${therapists.length} (${therapists.filter(t => t.therapist).length} with Therapist records)`);
  console.log(`   • Moderators: ${moderators.length} (${moderators.filter(m => m.moderator).length} with Moderator records)`);
  console.log(`   • Admins: ${admins.length} (${admins.filter(a => a.admin).length} with Admin records)`);

  console.log('   ✅ Test account validation completed');
}

/**
 * Main execution
 */
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'create':
      await createTestAccounts();
      break;
    case 'validate':
      await validateTestAccounts();
      break;
    case 'create-and-validate':
      await createTestAccounts();
      await validateTestAccounts();
      break;
    default:
      console.log('Usage: npm run test-accounts [create|validate|create-and-validate]');
      console.log('');
      console.log('Commands:');
      console.log('  create              - Create all test accounts in database');
      console.log('  validate            - Validate existing test accounts');
      console.log('  create-and-validate - Create and then validate test accounts');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
}

export { createTestAccounts, validateTestAccounts, TEST_ACCOUNTS };