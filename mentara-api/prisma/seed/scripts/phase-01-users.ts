// Phase 1: Users Seeding
// Creates all user types: clients, therapists, admins, moderators

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { TEST_ACCOUNTS, SEED_CONFIG } from '../config';
import { SeedDataGenerator } from '../data-generator';

interface UsersPhaseData {
  users: any[];
  clients: any[];
  therapists: any[];
  moderators: any[];
  admins: any[];
}

export async function runPhase01Users(
  prisma: PrismaClient,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`👥 PHASE 1: Creating users (${config} mode)...`);

  try {
    // Check if users already exist (idempotent check)
    const existingUsersCount = await prisma.user.count();
    if (existingUsersCount > 0) {
      console.log(`⏭️ Found ${existingUsersCount} existing users, skipping phase`);
      
      // Return existing data for next phases
      const existingUsers = await prisma.user.findMany({
        include: {
          client: true,
          therapist: true,
        },
      });

      const existingData = {
        users: existingUsers,
        clients: existingUsers.filter(u => u.role === 'client').map(u => ({ user: u, client: u.client })),
        therapists: existingUsers.filter(u => u.role === 'therapist').map(u => ({ user: u, therapist: u.therapist })),
        moderators: existingUsers.filter(u => u.role === 'moderator'),
        admins: existingUsers.filter(u => u.role === 'admin'),
      };

      return {
        success: true,
        message: `Found ${existingUsersCount} existing users`,
        skipped: true,
        data: existingData,
      };
    }

    let result: UsersPhaseData;
    
    if (config === 'simple') {
      result = await createSimpleUsers(prisma);
    } else {
      result = await createComprehensiveUsers(prisma);
    }

    const totalUsers = result.users.length;
    console.log(`✅ Phase 1 completed: Created ${totalUsers} users total`);
    console.log(`   🔹 Clients: ${result.clients.length}`);
    console.log(`   🔹 Therapists: ${result.therapists.length}`);
    console.log(`   🔹 Admins: ${result.admins.length}`);
    console.log(`   🔹 Moderators: ${result.moderators.length}`);

    return {
      success: true,
      message: `Created ${totalUsers} users successfully`,
      data: result,
    };

  } catch (error) {
    console.error('❌ Phase 1 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function createComprehensiveUsers(prisma: PrismaClient): Promise<UsersPhaseData> {
  const users: any[] = [];
  const clients: any[] = [];
  const therapists: any[] = [];

  // Create test accounts first with defined IDs for testing
  console.log('🧪 Creating test accounts...');

  // Create test admin users
  for (const adminData of TEST_ACCOUNTS.ADMINS) {
    const userData = SeedDataGenerator.generateUserData('admin', adminData);
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(`✅ Created test admin: ${adminData.firstName} ${adminData.lastName}`);
  }

  // Create test moderator users
  for (const moderatorData of TEST_ACCOUNTS.MODERATORS) {
    const userData = SeedDataGenerator.generateUserData('moderator', moderatorData);
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(`✅ Created test moderator: ${moderatorData.firstName} ${moderatorData.lastName}`);
  }

  // Create test client users
  for (const clientData of TEST_ACCOUNTS.CLIENTS) {
    const userData = SeedDataGenerator.generateUserData('client', clientData);
    const user = await prisma.user.create({ data: userData });
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: Math.random() > 0.5,
      },
    });
    clients.push({ user, client });
    users.push(user);
    console.log(`✅ Created test client: ${clientData.firstName} ${clientData.lastName}`);
  }

  // Create test therapist users
  for (const therapistData of TEST_ACCOUNTS.THERAPISTS) {
    const userData = SeedDataGenerator.generateUserData('therapist', therapistData);
    const user = await prisma.user.create({ data: userData });
    const therapistProfileData = SeedDataGenerator.generateTherapistData();
    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        ...therapistProfileData,
        status: 'APPROVED' as const,
      },
    });
    therapists.push({ user, therapist });
    users.push(user);
    console.log(`✅ Created test therapist: ${therapistData.firstName} ${therapistData.lastName}`);
  }

  // Create additional fake users for testing
  console.log('🤖 Creating additional fake users...');

  // Create additional admin users
  const additionalAdmins = SEED_CONFIG.USERS.ADMINS - TEST_ACCOUNTS.ADMINS.length;
  for (let i = 0; i < additionalAdmins; i++) {
    const userData = SeedDataGenerator.generateUserData('admin', {
      id: `fake_admin_${i + 1}`,
      email: `admin${i + 1}@mentara.com`,
      firstName: 'Admin',
      lastName: `User ${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(`✅ Created additional admin: ${userData.firstName} ${userData.lastName}`);
  }

  // Create additional moderator users
  const additionalModerators = SEED_CONFIG.USERS.MODERATORS - TEST_ACCOUNTS.MODERATORS.length;
  for (let i = 0; i < additionalModerators; i++) {
    const userData = SeedDataGenerator.generateUserData('moderator', {
      id: `fake_moderator_${i + 1}`,
      email: `moderator${i + 1}@mentara.com`,
      firstName: 'Moderator',
      lastName: `User ${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(`✅ Created additional moderator: ${userData.firstName} ${userData.lastName}`);
  }

  // Create additional client users
  const additionalClients = SEED_CONFIG.USERS.CLIENTS - TEST_ACCOUNTS.CLIENTS.length;
  for (let i = 0; i < additionalClients; i++) {
    const userData = SeedDataGenerator.generateUserData('client', {
      id: `fake_client_${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: Math.random() > 0.5,
      },
    });
    clients.push({ user, client });
    users.push(user);
    console.log(`✅ Created additional client: ${userData.firstName} ${userData.lastName}`);
  }

  // Create additional therapist users
  const additionalTherapists = SEED_CONFIG.USERS.THERAPISTS - TEST_ACCOUNTS.THERAPISTS.length;
  for (let i = 0; i < additionalTherapists; i++) {
    const userData = SeedDataGenerator.generateUserData('therapist', {
      id: `fake_therapist_${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    const therapistProfileData = SeedDataGenerator.generateTherapistData();
    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        ...therapistProfileData,
        status: 'APPROVED' as const,
      },
    });
    therapists.push({ user, therapist });
    users.push(user);
    console.log(`✅ Created additional therapist: ${userData.firstName} ${userData.lastName}`);
  }

  // Extract moderators and admins from users array
  const moderators = users.filter(user => user.role === 'moderator');
  const admins = users.filter(user => user.role === 'admin');

  return { users, clients, therapists, moderators, admins };
}

async function createSimpleUsers(prisma: PrismaClient): Promise<UsersPhaseData> {
  const users: any[] = [];
  const clients: any[] = [];
  const therapists: any[] = [];
  const admins: any[] = [];
  const moderators: any[] = [];

  console.log('🚀 Creating minimal users for development...');

  // Create clients
  for (let i = 1; i <= SEED_CONFIG.USERS.CLIENTS; i++) {
    const clientUser = await prisma.user.create({
      data: {
        id: `dev_client_${i}`,
        email: `client${i}@mentaratest.dev`,
        firstName: `Client`,
        lastName: `${i}`,
        role: 'client',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });

    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
        hasSeenTherapistRecommendations: false,
      },
    });

    users.push(clientUser);
    clients.push({ user: clientUser, client });
    console.log(`✅ Created dev client: ${clientUser.firstName} ${clientUser.lastName}`);
  }

  // Create therapists
  for (let i = 1; i <= SEED_CONFIG.USERS.THERAPISTS; i++) {
    const therapistUser = await prisma.user.create({
      data: {
        id: `dev_therapist_${i}`,
        email: `therapist${i}@mentaratest.dev`,
        firstName: `Dr. Therapist`,
        lastName: `${i}`,
        role: 'therapist',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });

    const therapist = await prisma.therapist.create({
      data: {
        userId: therapistUser.id,
        mobile: `+1555000${i}${i}${i}${i}`,
        province: 'Test Province',
        timezone: 'UTC',
        status: 'APPROVED',
        providerType: 'Licensed Psychologist',
        professionalLicenseType: 'Clinical Psychology',
        isPRCLicensed: 'Yes',
        prcLicenseNumber: `PRC${i}${i}${i}${i}${i}`,
        expirationDateOfLicense: new Date('2025-12-31'),
        practiceStartDate: new Date('2020-01-01'),
        providedOnlineTherapyBefore: true,
        comfortableUsingVideoConferencing: true,
        preferredSessionLength: [60],
        compliesWithDataPrivacyAct: true,
        willingToAbideByPlatformGuidelines: true,
        sessionLength: '60 minutes',
        hourlyRate: 100.00,
        expertise: ['General Therapy'],
        approaches: ['CBT'],
        languages: ['English'],
        illnessSpecializations: ['Anxiety', 'Depression'],
        acceptTypes: ['Individual'],
        treatmentSuccessRates: {},
      },
    });

    users.push(therapistUser);
    therapists.push({ user: therapistUser, therapist });
    console.log(`✅ Created dev therapist: ${therapistUser.firstName} ${therapistUser.lastName}`);
  }

  // Create admins
  for (let i = 1; i <= SEED_CONFIG.USERS.ADMINS; i++) {
    const adminUser = await prisma.user.create({
      data: {
        id: `dev_admin_${i}`,
        email: `admin${i}@mentaratest.dev`,
        firstName: `Admin`,
        lastName: `${i}`,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });

    await prisma.admin.create({
      data: {
        userId: adminUser.id,
        permissions: ['user_management', 'therapist_approval', 'system_admin'],
        adminLevel: 'admin',
      },
    });

    users.push(adminUser);
    admins.push(adminUser);
    console.log(`✅ Created dev admin: ${adminUser.firstName} ${adminUser.lastName}`);
  }

  // Create moderators
  for (let i = 1; i <= SEED_CONFIG.USERS.MODERATORS; i++) {
    const moderatorUser = await prisma.user.create({
      data: {
        id: `dev_moderator_${i}`,
        email: `moderator${i}@mentaratest.dev`,
        firstName: `Moderator`,
        lastName: `${i}`,
        role: 'moderator',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });

    await prisma.moderator.create({
      data: {
        userId: moderatorUser.id,
        permissions: ['content_moderation', 'community_management'],
        assignedCommunities: {},
      },
    });

    users.push(moderatorUser);
    moderators.push(moderatorUser);
    console.log(`✅ Created dev moderator: ${moderatorUser.firstName} ${moderatorUser.lastName}`);
  }

  return { users, clients, therapists, moderators, admins };
}