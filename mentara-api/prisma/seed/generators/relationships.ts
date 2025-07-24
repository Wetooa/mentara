/**
 * Relationships Generator
 *
 * Creates client-therapist relationships and community memberships
 */

import { PrismaClient } from '@prisma/client';
import { RelationshipConfig } from '../config';
import { UsersData } from './users';
import { CommunitiesData } from './communities';

export interface RelationshipsData {
  clientTherapistRelationships: any[];
  communityMemberships: any[];
  moderatorAssignments: any[];
}

/**
 * Generate relationships and memberships
 */
export async function generateRelationships(
  prisma: PrismaClient,
  config: RelationshipConfig,
  usersData: UsersData,
  communitiesData: CommunitiesData,
): Promise<RelationshipsData> {
  console.log('  Creating relationships and memberships...');

  const result: RelationshipsData = {
    clientTherapistRelationships: [],
    communityMemberships: [],
    moderatorAssignments: [],
  };

  // Create client-therapist relationships
  await createClientTherapistRelationships(prisma, config, usersData, result);

  // Create community memberships
  await createCommunityMemberships(
    prisma,
    config,
    usersData,
    communitiesData,
    result,
  );

  // Assign moderators to communities
  await createModeratorAssignments(prisma, usersData, communitiesData, result);

  console.log(
    `    ✅ ${result.clientTherapistRelationships.length} client-therapist relationships`,
  );
  console.log(
    `    ✅ ${result.communityMemberships.length} community memberships`,
  );
  console.log(
    `    ✅ ${result.moderatorAssignments.length} moderator assignments`,
  );

  return result;
}

/**
 * Create client-therapist relationships
 */
async function createClientTherapistRelationships(
  prisma: PrismaClient,
  config: RelationshipConfig,
  usersData: UsersData,
  result: RelationshipsData,
): Promise<void> {
  // Only include approved therapists
  const approvedTherapists = usersData.therapists.filter(
    (t) => t.therapist.status === 'APPROVED',
  );

  if (approvedTherapists.length === 0) {
    console.log(
      '    ⚠️  No approved therapists found, skipping client-therapist relationships',
    );
    return;
  }

  const clientsToAssign = Math.floor(
    usersData.clients.length * config.clientTherapistRatio,
  );
  const shuffledClients = [...usersData.clients].sort(
    () => 0.5 - Math.random(),
  );

  for (let i = 0; i < Math.min(clientsToAssign, shuffledClients.length); i++) {
    const client = shuffledClients[i];
    const therapist = randomChoice(approvedTherapists);

    try {
      const relationship = await prisma.clientTherapist.create({
        data: {
          clientId: client.user.id,
          therapistId: therapist.user.id,
          status: Math.random() > 0.1 ? 'active' : 'inactive', // 90% active
          assignedAt: randomPastDate(180),
        },
      });

      result.clientTherapistRelationships.push({
        relationship,
        client: client.user,
        therapist: therapist.user,
      });
    } catch (error) {
      // Skip duplicate relationships
      console.log(
        `    ⚠️  Skipped duplicate relationship for client ${client.user.email}`,
      );
      console.log(error);
    }
  }
}

/**
 * Create community memberships
 */
async function createCommunityMemberships(
  prisma: PrismaClient,
  config: RelationshipConfig,
  usersData: UsersData,
  communitiesData: CommunitiesData,
  result: RelationshipsData,
): Promise<void> {
  // Get all users who can join communities (excluding some admins)
  const eligibleUsers = [
    ...usersData.clients.map((c) => c.user),
    ...usersData.therapists.map((t) => t.user),
    ...usersData.moderators.map((m) => m.user),
  ];

  for (const user of eligibleUsers) {
    // Determine if user joins communities
    if (Math.random() > config.communityMembershipRate) continue;

    // Determine number of communities to join
    const communitiesToJoin = Math.min(
      Math.floor(Math.random() * config.averageMembershipsPerUser) + 1,
      communitiesData.communities.length,
    );

    // Select random communities, preferring mental health communities for clients
    const availableCommunities = [...communitiesData.communities];
    const selectedCommunities: any[] = [];

    // Clients are more likely to join mental health communities
    if (user.role === 'client') {
      const mentalHealthOptions = availableCommunities.filter((c) =>
        communitiesData.mentalHealthCommunities.includes(c),
      );

      // 70% chance to join at least one mental health community
      if (Math.random() > 0.3 && mentalHealthOptions.length > 0) {
        selectedCommunities.push(randomChoice(mentalHealthOptions));
      }
    }

    // Fill remaining slots with random communities
    while (
      selectedCommunities.length < communitiesToJoin &&
      availableCommunities.length > 0
    ) {
      const remaining = availableCommunities.filter(
        (c) => !selectedCommunities.includes(c),
      );
      if (remaining.length === 0) break;

      selectedCommunities.push(randomChoice(remaining));
    }

    // Create memberships
    for (const community of selectedCommunities) {
      try {
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            communityId: community.id,
            joinedAt: randomPastDate(120),
          },
        });

        result.communityMemberships.push({
          membership,
          user,
          community,
        });
      } catch (error) {
        // Skip duplicate memberships
        continue;
      }
    }
  }
}

/**
 * Assign moderators to communities
 */
async function createModeratorAssignments(
  prisma: PrismaClient,
  usersData: UsersData,
  communitiesData: CommunitiesData,
  result: RelationshipsData,
): Promise<void> {
  if (usersData.moderators.length === 0) {
    console.log('    ⚠️  No moderators found, skipping moderator assignments');
    return;
  }

  // Assign each moderator to 2-4 communities
  for (const moderatorData of usersData.moderators) {
    const communitiesToModerate = Math.min(
      randomInt(2, 4),
      communitiesData.communities.length,
    );

    const shuffledCommunities = [...communitiesData.communities].sort(
      () => 0.5 - Math.random(),
    );

    for (let i = 0; i < communitiesToModerate; i++) {
      const community = shuffledCommunities[i];

      try {
        const assignment = await prisma.moderatorCommunity.create({
          data: {
            moderatorId: moderatorData.user.id,
            communityId: community.id,
            assignedAt: randomPastDate(90),
          },
        });

        result.moderatorAssignments.push({
          assignment,
          moderator: moderatorData.user,
          community,
        });
      } catch (error) {
        // Skip duplicate assignments
        continue;
      }
    }
  }
}

/**
 * Utility functions
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(daysAgo: number): Date {
  const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms);
}
