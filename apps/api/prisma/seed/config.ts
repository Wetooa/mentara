/**
 * Seeding Configuration
 * 
 * Defines different seeding modes and their data volumes for various environments.
 */

export type SeedMode = 'light' | 'medium' | 'heavy';

export interface UserConfig {
  clients: number;
  therapists: number;
  admins: number;
  moderators: number;
}

export interface CommunityConfig {
  illnessBased: number; // Pre-defined mental health communities
  general: number;      // General support communities
  postsPerCommunity: number;
  membersPerCommunity: number;
}

export interface RelationshipConfig {
  clientTherapistRatio: number; // What percentage of clients get therapists
  communityMembershipRate: number; // What percentage of users join communities
  averageMembershipsPerUser: number;
}

export interface ContentConfig {
  postsPerUser: number;
  commentsPerPost: number;
  heartLikelihoodForPosts: number;
  heartLikelihoodForComments: number;
}

export interface TherapyConfig {
  meetingsPerRelationship: number;
  worksheetsPerRelationship: number;
  assessmentCompletionRate: number;
  sessionNotesRate: number;
  reviewRate: number; // What percentage of relationships get reviews
}

export interface SeedConfiguration {
  users: UserConfig;
  communities: CommunityConfig;
  relationships: RelationshipConfig;
  content: ContentConfig;
  therapy: TherapyConfig;
}

/**
 * Light Mode - Minimal data for quick development setup
 * Fast to seed, enough data to test basic features
 */
const LIGHT_CONFIG: SeedConfiguration = {
  users: {
    clients: 8,
    therapists: 4,
    admins: 2,
    moderators: 2,
  },
  communities: {
    illnessBased: 5,  // Just the most common conditions
    general: 2,
    postsPerCommunity: 3,
    membersPerCommunity: 4,
  },
  relationships: {
    clientTherapistRatio: 0.5, // Half the clients get therapists
    communityMembershipRate: 0.7,
    averageMembershipsPerUser: 2,
  },
  content: {
    postsPerUser: 1,
    commentsPerPost: 2,
    heartLikelihoodForPosts: 0.3,
    heartLikelihoodForComments: 0.2,
  },
  therapy: {
    meetingsPerRelationship: 3,
    worksheetsPerRelationship: 2,
    assessmentCompletionRate: 0.6,
    sessionNotesRate: 0.5,
    reviewRate: 0.4,
  },
};

/**
 * Medium Mode - Balanced data for feature testing
 * Good for testing all features with realistic interactions
 */
const MEDIUM_CONFIG: SeedConfiguration = {
  users: {
    clients: 25,
    therapists: 12,
    admins: 4,
    moderators: 4,
  },
  communities: {
    illnessBased: 10,
    general: 5,
    postsPerCommunity: 8,
    membersPerCommunity: 12,
  },
  relationships: {
    clientTherapistRatio: 0.7,
    communityMembershipRate: 0.8,
    averageMembershipsPerUser: 3,
  },
  content: {
    postsPerUser: 2,
    commentsPerPost: 4,
    heartLikelihoodForPosts: 0.4,
    heartLikelihoodForComments: 0.3,
  },
  therapy: {
    meetingsPerRelationship: 6,
    worksheetsPerRelationship: 4,
    assessmentCompletionRate: 0.8,
    sessionNotesRate: 0.7,
    reviewRate: 0.6,
  },
};

/**
 * Heavy Mode - Rich data for demos and comprehensive testing
 * Slower to seed but provides realistic usage patterns
 */
const HEAVY_CONFIG: SeedConfiguration = {
  users: {
    clients: 80,
    therapists: 25,
    admins: 6,
    moderators: 8,
  },
  communities: {
    illnessBased: 15,
    general: 8,
    postsPerCommunity: 15,
    membersPerCommunity: 25,
  },
  relationships: {
    clientTherapistRatio: 0.75,
    communityMembershipRate: 0.85,
    averageMembershipsPerUser: 4,
  },
  content: {
    postsPerUser: 3,
    commentsPerPost: 6,
    heartLikelihoodForPosts: 0.5,
    heartLikelihoodForComments: 0.4,
  },
  therapy: {
    meetingsPerRelationship: 10,
    worksheetsPerRelationship: 7,
    assessmentCompletionRate: 0.85,
    sessionNotesRate: 0.8,
    reviewRate: 0.7,
  },
};

export const SEED_CONFIG: Record<SeedMode, SeedConfiguration> = {
  light: LIGHT_CONFIG,
  medium: MEDIUM_CONFIG,
  heavy: HEAVY_CONFIG,
};

/**
 * Default password for all test accounts
 * In production, this would be properly hashed
 */
export const DEFAULT_PASSWORD = 'password123';

/**
 * Mental health communities based on assessment disorders
 * These align with the questionnaire mapping from the client
 * 
 * UPDATED: Now uses centralized canonical community definitions
 */
import { getAllCanonicalCommunities, GENERAL_COMMUNITIES as CANONICAL_GENERAL_COMMUNITIES } from '../../src/common/constants/communities';

export const MENTAL_HEALTH_COMMUNITIES = getAllCanonicalCommunities().map(community => ({
  name: community.name,
  slug: community.slug,
  description: community.description,
  imageUrl: community.imageUrl,
}));

/**
 * General support communities not tied to specific conditions
 */
export const GENERAL_COMMUNITIES = CANONICAL_GENERAL_COMMUNITIES.map(community => ({
  name: community.name,
  slug: community.slug,
  description: community.description,
  imageUrl: community.imageUrl,
}));

/**
 * Worksheet templates for therapy assignments
 */
export const WORKSHEET_TEMPLATES = [
  {
    title: 'Daily Mood Tracker',
    description: 'Track your mood patterns and triggers throughout the day',
    category: 'Mood Monitoring',
    estimatedDuration: 10,
  },
  {
    title: 'Cognitive Behavioral Thought Record',
    description: 'Identify and challenge negative thought patterns using CBT techniques',
    category: 'Cognitive Therapy',
    estimatedDuration: 20,
  },
  {
    title: 'Anxiety Exposure Hierarchy',
    description: 'Create a step-by-step plan for facing anxiety-provoking situations',
    category: 'Anxiety Management',
    estimatedDuration: 30,
  },
  {
    title: 'Gratitude and Positive Events Log',
    description: 'Daily practice of gratitude and positive experience reflection',
    category: 'Positive Psychology',
    estimatedDuration: 15,
  },
  {
    title: 'Sleep Hygiene Assessment',
    description: 'Evaluate and improve your sleep habits and environment',
    category: 'Sleep Health',
    estimatedDuration: 25,
  },
  {
    title: 'Mindfulness Body Scan Practice',
    description: 'Guided mindfulness exercise for body awareness and relaxation',
    category: 'Mindfulness',
    estimatedDuration: 25,
  },
  {
    title: 'Values Clarification Exercise',
    description: 'Identify your core values and align your actions with them',
    category: 'Life Purpose',
    estimatedDuration: 35,
  },
];

/**
 * Session activity types for therapy meetings
 */
export const SESSION_ACTIVITIES = [
  'Check-in and mood assessment',
  'Review of homework assignments',
  'Cognitive restructuring exercises',
  'Mindfulness and breathing techniques',
  'Behavioral activation planning',
  'Exposure therapy practice',
  'Communication skills training',
  'Problem-solving strategies',
  'Relapse prevention planning',
  'Goal setting and progress review',
  'Psychoeducation on mental health',
  'Emotion regulation techniques',
  'Trauma processing work',
  'Values exploration',
  'Coping skills development',
];