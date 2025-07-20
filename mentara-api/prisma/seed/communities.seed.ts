// Communities Seed Module
// Handles creation of communities and their room structures

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ILLNESS_COMMUNITIES, ADDITIONAL_COMMUNITIES } from './config';

export async function seedCommunities(prisma: PrismaClient) {
  console.log('🏘️  Creating communities...');

  const communities: any[] = [];

  // Create illness communities from config
  for (const communityConfig of ILLNESS_COMMUNITIES) {
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: communityConfig.slug },
    });

    let community;
    if (!existingCommunity) {
      community = await prisma.community.create({
        data: {
          name: communityConfig.name,
          description: communityConfig.description,
          slug: communityConfig.slug,
          imageUrl: faker.image.url(),
        },
      });
      console.log(`✅ Created illness community: ${communityConfig.name}`);
    } else {
      community = existingCommunity;
      console.log(`⏭️  Community already exists: ${communityConfig.name}`);
    }
    communities.push(community);

    // Create room groups and rooms for this community
    await createRoomStructure(prisma, community);
  }

  // Create additional general communities
  for (const type of ADDITIONAL_COMMUNITIES) {
    const community = await prisma.community.create({
      data: {
        name: type.name,
        description: type.description,
        slug: faker.lorem.slug() + '-' + Date.now(),
        imageUrl: faker.image.url(),
      },
    });
    communities.push(community);
    console.log(`✅ Created additional community: ${type.name}`);

    // Create room groups and rooms for this community
    await createRoomStructure(prisma, community);
  }

  return communities;
}

async function createRoomStructure(prisma: PrismaClient, community: any) {
  console.log(`🏗️  Creating room structure for ${community.name}...`);

  // Define standardized room groups and rooms for each community
  const roomGroupsConfig = [
    {
      name: 'Welcome & Info',
      order: 1,
      rooms: [
        { name: 'Welcome', order: 1, postingRole: 'moderator' },
        { name: 'Announcements', order: 2, postingRole: 'moderator' },
        { name: 'Community Guidelines', order: 3, postingRole: 'moderator' },
      ],
    },
    {
      name: 'General Discussion',
      order: 2,
      rooms: [
        { name: 'General Chat', order: 1, postingRole: 'member' },
        { name: 'Share Your Story', order: 2, postingRole: 'member' },
        { name: 'Daily Check-ins', order: 3, postingRole: 'member' },
      ],
    },
    {
      name: 'Support & Resources',
      order: 3,
      rooms: [
        { name: 'Ask for Help', order: 1, postingRole: 'member' },
        { name: 'Success Stories', order: 2, postingRole: 'member' },
        { name: 'Helpful Resources', order: 3, postingRole: 'member' },
        { name: 'Coping Strategies', order: 4, postingRole: 'member' },
      ],
    },
  ];

  // Add specialized room group based on community type
  if (community.slug.includes('anxiety')) {
    roomGroupsConfig.push({
      name: 'Anxiety Specific',
      order: 4,
      rooms: [
        { name: 'Panic Attack Support', order: 1, postingRole: 'member' },
        { name: 'Exposure Therapy', order: 2, postingRole: 'member' },
        { name: 'Mindfulness for Anxiety', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('depression')) {
    roomGroupsConfig.push({
      name: 'Depression Specific',
      order: 4,
      rooms: [
        { name: 'Mood Tracking', order: 1, postingRole: 'member' },
        { name: 'Activity Scheduling', order: 2, postingRole: 'member' },
        { name: 'Medication Support', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('ptsd')) {
    roomGroupsConfig.push({
      name: 'PTSD Specific',
      order: 4,
      rooms: [
        { name: 'Trauma Recovery', order: 1, postingRole: 'member' },
        { name: 'EMDR Support', order: 2, postingRole: 'member' },
        { name: 'Grounding Techniques', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('adhd')) {
    roomGroupsConfig.push({
      name: 'ADHD Specific',
      order: 4,
      rooms: [
        { name: 'Focus & Productivity', order: 1, postingRole: 'member' },
        { name: 'Organization Tips', order: 2, postingRole: 'member' },
        { name: 'Medication Management', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('eating-disorder')) {
    roomGroupsConfig.push({
      name: 'Recovery Focused',
      order: 4,
      rooms: [
        { name: 'Recovery Milestones', order: 1, postingRole: 'member' },
        { name: 'Nutrition Support', order: 2, postingRole: 'member' },
        { name: 'Body Positivity', order: 3, postingRole: 'member' },
      ],
    });
  } else {
    // Generic specialized room group for other conditions
    roomGroupsConfig.push({
      name: 'Specialized Support',
      order: 4,
      rooms: [
        { name: 'Treatment Options', order: 1, postingRole: 'member' },
        { name: 'Progress Tracking', order: 2, postingRole: 'member' },
        { name: 'Peer Support', order: 3, postingRole: 'member' },
      ],
    });
  }

  // Create room groups and rooms
  for (const groupConfig of roomGroupsConfig) {
    // Check if room group already exists
    const existingRoomGroup = await prisma.roomGroup.findFirst({
      where: {
        communityId: community.id,
        name: groupConfig.name,
      },
    });

    let roomGroup;
    if (!existingRoomGroup) {
      roomGroup = await prisma.roomGroup.create({
        data: {
          name: groupConfig.name,
          order: groupConfig.order,
          communityId: community.id,
        },
      });
      console.log(`  ✅ Created room group: ${groupConfig.name}`);
    } else {
      roomGroup = existingRoomGroup;
      console.log(`  ⏭️  Room group already exists: ${groupConfig.name}`);
    }

    // Create rooms for this group
    for (const roomConfig of groupConfig.rooms) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          roomGroupId: roomGroup.id,
          name: roomConfig.name,
        },
      });

      if (!existingRoom) {
        await prisma.room.create({
          data: {
            name: roomConfig.name,
            order: roomConfig.order,
            postingRole: roomConfig.postingRole,
            roomGroupId: roomGroup.id,
          },
        });
        console.log(
          `    ✅ Created room: ${roomConfig.name} (${roomConfig.postingRole}+)`,
        );
      } else {
        console.log(`    ⏭️  Room already exists: ${roomConfig.name}`);
      }
    }
  }
}

export async function seedMemberships(
  prisma: PrismaClient,
  users: any[],
  communities: any[]
) {
  console.log('👥 Creating community memberships...');

  const memberships: any[] = [];

  // Get only client and therapist users for community memberships
  const memberUsers = users.filter((user) =>
    ['client', 'therapist'].includes(user.role),
  );

  for (const community of communities) {
    // Each community gets 60-80% of users as members
    const memberCount = Math.floor(
      memberUsers.length * faker.number.float({ min: 0.6, max: 0.8 }),
    );
    const communityMembers = faker.helpers.arrayElements(
      memberUsers,
      memberCount,
    );

    for (const user of communityMembers) {
      try {
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            communityId: community.id,
            // Note: Membership model doesn't have a role field
            joinedAt: faker.date.past({ years: 2 }),
          },
        });
        memberships.push(membership);
      } catch (error) {
        // Skip if membership already exists
      }
    }
    console.log(
      `✅ Created memberships for ${community.name}: ${communityMembers.length} members`,
    );
  }

  return memberships;
}