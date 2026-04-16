/**
 * Community Configuration
 *
 * This file contains configurations for pre-generated communities,
 * particularly illness-specific communities that are created during
 * database seeding and application setup.
 * 
 * IMPORTANT: This file now uses centralized community definitions to ensure
 * perfect alignment between questionnaires, AI recommendations, and database seeding.
 */

import { 
  CANONICAL_COMMUNITIES, 
  getAllCanonicalCommunities, 
  getCommunityBySlug as getCanonicalCommunityBySlug,
  GENERAL_COMMUNITIES,
  CommunityDefinition
} from '../common/constants/communities';
import { 
  CANONICAL_QUESTIONNAIRE_IDS,
  CanonicalQuestionnaireId,
  QUESTIONNAIRE_DISPLAY_NAMES
} from '../common/constants/disorders';

export interface CommunityConfig {
  name: string;
  description: string;
  slug: string;
  illness?: string;
}

/**
 * Predefined illness communities that are automatically created
 * during database seeding. These communities provide focused
 * support spaces for users with specific mental health conditions.
 * 
 * NOTE: Now sourced from centralized canonical definitions
 */
export const ILLNESS_COMMUNITIES: CommunityConfig[] = getAllCanonicalCommunities().map(community => ({
  name: community.name,
  description: community.description,
  slug: community.slug,
  illness: QUESTIONNAIRE_DISPLAY_NAMES[community.id]
}));

// Keep legacy export for backward compatibility
export const COMMUNITIES = ILLNESS_COMMUNITIES;

/**
 * Helper function to get community configuration by slug
 * @param slug - The unique slug identifier for the community
 * @returns The community configuration or undefined if not found
 */
export function getCommunityBySlug(slug: string): CommunityConfig | undefined {
  const canonicalCommunity = getCanonicalCommunityBySlug(slug);
  if (canonicalCommunity) {
    return {
      name: canonicalCommunity.name,
      description: canonicalCommunity.description,
      slug: canonicalCommunity.slug,
      illness: QUESTIONNAIRE_DISPLAY_NAMES[canonicalCommunity.id]
    };
  }
  return undefined;
}

/**
 * Helper function to get all community names
 * @returns Array of all community names
 */
export function getAllCommunityNames(): string[] {
  return ILLNESS_COMMUNITIES.map((community) => community.name);
}

/**
 * Helper function to get communities by illness type
 * @param illness - The illness type to filter by
 * @returns Array of communities for the specified illness
 */
export function getCommunitiesByIllness(illness: string): CommunityConfig[] {
  return ILLNESS_COMMUNITIES.filter(
    (community) => community.illness === illness,
  );
}

/**
 * Helper function to get all available illness types
 * @returns Array of unique illness types
 */
export function getAllIllnessTypes(): string[] {
  return [
    ...new Set(
      ILLNESS_COMMUNITIES.map((community) => community.illness).filter(Boolean),
    ),
  ] as string[];
}

/**
 * Mapping between AI disorder predictions and community slugs
 * Used for automatic community recommendations based on assessment results
 * 
 * UPDATED: Now uses canonical questionnaire IDs instead of Has_* format
 */
export const AI_DISORDER_TO_COMMUNITY_MAPPING: Record<string, string[]> = {
  // Primary mappings based on canonical questionnaire IDs
  depression: ['depression-support'],
  anxiety: ['anxiety-warriors'],
  'social-phobia': ['social-anxiety-support', 'anxiety-warriors'],
  ptsd: ['ptsd-support'],
  'panic-disorder': ['panic-disorder-support', 'anxiety-warriors'],
  'mood-disorder': ['bipolar-support'],
  'obsessional-compulsive': ['ocd-support'],
  insomnia: ['insomnia-support'],
  stress: ['stress-support', 'burnout-recovery'],
  burnout: ['burnout-recovery', 'stress-support'],
  'binge-eating': ['eating-disorder-recovery'],
  adhd: ['adhd-support'],
  alcohol: ['alcohol-recovery-support'],
  'drug-abuse': ['substance-recovery-support'],
  phobia: ['phobia-support'],
  
  // Legacy mappings for backward compatibility (to be phased out)
  Has_Depression: ['depression-support'],
  Has_Anxiety: ['anxiety-warriors'],
  Has_Social_Anxiety: ['social-anxiety-support', 'anxiety-warriors'],
  Has_PTSD: ['ptsd-support'],
  Has_Panic_Disorder: ['panic-disorder-support', 'anxiety-warriors'],
  Has_Bipolar: ['bipolar-support'],
  Has_OCD: ['ocd-support'],
  Has_Insomnia: ['insomnia-support'],
  Has_High_Stress: ['stress-support', 'burnout-recovery'],
  Has_Burnout: ['burnout-recovery', 'stress-support'],
  Has_Binge_Eating: ['eating-disorder-recovery'],
  Has_ADHD: ['adhd-support'],
  Has_Alcohol_Problem: ['alcohol-recovery-support'],
  Has_Drug_Problem: ['substance-recovery-support'],
  Has_Phobia: ['phobia-support'],
  Has_Agoraphobia: ['phobia-support', 'social-anxiety-support'],
  Has_BloodPhobia: ['phobia-support'],
  Has_SocialPhobia: ['social-anxiety-support', 'phobia-support'],
  Has_Hoarding: ['ocd-support'], // Hoarding is often OCD-related
};

/**
 * Helper function to get recommended communities based on AI disorder predictions
 * @param disorderPredictions - Object with disorder predictions (boolean values)
 * @returns Array of recommended community slugs
 */
export function getRecommendedCommunitiesFromAI(
  disorderPredictions: Record<string, boolean>
): string[] {
  const recommendedSlugs = new Set<string>();
  
  Object.entries(disorderPredictions).forEach(([disorder, hasCondition]) => {
    if (hasCondition && AI_DISORDER_TO_COMMUNITY_MAPPING[disorder]) {
      AI_DISORDER_TO_COMMUNITY_MAPPING[disorder].forEach(slug => {
        recommendedSlugs.add(slug);
      });
    }
  });
  
  return Array.from(recommendedSlugs);
}

/**
 * Helper function to get community recommendations with scores based on AI predictions
 * @param disorderPredictions - Object with disorder predictions (boolean values)
 * @returns Array of communities with compatibility scores
 */
export function getCommunityRecommendationsWithScores(
  disorderPredictions: Record<string, boolean>
): Array<{ slug: string; community: CommunityConfig; score: number }> {
  const scoreMap = new Map<string, number>();
  
  // Calculate scores based on disorder matches
  Object.entries(disorderPredictions).forEach(([disorder, hasCondition]) => {
    if (hasCondition && AI_DISORDER_TO_COMMUNITY_MAPPING[disorder]) {
      AI_DISORDER_TO_COMMUNITY_MAPPING[disorder].forEach((slug, index) => {
        // First community for a disorder gets higher score
        const baseScore = index === 0 ? 0.9 : 0.7;
        const currentScore = scoreMap.get(slug) || 0;
        scoreMap.set(slug, Math.max(currentScore, baseScore));
      });
    }
  });
  
  return Array.from(scoreMap.entries())
    .map(([slug, score]) => {
      const community = getCommunityBySlug(slug);
      return community ? { slug, community, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score) as Array<{ slug: string; community: CommunityConfig; score: number }>;
}