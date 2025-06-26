// NOTE: For seeding database

import { PrismaClient } from '@prisma/client';
import { ILLNESS_COMMUNITIES } from '../src/communities/illness-communities.config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create illness communities
  console.log('📚 Creating illness communities...');
  for (const communityConfig of ILLNESS_COMMUNITIES) {
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: communityConfig.slug },
    });

    if (!existingCommunity) {
      await prisma.community.create({
        data: {
          name: communityConfig.name,
          description: communityConfig.description,
          slug: communityConfig.slug,
          imageUrl: '/default-community-image.jpg',
        },
      });
      console.log(`✅ Created community: ${communityConfig.name}`);
    } else {
      console.log(`⏭️  Community already exists: ${communityConfig.name}`);
    }
  }

  // Get all communities for reference
  const communities = await prisma.community.findMany();

  // Create sample users if they don't exist
  console.log('👥 Creating sample users...');
  const sampleUsers = [
    {
      id: 'sample_user_1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'client',
    },
    {
      id: 'sample_user_2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'client',
    },
    {
      id: 'sample_therapist_1',
      email: 'dr.wilson@example.com',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      role: 'therapist',
    },
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${userData.firstName} ${userData.lastName}`);
    } else {
      console.log(`⏭️  User already exists: ${userData.firstName} ${userData.lastName}`);
    }
  }

  // Create sample memberships
  console.log('👥 Creating sample memberships...');
  const sampleUser = await prisma.user.findUnique({
    where: { id: 'sample_user_1' },
  });

  if (sampleUser && communities.length > 0) {
    // Join user to first 3 communities
    for (const community of communities.slice(0, 3)) {
      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: sampleUser.id,
          communityId: community.id,
        },
      });

      if (!existingMembership) {
        await prisma.membership.create({
          data: {
            userId: sampleUser.id,
            communityId: community.id,
            role: 'member',
          },
        });
        console.log(`✅ Created membership for ${sampleUser.firstName} in ${community.name}`);
      } else {
        console.log(`⏭️  Membership already exists for ${sampleUser.firstName} in ${community.name}`);
      }
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });