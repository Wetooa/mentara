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
 * Utility functions
 */
function randomPastDate(daysAgo: number): Date {
  const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms);
}