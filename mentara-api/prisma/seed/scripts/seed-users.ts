#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { TEST_ACCOUNTS, SEED_CONFIG } from '../config';
import { SeedDataGenerator } from '../data-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Seeding Users (Standalone)...');
  
  try {
    let totalUsers = 0;

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log(`ℹ️  Found ${existingUsers} existing users`);
      const answer = process.env.FORCE_SEED || 'n';
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('✅ Users already exist, skipping...');
        return;
      }
    }

    // Create test accounts first
    console.log('🧪 Creating test accounts...');
    
    // Test admins
    for (const adminData of TEST_ACCOUNTS.ADMINS) {
      const userData = SeedDataGenerator.generateUserData('admin', adminData);
      const user = await prisma.user.upsert({
        where: { email: adminData.email },
        update: {},
        create: userData,
      });
      totalUsers++;
      console.log(`✅ Created/found admin: ${adminData.firstName} ${adminData.lastName}`);
    }

    // Test moderators
    for (const moderatorData of TEST_ACCOUNTS.MODERATORS) {
      const userData = SeedDataGenerator.generateUserData('moderator', moderatorData);
      const user = await prisma.user.upsert({
        where: { email: moderatorData.email },
        update: {},
        create: userData,
      });
      totalUsers++;
      console.log(`✅ Created/found moderator: ${moderatorData.firstName} ${moderatorData.lastName}`);
    }

    // Test clients with client table entries
    for (const clientData of TEST_ACCOUNTS.CLIENTS) {
      const userData = SeedDataGenerator.generateUserData('client', clientData);
      const user = await prisma.user.upsert({
        where: { email: clientData.email },
        update: {},
        create: userData,
      });
      
      // Create client table entry
      await prisma.client.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          hasSeenTherapistRecommendations: Math.random() > 0.5,
        },
      });
      totalUsers++;
      console.log(`✅ Created/found client: ${clientData.firstName} ${clientData.lastName}`);
    }

    // Test therapists with therapist table entries
    for (const therapistData of TEST_ACCOUNTS.THERAPISTS) {
      const userData = SeedDataGenerator.generateUserData('therapist', therapistData);
      const user = await prisma.user.upsert({
        where: { email: therapistData.email },
        update: {},
        create: userData,
      });
      
      // Create therapist table entry
      const therapistProfileData = SeedDataGenerator.generateTherapistData();
      await prisma.therapist.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          ...therapistProfileData,
          status: 'APPROVED' as const,
        },
      });
      totalUsers++;
      console.log(`✅ Created/found therapist: ${therapistData.firstName} ${therapistData.lastName}`);
    }

    // Create additional fake users if needed
    console.log('🤖 Creating additional fake users...');
    
    const targetClients = SEED_CONFIG.USERS.CLIENTS;
    const targetTherapists = SEED_CONFIG.USERS.THERAPISTS; 
    const targetAdmins = SEED_CONFIG.USERS.ADMINS;
    const targetModerators = SEED_CONFIG.USERS.MODERATORS;

    const currentClients = await prisma.user.count({ where: { role: 'client' } });
    const currentTherapists = await prisma.user.count({ where: { role: 'therapist' } });
    const currentAdmins = await prisma.user.count({ where: { role: 'admin' } });
    const currentModerators = await prisma.user.count({ where: { role: 'moderator' } });

    // Additional clients
    const additionalClientsNeeded = Math.max(0, targetClients - currentClients);
    for (let i = 0; i < additionalClientsNeeded; i++) {
      const userData = SeedDataGenerator.generateUserData('client', {
        id: `fake_client_${Date.now()}_${i}`,
        email: `fake_client_${Date.now()}_${i}@mentara.com`,
      });
      const user = await prisma.user.create({ data: userData });
      
      await prisma.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations: Math.random() > 0.5,
        },
      });
      totalUsers++;
    }

    // Additional therapists
    const additionalTherapistsNeeded = Math.max(0, targetTherapists - currentTherapists);
    for (let i = 0; i < additionalTherapistsNeeded; i++) {
      const userData = SeedDataGenerator.generateUserData('therapist', {
        id: `fake_therapist_${Date.now()}_${i}`,
        email: `fake_therapist_${Date.now()}_${i}@mentara.com`,
      });
      const user = await prisma.user.create({ data: userData });
      
      const therapistProfileData = SeedDataGenerator.generateTherapistData();
      await prisma.therapist.create({
        data: {
          userId: user.id,
          ...therapistProfileData,
          status: 'APPROVED' as const,
        },
      });
      totalUsers++;
    }

    // Additional admins
    const additionalAdminsNeeded = Math.max(0, targetAdmins - currentAdmins);
    for (let i = 0; i < additionalAdminsNeeded; i++) {
      const userData = SeedDataGenerator.generateUserData('admin', {
        id: `fake_admin_${Date.now()}_${i}`,
        email: `fake_admin_${Date.now()}_${i}@mentara.com`,
      });
      const user = await prisma.user.create({ data: userData });
      
      await prisma.admin.create({
        data: {
          userId: user.id,
          permissions: ['user_management', 'therapist_approval', 'system_admin'],
          adminLevel: 'admin',
        },
      });
      totalUsers++;
    }

    // Additional moderators
    const additionalModeratorsNeeded = Math.max(0, targetModerators - currentModerators);
    for (let i = 0; i < additionalModeratorsNeeded; i++) {
      const userData = SeedDataGenerator.generateUserData('moderator', {
        id: `fake_moderator_${Date.now()}_${i}`,
        email: `fake_moderator_${Date.now()}_${i}@mentara.com`,
      });
      const user = await prisma.user.create({ data: userData });
      
      await prisma.moderator.create({
        data: {
          userId: user.id,
          permissions: ['content_moderation', 'community_management'],
          assignedCommunities: {},
        },
      });
      totalUsers++;
    }

    const finalCounts = {
      clients: await prisma.user.count({ where: { role: 'client' } }),
      therapists: await prisma.user.count({ where: { role: 'therapist' } }),
      admins: await prisma.user.count({ where: { role: 'admin' } }),
      moderators: await prisma.user.count({ where: { role: 'moderator' } }),
      total: await prisma.user.count(),
    };

    console.log('\n🎉 Users seeded successfully!');
    console.log('📈 Final counts:');
    console.log(`   👥 Total Users: ${finalCounts.total}`);
    console.log(`   👨‍⚕️ Clients: ${finalCounts.clients}`);
    console.log(`   🩺 Therapists: ${finalCounts.therapists}`);
    console.log(`   👨‍💼 Admins: ${finalCounts.admins}`);
    console.log(`   👮 Moderators: ${finalCounts.moderators}`);

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during user seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });