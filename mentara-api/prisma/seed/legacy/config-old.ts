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
 */
export const MENTAL_HEALTH_COMMUNITIES = [
  {
    name: 'General Support',
    slug: 'general-support',
    description: 'A welcoming community for general mental health support and discussion.',
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400',
  },
  {
    name: 'Anxiety Support',
    slug: 'anxiety-support', 
    description: 'A supportive community for individuals managing anxiety disorders.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda450fbb2?w=400',
  },
  {
    name: 'Depression Support',
    slug: 'depression-support',
    description: 'A supportive community for individuals working through depression.',
    imageUrl: 'https://images.unsplash.com/photo-1517949908114-71669a64d885?w=400',
  },
  {
    name: 'Stress Management',
    slug: 'stress-management',
    description: 'Community focused on healthy stress management and coping strategies.',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
  },
  {
    name: 'Sleep & Insomnia Support',
    slug: 'sleep-insomnia-support',
    description: 'Support for those struggling with sleep disorders and insomnia.',
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
  },
  {
    name: 'PTSD & Trauma Recovery',
    slug: 'ptsd-trauma-recovery',
    description: 'A safe space for trauma survivors and PTSD recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
  },
  {
    name: 'Bipolar Support',
    slug: 'bipolar-support',
    description: 'Community for individuals managing bipolar disorder.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  },
  {
    name: 'OCD Support',
    slug: 'ocd-support',
    description: 'Support community for obsessive-compulsive disorder.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  },
  {
    name: 'Social Anxiety',
    slug: 'social-anxiety',
    description: 'Community for those working through social anxiety challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=400',
  },
  {
    name: 'Panic Disorder Support',
    slug: 'panic-disorder-support',
    description: 'Support for individuals experiencing panic attacks and panic disorder.',
    imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
  },
  {
    name: 'ADHD Support',
    slug: 'adhd-support',
    description: 'Community for individuals with ADHD and attention challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=400',
  },
  {
    name: 'Eating Disorder Recovery',
    slug: 'eating-disorder-recovery',
    description: 'Supportive community for eating disorder recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda450fbb2?w=400',
  },
  {
    name: 'Substance Recovery',
    slug: 'substance-recovery',
    description: 'Support community for substance use recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
  },
  {
    name: 'Phobia Support',
    slug: 'phobia-support',
    description: 'Community for individuals working through specific phobias.',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
  },
  {
    name: 'Burnout Recovery',
    slug: 'burnout-recovery',
    description: 'Support for those recovering from professional and personal burnout.',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  },
];

/**
 * General support communities not tied to specific conditions
 */
export const GENERAL_COMMUNITIES = [
  {
    name: 'Mindfulness & Meditation',
    slug: 'mindfulness-meditation',
    description: 'Share mindfulness practices and meditation techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda450fbb2?w=400',
  },
  {
    name: 'Family & Relationships',
    slug: 'family-relationships',
    description: 'Support for navigating family dynamics and relationship challenges.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400',
  },
  {
    name: 'Young Adults (18-25)',
    slug: 'young-adults',
    description: 'Mental health support specifically for young adults.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400',
  },
  {
    name: 'Parents & Caregivers',
    slug: 'parents-caregivers',
    description: 'Support for parents and caregivers managing their mental health.',
    imageUrl: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400',
  },
  {
    name: 'Workplace Mental Health',
    slug: 'workplace-mental-health',
    description: 'Discussing mental health challenges in professional settings.',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
  },
  {
    name: 'LGBTQ+ Support',
    slug: 'lgbtq-support',
    description: 'Mental health support for LGBTQ+ individuals.',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
  },
  {
    name: 'Seniors (65+)',
    slug: 'seniors-support',
    description: 'Mental health support tailored for senior adults.',
    imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400',
  },
  {
    name: 'Creative Expression',
    slug: 'creative-expression',
    description: 'Using art, music, and creativity for mental health.',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
  },
];

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