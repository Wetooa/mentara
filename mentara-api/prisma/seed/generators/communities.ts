/**
 * Communities Generator
 * 
 * Creates mental health and general support communities
 */

import { PrismaClient } from '@prisma/client';
import { CommunityConfig, MENTAL_HEALTH_COMMUNITIES, GENERAL_COMMUNITIES } from '../config';
import { TEST_COMMUNITIES } from '../fixtures/test-accounts';

export interface CommunitiesData {
  communities: any[];
  mentalHealthCommunities: any[];
  generalCommunities: any[];
}

/**
 * Generate communities based on configuration
 */
export async function generateCommunities(
  prisma: PrismaClient, 
  config: CommunityConfig
): Promise<CommunitiesData> {
  console.log('  Creating communities...');
  
  const result: CommunitiesData = {
    communities: [],
    mentalHealthCommunities: [],
    generalCommunities: [],
  };

  // First, create required test communities with specific IDs
  for (const testCommunity of TEST_COMMUNITIES) {
    const community = await prisma.community.create({
      data: {
        id: testCommunity.id, // Use specific ID from TEST_ACCOUNTS.md
        name: testCommunity.name,
        slug: testCommunity.slug,
        description: testCommunity.description,
        imageUrl: `/images/communities/${testCommunity.slug}.jpg`,
        createdAt: randomPastDate(180),
      },
    });
    
    result.communities.push(community);
    result.mentalHealthCommunities.push(community);
  }

  // Create additional mental health communities if needed
  const additionalNeeded = Math.max(0, config.illnessBased - TEST_COMMUNITIES.length);
  const mentalHealthToCreate = MENTAL_HEALTH_COMMUNITIES
    .filter(c => !TEST_COMMUNITIES.some(tc => tc.slug === c.slug))
    .slice(0, additionalNeeded);
  
  for (const communityData of mentalHealthToCreate) {
    const community = await prisma.community.create({
      data: {
        name: communityData.name,
        slug: communityData.slug,
        description: communityData.description,
        imageUrl: communityData.imageUrl,
        createdAt: randomPastDate(180),
      },
    });
    
    result.communities.push(community);
    result.mentalHealthCommunities.push(community);
  }

  // Create general communities
  const generalToCreate = GENERAL_COMMUNITIES.slice(0, config.general);
  for (const communityData of generalToCreate) {
    const community = await prisma.community.create({
      data: {
        name: communityData.name,
        slug: communityData.slug,
        description: communityData.description,
        imageUrl: communityData.imageUrl,
        createdAt: randomPastDate(120),
      },
    });
    
    result.communities.push(community);
    result.generalCommunities.push(community);
  }

  console.log(`    ✅ ${result.communities.length} communities created`);
  console.log(`    📊 ${result.mentalHealthCommunities.length} mental health, ${result.generalCommunities.length} general`);

  return result;
}

/**
 * Ensure test communities exist (create only if missing). Additive / idempotent.
 * Also ensures each community has at least one RoomGroup and Room for content.
 * Returns how many communities were created.
 */
export async function ensureTestCommunities(prisma: PrismaClient): Promise<number> {
  let created = 0;

  for (const tc of TEST_COMMUNITIES) {
    const existing = await prisma.community.findUnique({ where: { id: tc.id } });
    if (existing) continue;

    await prisma.community.create({
      data: {
        id: tc.id,
        name: tc.name,
        slug: tc.slug,
        description: tc.description,
        imageUrl: `/images/communities/${tc.slug}.jpg`,
        createdAt: randomPastDate(180),
      },
    });
    created++;
  }

  await ensureRoomStructureForAllCommunities(prisma);
  return created;
}

/**
 * Ensure every community has at least one RoomGroup and one Room.
 */
async function ensureRoomStructureForAllCommunities(
  prisma: PrismaClient,
): Promise<void> {
  const communities = await prisma.community.findMany({
    include: { roomGroups: { include: { rooms: true } } },
  });

  for (const community of communities) {
    if (community.roomGroups.length > 0 && community.roomGroups[0].rooms.length > 0) continue;

    const roomGroup = await prisma.roomGroup.create({
      data: {
        name: 'General',
        order: 1,
        communityId: community.id,
      },
    });
    await prisma.room.create({
      data: {
        name: 'General Discussion',
        order: 1,
        postingRole: 'member',
        roomGroupId: roomGroup.id,
      },
    });
  }
}

/**
 * Add communities up to config targets (only creates the shortfall). Additive.
 * Uses existing slugs to avoid duplicates.
 */
export async function addCommunitiesUpTo(
  prisma: PrismaClient,
  config: CommunityConfig,
): Promise<number> {
  const existing = await prisma.community.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map((c) => c.slug));
  const targetTotal = config.illnessBased + config.general;
  if (existing.length >= targetTotal) return 0;

  let created = 0;

  const mentalHealthToCreate = MENTAL_HEALTH_COMMUNITIES.filter(
    (c) => !existingSlugs.has(c.slug),
  ).slice(0, Math.max(0, config.illnessBased - TEST_COMMUNITIES.length));
  for (const c of mentalHealthToCreate) {
    if (existing.length + created >= targetTotal) break;
    await prisma.community.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl ?? `/images/communities/${c.slug}.jpg`,
        createdAt: randomPastDate(180),
      },
    });
    created++;
    existingSlugs.add(c.slug);
  }

  const generalToCreate = GENERAL_COMMUNITIES.filter(
    (c) => !existingSlugs.has(c.slug),
  ).slice(0, Math.max(0, config.general));
  for (const c of generalToCreate) {
    if (existing.length + created >= targetTotal) break;
    await prisma.community.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl ?? `/images/communities/${c.slug}.jpg`,
        createdAt: randomPastDate(120),
      },
    });
    created++;
  }

  await ensureRoomStructureForAllCommunities(prisma);
  return created;
}

/**
 * Utility functions
 */
function randomPastDate(daysAgo: number): Date {
  const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms);
}