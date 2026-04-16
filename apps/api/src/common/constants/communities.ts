/**
 * Standardized Community Definitions
 * 
 * This file defines the canonical community configurations that align perfectly
 * with the questionnaire system. Each community corresponds to a specific disorder
 * assessment, ensuring perfect data integrity between AI recommendations and
 * database seeding.
 */

import { 
  CANONICAL_QUESTIONNAIRE_IDS, 
  CanonicalQuestionnaireId, 
  QUESTIONNAIRE_DISPLAY_NAMES 
} from './disorders';

export interface CommunityDefinition {
  id: CanonicalQuestionnaireId;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  category: 'mental-health' | 'general';
}

/**
 * Canonical community definitions based on questionnaire system.
 * Each community slug is derived from the questionnaire ID to ensure consistency.
 */
export const CANONICAL_COMMUNITIES: Record<CanonicalQuestionnaireId, CommunityDefinition> = {
  'stress': {
    id: 'stress',
    name: 'Stress Support Community',
    slug: 'stress-support',
    description: 'A supportive community for people dealing with stress, pressure, and life challenges. Share coping strategies and find understanding.',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
    category: 'mental-health'
  },
  
  'anxiety': {
    id: 'anxiety',
    name: 'Anxiety Warriors',
    slug: 'anxiety-warriors',
    description: 'A safe space for individuals with anxiety disorders. Connect with others who understand the challenges of living with anxiety.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda450fbb2?w=400',
    category: 'mental-health'
  },

  'depression': {
    id: 'depression',
    name: 'Depression Support Network',
    slug: 'depression-support',
    description: 'A compassionate community for those dealing with depression. Find hope, support, and understanding from people who care.',
    imageUrl: 'https://images.unsplash.com/photo-1517949908114-71669a64d885?w=400',
    category: 'mental-health'
  },

  'drug-abuse': {
    id: 'drug-abuse',
    name: 'Substance Recovery Support',
    slug: 'substance-recovery-support', 
    description: 'A supportive community for individuals dealing with substance use issues. Find recovery, healing, and hope.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    category: 'mental-health'
  },

  'insomnia': {
    id: 'insomnia',
    name: 'Sleep & Insomnia Support',
    slug: 'insomnia-support',
    description: 'A community for people struggling with sleep issues and insomnia. Share tips and find solutions for better sleep.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
    category: 'mental-health'
  },

  'panic-disorder': {
    id: 'panic-disorder',
    name: 'Panic Disorder Support',
    slug: 'panic-disorder-support',
    description: 'A supportive community for individuals with panic disorder. Learn coping strategies and find understanding.',
    imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
    category: 'mental-health'
  },

  'mood-disorder': {
    id: 'mood-disorder',
    name: 'Bipolar Support Circle', 
    slug: 'bipolar-support',
    description: 'A community for individuals with bipolar disorder and their loved ones. Share experiences and find support.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    category: 'mental-health'
  },

  'obsessional-compulsive': {
    id: 'obsessional-compulsive',
    name: 'OCD Support Community',
    slug: 'ocd-support',
    description: 'A safe space for individuals with obsessive-compulsive disorder. Connect with others who understand OCD challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    category: 'mental-health'
  },

  'ptsd': {
    id: 'ptsd',
    name: 'PTSD Support Network',
    slug: 'ptsd-support',
    description: 'A compassionate community for individuals with post-traumatic stress disorder. Find healing and support.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    category: 'mental-health'
  },

  'social-phobia': {
    id: 'social-phobia',
    name: 'Social Anxiety Support',
    slug: 'social-anxiety-support',
    description: 'A community for people with social anxiety. Build confidence and find understanding from others who share similar experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=400',
    category: 'mental-health'
  },

  'phobia': {
    id: 'phobia',
    name: 'Phobia Support Group',
    slug: 'phobia-support',
    description: 'A supportive community for individuals dealing with specific phobias. Face fears together and find coping strategies.',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    category: 'mental-health'
  },

  'burnout': {
    id: 'burnout',
    name: 'Burnout Recovery',
    slug: 'burnout-recovery',
    description: 'A community for people experiencing burnout and work-related stress. Find balance and recovery strategies.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    category: 'mental-health'
  },

  'binge-eating': {
    id: 'binge-eating', 
    name: 'Eating Disorder Recovery',
    slug: 'eating-disorder-recovery',
    description: 'A supportive community for individuals with eating disorders. Find healing, understanding, and recovery support.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda450fbb2?w=400',
    category: 'mental-health'
  },

  'adhd': {
    id: 'adhd',
    name: 'ADHD Support Community',
    slug: 'adhd-support',
    description: 'A community for individuals with ADHD/ADD. Share strategies, experiences, and find understanding.',
    imageUrl: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=400',
    category: 'mental-health'
  },

  'alcohol': {
    id: 'alcohol',
    name: 'Alcohol Recovery Support',
    slug: 'alcohol-recovery-support',
    description: 'A supportive community for individuals dealing with alcohol use issues. Find recovery and healing.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
    category: 'mental-health'
  }
};

/**
 * Get all canonical communities as an array
 */
export function getAllCanonicalCommunities(): CommunityDefinition[] {
  return CANONICAL_QUESTIONNAIRE_IDS.map(id => CANONICAL_COMMUNITIES[id]);
}

/**
 * Get community definition by questionnaire ID
 */
export function getCommunityByQuestionnaireId(id: CanonicalQuestionnaireId): CommunityDefinition {
  return CANONICAL_COMMUNITIES[id];
}

/**
 * Get community definition by slug
 */
export function getCommunityBySlug(slug: string): CommunityDefinition | undefined {
  return getAllCanonicalCommunities().find(community => community.slug === slug);
}

/**
 * Get all community slugs
 */
export function getAllCommunitySlugs(): string[] {
  return getAllCanonicalCommunities().map(community => community.slug);
}

/**
 * Map questionnaire ID to community slug (for AI recommendations)
 */
export function getSlugForQuestionnaireId(id: CanonicalQuestionnaireId): string {
  return CANONICAL_COMMUNITIES[id].slug;
}

/**
 * Additional general communities (not tied to specific assessments)
 */
export const GENERAL_COMMUNITIES: CommunityDefinition[] = [
  {
    id: 'stress', // Use stress as fallback category
    name: 'Mindfulness & Meditation',
    slug: 'mindfulness-meditation',
    description: 'Share mindfulness practices and meditation techniques for mental wellness.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda450fbb2?w=400',
    category: 'general'
  },
  {
    id: 'anxiety', // Use anxiety as fallback category
    name: 'Family & Relationships',
    slug: 'family-relationships', 
    description: 'Support for navigating family dynamics and relationship challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400',
    category: 'general'
  },
  {
    id: 'depression', // Use depression as fallback category
    name: 'Young Adults (18-25)',
    slug: 'young-adults',
    description: 'Mental health support specifically for young adults navigating life transitions.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
    category: 'general'
  }
];