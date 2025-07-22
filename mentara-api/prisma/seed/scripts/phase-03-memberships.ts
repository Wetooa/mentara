// Phase 3: Community Memberships & Moderator Assignments
// Creates community memberships for users and assigns moderators to communities

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PhaseResult } from './progress-tracker';

interface MembershipsPhaseData {
  memberships: any[];
  moderatorAssignments: any[];
}

export async function runPhase03Memberships(
  prisma: PrismaClient,
  usersData: any,
  communitiesData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`👥 PHASE 3: Creating community memberships & moderator assignments (${config} mode)...`);

  try {
    const { users, moderators } = usersData;
    const { communities } = communitiesData;

    if (!users?.length || !communities?.length) {
      return {
        success: false,
        message: 'Missing required data from previous phases (users or communities)',
      };
    }

    // Check if memberships already exist (idempotent check)
    const existingMembershipsCount = await prisma.membership.count();
    if (existingMembershipsCount > 0) {
      console.log(`⏭️ Found ${existingMembershipsCount} existing memberships, skipping phase`);
      
      // Return existing data
      const existingMemberships = await prisma.membership.findMany();
      const existingAssignments = await prisma.moderatorCommunity.findMany();

      return {
        success: true,
        message: `Found ${existingMembershipsCount} existing memberships`,
        skipped: true,
        data: { memberships: existingMemberships, moderatorAssignments: existingAssignments },
      };
    }

    // Create community memberships
    const memberships = await createCommunityMemberships(prisma, users, communities);

    // Create moderator assignments
    const moderatorAssignments = await createModeratorAssignments(prisma, moderators || [], communities);

    console.log(`✅ Phase 3 completed: Created ${memberships.length} memberships and ${moderatorAssignments.length} moderator assignments`);

    return {
      success: true,
      message: `Created ${memberships.length} memberships and ${moderatorAssignments.length} moderator assignments`,
      data: { memberships, moderatorAssignments },
    };

  } catch (error) {
    console.error('❌ Phase 3 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function createCommunityMemberships(
  prisma: PrismaClient,
  users: any[],
  communities: any[]
): Promise<any[]> {
  console.log('👥 Creating community memberships...');

  const memberships: any[] = [];

  // Get only client and therapist users for community memberships
  const memberUsers = users.filter((user) =>
    ['client', 'therapist'].includes(user.role),
  );

  console.log(`📊 Found ${memberUsers.length} eligible users (clients + therapists) for ${communities.length} communities`);

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
            joinedAt: faker.date.past({ years: 2 }),
          },
        });
        memberships.push(membership);
      } catch (error) {
        // Skip if membership already exists (duplicate key)
      }
    }
    console.log(
      `✅ Created memberships for ${community.name}: ${communityMembers.length} members`,
    );
  }

  return memberships;
}

async function createModeratorAssignments(
  prisma: PrismaClient,
  moderators: any[],
  communities: any[]
): Promise<any[]> {
  console.log('👮 Creating moderator-community assignments...');

  const assignments: any[] = [];

  if (!moderators.length) {
    console.log('⏭️ No moderators found, skipping moderator assignments');
    return assignments;
  }

  for (const moderator of moderators) {
    // Each moderator gets assigned to 3-5 communities
    const assignmentCount = faker.number.int({ min: 3, max: 5 });
    const assignedCommunities = faker.helpers.arrayElements(
      communities,
      Math.min(assignmentCount, communities.length)
    );

    for (const community of assignedCommunities) {
      try {
        const assignment = await prisma.moderatorCommunity.create({
          data: {
            moderatorId: moderator.id,
            communityId: community.id,
            assignedAt: faker.date.past({ years: 1 }),
          },
        });
        assignments.push(assignment);
        console.log(
          `✅ Assigned moderator ${moderator.firstName} to ${community.name}`
        );
      } catch (error) {
        // Skip if assignment already exists
        console.log(
          `⏭️ Assignment already exists: ${moderator.firstName} -> ${community.name}`
        );
      }
    }
  }

  console.log(`✅ Created ${assignments.length} moderator assignments`);
  return assignments;
}