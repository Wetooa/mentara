// Users Seed Module
// Handles creation of all user types: clients, therapists, admins, moderators

import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNTS, SEED_CONFIG } from './config';
import { SeedDataGenerator } from './data-generator';

export async function seedUsers(prisma: PrismaClient, mode: 'simple' | 'comprehensive' = 'comprehensive') {
  console.log(`👥 Creating users (${mode} mode)...`);

  const users: any[] = [];
  const clients: any[] = [];
  const therapists: any[] = [];

  // Simple mode: Create minimal development users
  if (mode === 'simple') {
    return await createSimpleUsers(prisma);
  }

  // Create test accounts first with defined IDs for testing
  console.log('🧪 Creating test accounts...');

  // Create test admin users
  for (const adminData of TEST_ACCOUNTS.ADMINS) {
    const userData = SeedDataGenerator.generateUserData('admin', adminData);
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created test admin: ${adminData.firstName} ${adminData.lastName}`,
    );
  }

  // Create test moderator users
  for (const moderatorData of TEST_ACCOUNTS.MODERATORS) {
    const userData = SeedDataGenerator.generateUserData(
      'moderator',
      moderatorData,
    );
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created test moderator: ${moderatorData.firstName} ${moderatorData.lastName}`,
    );
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
    console.log(
      `✅ Created test client: ${clientData.firstName} ${clientData.lastName}`,
    );
  }

  // Create test therapist users
  for (const therapistData of TEST_ACCOUNTS.THERAPISTS) {
    const userData = SeedDataGenerator.generateUserData(
      'therapist',
      therapistData,
    );
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
    console.log(
      `✅ Created test therapist: ${therapistData.firstName} ${therapistData.lastName}`,
    );
  }

  // Create additional fake users for testing (if needed)
  console.log('🤖 Creating additional fake users...');

  // Create additional admin users
  const additionalAdmins =
    SEED_CONFIG.USERS.ADMINS - TEST_ACCOUNTS.ADMINS.length;
  for (let i = 0; i < additionalAdmins; i++) {
    const userData = SeedDataGenerator.generateUserData('admin', {
      id: `fake_admin_${i + 1}`,
      email: `admin${i + 1}@mentara.com`,
      firstName: 'Admin',
      lastName: `User ${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created additional admin: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Create additional moderator users
  const additionalModerators =
    SEED_CONFIG.USERS.MODERATORS - TEST_ACCOUNTS.MODERATORS.length;
  for (let i = 0; i < additionalModerators; i++) {
    const userData = SeedDataGenerator.generateUserData('moderator', {
      id: `fake_moderator_${i + 1}`,
      email: `moderator${i + 1}@mentara.com`,
      firstName: 'Moderator',
      lastName: `User ${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created additional moderator: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Create additional client users
  const additionalClients =
    SEED_CONFIG.USERS.CLIENTS - TEST_ACCOUNTS.CLIENTS.length;
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
    console.log(
      `✅ Created additional client: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Create additional therapist users
  const additionalTherapists =
    SEED_CONFIG.USERS.THERAPISTS - TEST_ACCOUNTS.THERAPISTS.length;
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
    console.log(
      `✅ Created additional therapist: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Extract moderators and admins from users array
  const moderators = users.filter(user => user.role === 'moderator');
  const admins = users.filter(user => user.role === 'admin');
  
  return { users, clients, therapists, moderators, admins };
}

// Simple user creation for development
async function createSimpleUsers(prisma: PrismaClient) {
  const users: any[] = [];
  const clients: any[] = [];
  const therapists: any[] = [];
  const admins: any[] = [];
  const moderators: any[] = [];

  // Create 3 Clients
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
    
    await prisma.client.create({
      data: {
        userId: clientUser.id,
        hasSeenTherapistRecommendations: false,
      },
    });
    
    users.push(clientUser);
    clients.push(clientUser);
  }

  // Create 3 Therapists
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
    
    await prisma.therapist.create({
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
    therapists.push(therapistUser);
  }

  // Create 3 Admins
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
  }

  // Create 3 Moderators
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
  }

  return { users, clients, therapists, moderators, admins };
}