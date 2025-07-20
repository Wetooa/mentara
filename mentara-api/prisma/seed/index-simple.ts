// Ultra-Fast Development Seed Script
// Simple 3-phase seeding for rapid development

import { PrismaClient, User, Community } from '@prisma/client';
import { SEED_CONFIG, ILLNESS_COMMUNITIES } from './config';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting ultra-fast development seeding...');
  console.log('📊 Creating minimal data for development...');

  try {
    // Phase 1: Create Essential Users (3 of each role)
    console.log('\n📍 PHASE 1: Creating Users');
    
    const users: User[] = [];
    
    // Create 3 Clients
    for (let i = 1; i <= SEED_CONFIG.USERS.CLIENTS; i++) {
      const client = await prisma.user.create({
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
      users.push(client);
      console.log(`✅ Created client: ${client.email}`);
    }

    // Create 3 Therapists
    for (let i = 1; i <= SEED_CONFIG.USERS.THERAPISTS; i++) {
      const therapist = await prisma.user.create({
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
      users.push(therapist);
      console.log(`✅ Created therapist: ${therapist.email}`);
    }

    // Create 3 Admins
    for (let i = 1; i <= SEED_CONFIG.USERS.ADMINS; i++) {
      const admin = await prisma.user.create({
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
      users.push(admin);
      console.log(`✅ Created admin: ${admin.email}`);
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

    // Phase 3: Create Basic Memberships (just join all clients to all communities)
    console.log('\n📍 PHASE 3: Creating Basic Relationships');
    
    const clients = users.filter(u => u.role === 'client');
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

    // Summary
    console.log('\n🎉 Ultra-fast seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Total Users: ${users.length}`);
    console.log(`   🔹 Clients: ${clients.length}`);
    console.log(`   🔹 Therapists: ${users.filter(u => u.role === 'therapist').length}`);
    console.log(`   🔹 Admins: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   🏘️  Communities: ${communities.length}`);
    console.log(`   🤝 Memberships: ${membershipCount}`);
    console.log('\n✨ Ready for development! All essential data created.');
    
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