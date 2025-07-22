#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';
import { ILLNESS_COMMUNITIES } from '../config';

const prisma = new PrismaClient();

// Room structure for communities
const ROOM_STRUCTURE = {
  'Welcome & Info': {
    rooms: [
      { name: 'Welcome', permissions: 'moderator+', description: 'Welcome new members and introductions' },
      { name: 'Announcements', permissions: 'moderator+', description: 'Important community updates' },
      { name: 'Community Guidelines', permissions: 'moderator+', description: 'Rules and guidelines for the community' },
    ]
  },
  'General Discussion': {
    rooms: [
      { name: 'General Chat', permissions: 'member+', description: 'Open discussion for all members' },
      { name: 'Share Your Story', permissions: 'member+', description: 'Share your personal experiences' },
      { name: 'Daily Check-ins', permissions: 'member+', description: 'Daily mood and wellness check-ins' },
    ]
  },
  'Support & Resources': {
    rooms: [
      { name: 'Ask for Help', permissions: 'member+', description: 'Request support from the community' },
      { name: 'Success Stories', permissions: 'member+', description: 'Share your victories and progress' },
      { name: 'Helpful Resources', permissions: 'member+', description: 'Share useful links and resources' },
      { name: 'Coping Strategies', permissions: 'member+', description: 'Discuss and share coping techniques' },
    ]
  },
};

// Condition-specific room groups
const CONDITION_ROOMS = {
  'anxiety': {
    'Anxiety Specific': {
      rooms: [
        { name: 'Panic Attack Support', permissions: 'member+', description: 'Support for panic attacks' },
        { name: 'Exposure Therapy', permissions: 'member+', description: 'Discuss exposure therapy experiences' },
        { name: 'Mindfulness for Anxiety', permissions: 'member+', description: 'Mindfulness techniques for anxiety' },
      ]
    }
  },
  'depression': {
    'Depression Specific': {
      rooms: [
        { name: 'Mood Tracking', permissions: 'member+', description: 'Track and discuss mood patterns' },
        { name: 'Activity Scheduling', permissions: 'member+', description: 'Plan and share daily activities' },
        { name: 'Medication Support', permissions: 'member+', description: 'Discuss medication experiences' },
      ]
    }
  },
  'insomnia': {
    'Sleep Support': {
      rooms: [
        { name: 'Sleep Hygiene Tips', permissions: 'member+', description: 'Share sleep hygiene practices' },
        { name: 'Sleep Tracking', permissions: 'member+', description: 'Track and analyze sleep patterns' },
        { name: 'Bedtime Routines', permissions: 'member+', description: 'Share effective bedtime routines' },
      ]
    }
  },
  'panic-disorder': {
    'Panic Support': {
      rooms: [
        { name: 'Panic Attack Recovery', permissions: 'member+', description: 'Recovery from panic attacks' },
        { name: 'Breathing Techniques', permissions: 'member+', description: 'Learn and practice breathing exercises' },
        { name: 'Emergency Coping', permissions: 'member+', description: 'Immediate coping strategies' },
      ]
    }
  },
  'bipolar-disorder': {
    'Bipolar Management': {
      rooms: [
        { name: 'Mood Stabilization', permissions: 'member+', description: 'Techniques for mood stability' },
        { name: 'Medication Management', permissions: 'member+', description: 'Discuss medication strategies' },
        { name: 'Episode Prevention', permissions: 'member+', description: 'Prevent manic/depressive episodes' },
      ]
    }
  },
  'ocd': {
    'OCD Specific': {
      rooms: [
        { name: 'Compulsion Management', permissions: 'member+', description: 'Manage compulsive behaviors' },
        { name: 'ERP (Exposure Response Prevention)', permissions: 'member+', description: 'ERP therapy discussions' },
        { name: 'Intrusive Thoughts', permissions: 'member+', description: 'Deal with intrusive thoughts' },
      ]
    }
  },
  'ptsd': {
    'PTSD Specific': {
      rooms: [
        { name: 'Trauma Recovery', permissions: 'member+', description: 'Support for trauma recovery' },
        { name: 'EMDR Support', permissions: 'member+', description: 'EMDR therapy experiences' },
        { name: 'Grounding Techniques', permissions: 'member+', description: 'Learn grounding exercises' },
      ]
    }
  },
  'phobia': {
    'Phobia Management': {
      rooms: [
        { name: 'Exposure Therapy', permissions: 'member+', description: 'Exposure therapy for phobias' },
        { name: 'Specific Phobias', permissions: 'member+', description: 'Discuss specific phobia types' },
        { name: 'Gradual Exposure', permissions: 'member+', description: 'Gradual exposure techniques' },
      ]
    }
  },
  'stress': {
    'Stress Management': {
      rooms: [
        { name: 'Stress Reduction Techniques', permissions: 'member+', description: 'Learn stress reduction methods' },
        { name: 'Work-Life Balance', permissions: 'member+', description: 'Balance work and personal life' },
        { name: 'Relaxation Methods', permissions: 'member+', description: 'Practice relaxation techniques' },
      ]
    }
  },
  'burnout': {
    'Burnout Recovery': {
      rooms: [
        { name: 'Recovery Planning', permissions: 'member+', description: 'Plan your burnout recovery' },
        { name: 'Self-Care Strategies', permissions: 'member+', description: 'Self-care for burnout prevention' },
        { name: 'Work Boundaries', permissions: 'member+', description: 'Set healthy work boundaries' },
      ]
    }
  }
};

async function createRoomStructure(community: any) {
  console.log(`🏗️  Creating room structure for ${community.name}...`);
  
  let roomsCreated = 0;
  
  // Create standard room structure
  for (const [groupName, groupData] of Object.entries(ROOM_STRUCTURE)) {
    console.log(`  ✅ Created room group: ${groupName}`);
    
    for (const roomData of (groupData as any).rooms) {
      try {
        const room = await prisma.communityRoom.create({
          data: {
            communityId: community.id,
            name: roomData.name,
            description: roomData.description,
            roomType: 'TEXT',
            permissions: roomData.permissions,
            position: roomsCreated,
            roomGroup: groupName,
          },
        });
        console.log(`    ✅ Created room: ${roomData.name} (${roomData.permissions})`);
        roomsCreated++;
      } catch (error) {
        console.log(`    ⚠️  Skipped room: ${roomData.name} (already exists)`);
      }
    }
  }
  
  // Create condition-specific rooms
  const communitySlug = community.slug;
  const conditionKey = communitySlug.replace('-support', '').replace('-disorder', '');
  
  if (CONDITION_ROOMS[conditionKey]) {
    for (const [groupName, groupData] of Object.entries(CONDITION_ROOMS[conditionKey])) {
      console.log(`  ✅ Created room group: ${groupName}`);
      
      for (const roomData of (groupData as any).rooms) {
        try {
          const room = await prisma.communityRoom.create({
            data: {
              communityId: community.id,
              name: roomData.name,
              description: roomData.description,
              roomType: 'TEXT',
              permissions: roomData.permissions,
              position: roomsCreated,
              roomGroup: groupName,
            },
          });
          console.log(`    ✅ Created room: ${roomData.name} (${roomData.permissions})`);
          roomsCreated++;
        } catch (error) {
          console.log(`    ⚠️  Skipped room: ${roomData.name} (already exists)`);
        }
      }
    }
  }
  
  return roomsCreated;
}

async function main() {
  console.log('🏘️  Seeding Communities (Standalone)...');
  
  try {
    // Check if communities already exist
    const existingCommunities = await prisma.community.count();
    if (existingCommunities > 0) {
      console.log(`ℹ️  Found ${existingCommunities} existing communities`);
      const answer = process.env.FORCE_SEED || 'n';
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('✅ Communities already exist, skipping...');
        return;
      }
    }

    // Fetch moderators for community assignments
    const moderators = await prisma.user.findMany({
      where: { role: 'moderator' },
      include: { moderator: true }
    });

    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      include: { client: true }
    });

    console.log(`📊 Found ${moderators.length} moderators and ${clients.length} clients`);

    let communitiesCreated = 0;
    let totalRooms = 0;
    let totalMemberships = 0;
    let totalModeratorAssignments = 0;

    // Create illness-specific communities
    for (const communityData of ILLNESS_COMMUNITIES) {
      try {
        const community = await prisma.community.upsert({
          where: { slug: communityData.slug },
          update: {},
          create: {
            name: communityData.name,
            slug: communityData.slug,
            description: communityData.description,
            imageUrl: '', // Empty string as required field
          },
        });

        console.log(`✅ Created/found community: ${community.name}`);
        communitiesCreated++;

        // Create room structure
        const roomsCreated = await createRoomStructure(community);
        totalRooms += roomsCreated;

        // Create memberships (clients join communities)
        if (clients.length > 0) {
          const membersToAdd = Math.min(clients.length, Math.floor(clients.length * 0.7)); // 70% of clients join each community
          const selectedClients = clients.slice(0, membersToAdd);
          
          for (const client of selectedClients) {
            try {
              await prisma.membership.create({
                data: {
                  userId: client.id,
                  communityId: community.id,
                },
              });
              totalMemberships++;
            } catch (error) {
              // Skip if membership already exists
            }
          }
        }

        // Assign moderators to communities
        if (moderators.length > 0) {
          for (const moderator of moderators) {
            try {
              await prisma.moderatorCommunity.create({
                data: {
                  moderatorId: moderator.id,
                  communityId: community.id,
                },
              });
              totalModeratorAssignments++;
            } catch (error) {
              // Skip if assignment already exists
            }
          }
        }

      } catch (error) {
        console.log(`⚠️  Failed to create community ${communityData.name}:`, error.message);
      }
    }

    console.log('\n🎉 Communities seeded successfully!');
    console.log('📈 Summary:');
    console.log(`   🏘️  Communities: ${communitiesCreated}`);
    console.log(`   🏠 Rooms: ${totalRooms}`);
    console.log(`   👥 Memberships: ${totalMemberships}`);
    console.log(`   👮 Moderator assignments: ${totalModeratorAssignments}`);

  } catch (error) {
    console.error('❌ Error seeding communities:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during community seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });