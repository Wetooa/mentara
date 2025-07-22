// Users Seed Module
// Handles creation of all user types: clients, therapists, admins, moderators

import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNTS, SEED_CONFIG } from './config';
import { SeedDataGenerator } from './data-generator';

export async function seedUsers(prisma: PrismaClient) {
  console.log('👥 Creating users...');

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

  return { users, clients, therapists, moderators, admins };
}