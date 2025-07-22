// Phase 2: Communities Seeding
// Creates communities and their room structures

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PhaseResult } from './progress-tracker';
import { ILLNESS_COMMUNITIES } from '../config';

interface CommunitiesPhaseData {
  communities: any[];
}

export async function runPhase02Communities(
  prisma: PrismaClient,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`🏘️ PHASE 2: Creating communities (${config} mode)...`);

  try {
    // Check if room structures already exist (better idempotent check)
    const existingRoomsCount = await prisma.room.count();
    if (existingRoomsCount > 0) {
      console.log(`⏭️ Found ${existingRoomsCount} existing rooms, communities already set up`);
      
      // Return existing data for next phases
      const existingCommunities = await prisma.community.findMany();

      return {
        success: true,
        message: `Found communities with ${existingRoomsCount} existing rooms`,
        skipped: true,
        data: { communities: existingCommunities },
      };
    }

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
        console.log(`⏭️ Community already exists: ${communityConfig.name}`);
      }
      communities.push(community);

      // Create room groups and rooms for this community
      await createRoomStructure(prisma, community);
    }

    console.log(`✅ Phase 2 completed: Created ${communities.length} communities with room structures`);

    return {
      success: true,
      message: `Created ${communities.length} communities successfully`,
      data: { communities },
    };

  } catch (error) {
    console.error('❌ Phase 2 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function createRoomStructure(prisma: PrismaClient, community: any) {
  console.log(`🏗️ Creating room structure for ${community.name}...`);

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
  // Based on the 14 questionnaire disorders
  if (community.slug.includes('stress')) {
    roomGroupsConfig.push({
      name: 'Stress Management',
      order: 4,
      rooms: [
        { name: 'Stress Reduction Techniques', order: 1, postingRole: 'member' },
        { name: 'Work-Life Balance', order: 2, postingRole: 'member' },
        { name: 'Relaxation Methods', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('anxiety')) {
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
  } else if (community.slug.includes('insomnia')) {
    roomGroupsConfig.push({
      name: 'Sleep Support',
      order: 4,
      rooms: [
        { name: 'Sleep Hygiene Tips', order: 1, postingRole: 'member' },
        { name: 'Sleep Tracking', order: 2, postingRole: 'member' },
        { name: 'Bedtime Routines', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('panic-disorder')) {
    roomGroupsConfig.push({
      name: 'Panic Support',
      order: 4,
      rooms: [
        { name: 'Panic Attack Recovery', order: 1, postingRole: 'member' },
        { name: 'Breathing Techniques', order: 2, postingRole: 'member' },
        { name: 'Emergency Coping', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('bipolar')) {
    roomGroupsConfig.push({
      name: 'Bipolar Management',
      order: 4,
      rooms: [
        { name: 'Mood Stabilization', order: 1, postingRole: 'member' },
        { name: 'Medication Management', order: 2, postingRole: 'member' },
        { name: 'Episode Prevention', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('ocd')) {
    roomGroupsConfig.push({
      name: 'OCD Specific',
      order: 4,
      rooms: [
        { name: 'Compulsion Management', order: 1, postingRole: 'member' },
        { name: 'ERP (Exposure Response Prevention)', order: 2, postingRole: 'member' },
        { name: 'Intrusive Thoughts', order: 3, postingRole: 'member' },
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
  } else if (community.slug.includes('social-anxiety')) {
    roomGroupsConfig.push({
      name: 'Social Anxiety Support',
      order: 4,
      rooms: [
        { name: 'Social Skills Practice', order: 1, postingRole: 'member' },
        { name: 'Public Speaking Support', order: 2, postingRole: 'member' },
        { name: 'Confidence Building', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('phobia')) {
    roomGroupsConfig.push({
      name: 'Phobia Management',
      order: 4,
      rooms: [
        { name: 'Exposure Therapy', order: 1, postingRole: 'member' },
        { name: 'Specific Phobias', order: 2, postingRole: 'member' },
        { name: 'Gradual Exposure', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('burnout')) {
    roomGroupsConfig.push({
      name: 'Burnout Recovery',
      order: 4,
      rooms: [
        { name: 'Work Boundaries', order: 1, postingRole: 'member' },
        { name: 'Energy Management', order: 2, postingRole: 'member' },
        { name: 'Career Transitions', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('eating-disorders')) {
    roomGroupsConfig.push({
      name: 'Recovery Focused',
      order: 4,
      rooms: [
        { name: 'Recovery Milestones', order: 1, postingRole: 'member' },
        { name: 'Nutrition Support', order: 2, postingRole: 'member' },
        { name: 'Body Positivity', order: 3, postingRole: 'member' },
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
  } else if (community.slug.includes('substance-use')) {
    roomGroupsConfig.push({
      name: 'Recovery Support',
      order: 4,
      rooms: [
        { name: 'Sobriety Milestones', order: 1, postingRole: 'member' },
        { name: 'Relapse Prevention', order: 2, postingRole: 'member' },
        { name: 'Recovery Tools', order: 3, postingRole: 'member' },
      ],
    });
  } else {
    // Fallback for any missed cases
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
      console.log(`  ⏭️ Room group already exists: ${groupConfig.name}`);
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
        console.log(`    ⏭️ Room already exists: ${roomConfig.name}`);
      }
    }
  }
}