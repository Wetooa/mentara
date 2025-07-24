/**
 * Communities Generator
 * 
 * Creates mental health and general support communities
 */

import { PrismaClient } from '@prisma/client';
import { CommunityConfig, MENTAL_HEALTH_COMMUNITIES, GENERAL_COMMUNITIES } from '../config';

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

  // Create mental health communities
  const mentalHealthToCreate = MENTAL_HEALTH_COMMUNITIES.slice(0, config.illnessBased);
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