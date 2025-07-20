// Ultra-Fast Development Seed Script
// Simple 4-phase seeding for rapid development with all role tables

import { PrismaClient, User, Community } from '@prisma/client';
import { SEED_CONFIG, ILLNESS_COMMUNITIES } from './config';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ultra-fast development seeding...');
  console.log('📊 Creating minimal data for development with all role tables...');

  try {
    // Phase 1: Create Essential Users (3 of each role)
    console.log('\n📍 PHASE 1: Creating Users and Role Tables');
    
    const users: User[] = [];
    const clients: User[] = [];
    const therapists: User[] = [];
    const admins: User[] = [];
    const moderators: User[] = [];
    
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
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      // Create Client table entry
      await prisma.client.create({
        data: {
          userId: clientUser.id,
          hasSeenTherapistRecommendations: false,
        },
      });
      
      users.push(clientUser);
      clients.push(clientUser);
      console.log(`✅ Created client: ${clientUser.email}`);
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
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      // Create Therapist table entry with required fields
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
      console.log(`✅ Created therapist: ${therapistUser.email}`);
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
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      // Create Admin table entry
      await prisma.admin.create({
        data: {
          userId: adminUser.id,
          permissions: ['user_management', 'therapist_approval', 'system_admin'],
          adminLevel: 'admin',
        },
      });
      
      users.push(adminUser);
      admins.push(adminUser);
      console.log(`✅ Created admin: ${adminUser.email}`);
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
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      // Create Moderator table entry
      await prisma.moderator.create({
        data: {
          userId: moderatorUser.id,
          permissions: ['content_moderation', 'community_management'],
          assignedCommunities: {},
        },
      });
      
      users.push(moderatorUser);
      moderators.push(moderatorUser);
      console.log(`✅ Created moderator: ${moderatorUser.email}`);
    }

    // Phase 2: Create Basic Communities
    console.log('\n📍 PHASE 2: Creating Communities');
    
    const communities: Community[] = [];
    for (const communityData of ILLNESS_COMMUNITIES) {
      const community = await prisma.community.create({
        data: {
          id: `dev_comm_${communityData.slug}`,
          name: communityData.name,
          slug: communityData.slug,
          description: communityData.description,
          imageUrl: '', // Empty string as required field
        },
      });
      communities.push(community);
      console.log(`✅ Created community: ${community.name}`);
    }

    // Phase 3: Create Basic Memberships (join clients to communities)
    console.log('\n📍 PHASE 3: Creating Community Memberships');
    
    let membershipCount = 0;
    
    for (const client of clients) {
      for (const community of communities) {
        try {
          await prisma.membership.create({
            data: {
              userId: client.id,
              communityId: community.id,
            },
          });
          membershipCount++;
        } catch (error) {
          // Skip if membership already exists
        }
      }
    }
    console.log(`✅ Created ${membershipCount} memberships`);

    // Phase 4: Create Moderator-Community Relationships
    console.log('\n📍 PHASE 4: Creating Moderator-Community Assignments');
    
    let moderatorAssignmentCount = 0;
    
    // Assign each moderator to all communities (in development, moderators can moderate all)
    for (const moderator of moderators) {
      for (const community of communities) {
        try {
          await prisma.moderatorCommunity.create({
            data: {
              moderatorId: moderator.id,
              communityId: community.id,
            },
          });
          moderatorAssignmentCount++;
        } catch (error) {
          // Skip if assignment already exists
        }
      }
    }
    console.log(`✅ Created ${moderatorAssignmentCount} moderator assignments`);

    // Summary
    console.log('\n🎉 Ultra-fast seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Total Users: ${users.length}`);
    console.log(`   🔹 Clients: ${clients.length} (with Client table entries)`);
    console.log(`   🔹 Therapists: ${therapists.length} (with Therapist table entries)`);
    console.log(`   🔹 Admins: ${admins.length} (with Admin table entries)`);
    console.log(`   🔹 Moderators: ${moderators.length} (with Moderator table entries)`);
    console.log(`   🏘️  Communities: ${communities.length}`);
    console.log(`   🤝 Memberships: ${membershipCount}`);
    console.log(`   👮 Moderator Assignments: ${moderatorAssignmentCount}`);
    console.log('\n✨ Ready for development! All user roles and tables created.');
    
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