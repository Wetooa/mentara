// Users Seed Module
// Handles creation of all user types: clients, therapists, admins, moderators

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
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

  // Import bulk operations utilities
  const { chunkedBulkInsert, batchedTransaction } = await import('./scripts/bulk-operations');

  // Create test accounts first with auto-generated UUIDs
  console.log('🧪 Creating test accounts...');
  console.log('🔹 Test Admin Accounts:');

  // Create test admin users (individual creation for logging)
  for (const adminData of TEST_ACCOUNTS.ADMINS) {
    const userData = SeedDataGenerator.generateUserData('admin', adminData);
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(`  ${adminData.firstName} ${adminData.lastName}: ${user.id} (${user.email})`);
  }

  console.log('🔹 Test Moderator Accounts:');
  // Create test moderator users
  for (const moderatorData of TEST_ACCOUNTS.MODERATORS) {
    const userData = SeedDataGenerator.generateUserData(
      'moderator',
      moderatorData,
    );
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(`  ${moderatorData.firstName} ${moderatorData.lastName}: ${user.id} (${user.email})`);
  }

  console.log('🔹 Test Client Accounts:');
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
    console.log(`  ${clientData.firstName} ${clientData.lastName}: ${user.id} (${user.email})`);
  }

  console.log('🔹 Test Therapist Accounts:');
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
    console.log(`  ${therapistData.firstName} ${therapistData.lastName}: ${user.id} (${user.email})`);
  }

  // Create additional users using bulk operations for better performance
  console.log('🤖 Creating additional users with bulk operations...');

  // Prepare bulk data for additional users
  const additionalUserData: any[] = [];
  const clientOperations: (() => Promise<any>)[] = [];
  const therapistOperations: (() => Promise<any>)[] = [];

  // Generate additional admin users data
  const additionalAdmins = SEED_CONFIG.USERS.ADMINS - TEST_ACCOUNTS.ADMINS.length;
  for (let i = 0; i < additionalAdmins; i++) {
    const userData = SeedDataGenerator.generateUserData('admin', {
      email: `admin${i + 1}@mentara.com`,
      firstName: 'Admin',
      lastName: `User ${i + 1}`,
    });
    additionalUserData.push(userData);
  }

  // Generate additional moderator users data
  const additionalModerators = SEED_CONFIG.USERS.MODERATORS - TEST_ACCOUNTS.MODERATORS.length;
  for (let i = 0; i < additionalModerators; i++) {
    const userData = SeedDataGenerator.generateUserData('moderator', {
      email: `moderator${i + 1}@mentara.com`,
      firstName: 'Moderator',
      lastName: `User ${i + 1}`,
    });
    additionalUserData.push(userData);
  }

  // Generate additional client users data
  const additionalClients = SEED_CONFIG.USERS.CLIENTS - TEST_ACCOUNTS.CLIENTS.length;
  const clientUserData: any[] = [];
  for (let i = 0; i < additionalClients; i++) {
    const userData = SeedDataGenerator.generateUserData('client', {});
    clientUserData.push(userData);
    additionalUserData.push(userData);
  }

  // Generate additional therapist users data  
  const additionalTherapists = SEED_CONFIG.USERS.THERAPISTS - TEST_ACCOUNTS.THERAPISTS.length;
  const therapistUserData: any[] = [];
  for (let i = 0; i < additionalTherapists; i++) {
    const userData = SeedDataGenerator.generateUserData('therapist', {});
    therapistUserData.push(userData);
    additionalUserData.push(userData);
  }

  // Bulk insert all additional users
  if (additionalUserData.length > 0) {
    console.log(`📦 Bulk inserting ${additionalUserData.length} additional users...`);
    await chunkedBulkInsert(prisma, 'user', additionalUserData, {
      operationName: 'additional users',
      chunkSize: 1000
    });

    // Get the inserted users to create relationships
    const insertedUsers = await prisma.user.findMany({
      where: {
        email: {
          in: additionalUserData.map(u => u.email)
        }
      }
    });

    users.push(...insertedUsers);

    // Create client profiles for client users using batched transactions
    if (clientUserData.length > 0) {
      const clientUsers = insertedUsers.filter(u => u.role === 'client');
      console.log(`👤 Creating ${clientUsers.length} client profiles with batched transactions...`);
      
      const clientProfileOperations = clientUsers.map(user => {
        return () => prisma.client.create({
          data: {
            userId: user.id,
            hasSeenTherapistRecommendations: Math.random() > 0.5,
          },
        });
      });

      const clientProfiles = await batchedTransaction(
        prisma,
        clientProfileOperations,
        {
          operationName: 'client profiles',
          batchSize: 100
        }
      );

      const clientPairs = clientUsers.map((user, index) => ({
        user,
        client: clientProfiles[index]
      }));
      clients.push(...clientPairs);
    }

    // Create therapist profiles for therapist users using batched transactions
    if (therapistUserData.length > 0) {
      const therapistUsers = insertedUsers.filter(u => u.role === 'therapist');
      console.log(`🩺 Creating ${therapistUsers.length} therapist profiles with batched transactions...`);
      
      const therapistProfileOperations = therapistUsers.map(user => {
        const therapistProfileData = SeedDataGenerator.generateTherapistData();
        return () => prisma.therapist.create({
          data: {
            userId: user.id,
            ...therapistProfileData,
            status: 'APPROVED' as const,
          },
        });
      });

      const therapistProfiles = await batchedTransaction(
        prisma,
        therapistProfileOperations,
        {
          operationName: 'therapist profiles',
          batchSize: 100
        }
      );

      const therapistPairs = therapistUsers.map((user, index) => ({
        user,
        therapist: therapistProfiles[index]
      }));
      therapists.push(...therapistPairs);
    }
  }

  // Extract moderators and admins from users array
  const moderators = users.filter(user => user.role === 'moderator');
  const admins = users.filter(user => user.role === 'admin');

  console.log(`✅ User creation completed with bulk operations:`);
  console.log(`   👥 Total users: ${users.length}`);
  console.log(`   👤 Clients: ${clients.length}`);
  console.log(`   🩺 Therapists: ${therapists.length}`);
  console.log(`   👮 Moderators: ${moderators.length}`);
  console.log(`   👨‍💼 Admins: ${admins.length}`);
  
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
  console.log('🔹 Development Client Accounts:');
  for (let i = 1; i <= SEED_CONFIG.USERS.CLIENTS; i++) {
    const clientId = uuidv4();
    const clientUser = await prisma.user.create({
      data: {
        id: clientId,
        email: `client${i}@mentaratest.dev`,
        firstName: `Client`,
        lastName: `${i}`,
        role: 'client',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });
    console.log(`  Client ${i}: ${clientId} (${clientUser.email})`);
    
    const client = await prisma.client.create({
      data: {
        userId: clientUser.id,
        hasSeenTherapistRecommendations: false,
      },
    });
    
    users.push(clientUser);
    clients.push({ user: clientUser, client });
  }

  // Create 3 Therapists
  console.log('🔹 Development Therapist Accounts:');
  for (let i = 1; i <= SEED_CONFIG.USERS.THERAPISTS; i++) {
    const therapistId = uuidv4();
    const therapistUser = await prisma.user.create({
      data: {
        id: therapistId,
        email: `therapist${i}@mentaratest.dev`,
        firstName: `Dr. Therapist`,
        lastName: `${i}`,
        role: 'therapist',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });
    console.log(`  Therapist ${i}: ${therapistId} (${therapistUser.email})`);
    
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
  }

  // Create 3 Admins
  console.log('🔹 Development Admin Accounts:');
  for (let i = 1; i <= SEED_CONFIG.USERS.ADMINS; i++) {
    const adminId = uuidv4();
    const adminUser = await prisma.user.create({
      data: {
        id: adminId,
        email: `admin${i}@mentaratest.dev`,
        firstName: `Admin`,
        lastName: `${i}`,
        role: 'admin',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });
    console.log(`  Admin ${i}: ${adminId} (${adminUser.email})`);
    
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
  console.log('🔹 Development Moderator Accounts:');
  for (let i = 1; i <= SEED_CONFIG.USERS.MODERATORS; i++) {
    const moderatorId = uuidv4();
    const moderatorUser = await prisma.user.create({
      data: {
        id: moderatorId,
        email: `moderator${i}@mentaratest.dev`,
        firstName: `Moderator`,
        lastName: `${i}`,
        role: 'moderator',
        isActive: true,
        emailVerified: true,
        password: await require('bcrypt').hash('password123', 10),
      },
    });
    console.log(`  Moderator ${i}: ${moderatorId} (${moderatorUser.email})`);
    
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