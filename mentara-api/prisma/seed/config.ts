// Seed Configuration Constants
// Centralized configuration for database seeding

// Test accounts from test-accounts.md
// ALL TEST ACCOUNTS USE PASSWORD: "password123" for easy testing
export const TEST_ACCOUNTS = {
  CLIENTS: [
    {
      email: 'test.client.basic@mentaratest.dev',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'client' as const,
    },
    {
      email: 'test.client.complete@mentaratest.dev',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      role: 'client' as const,
    },
    {
      email: 'test.client.inactive@mentaratest.dev',
      firstName: 'Jennifer',
      lastName: 'Chen',
      role: 'client' as const,
      isActive: false,
    },
    {
      email: 'test.client.premium@mentaratest.dev',
      firstName: 'David',
      lastName: 'Kim',
      role: 'client' as const,
    },
    {
      email: 'test.client.longterm@mentaratest.dev',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      role: 'client' as const,
    },
  ],
  THERAPISTS: [
    {
      email: 'test.therapist.approved@mentaratest.dev',
      firstName: 'Dr. Michael',
      lastName: 'Thompson',
      role: 'therapist' as const,
    },
    {
      email: 'test.therapist.pending@mentaratest.dev',
      firstName: 'Dr. Lisa',
      lastName: 'Park',
      role: 'therapist' as const,
    },
    {
      email: 'test.therapist.specialist@mentaratest.dev',
      firstName: 'Dr. Amanda',
      lastName: 'Williams',
      role: 'therapist' as const,
    },
    {
      email: 'test.therapist.trauma@mentaratest.dev',
      firstName: 'Dr. James',
      lastName: 'O\'Connor',
      role: 'therapist' as const,
    },
    {
      email: 'test.therapist.anxiety@mentaratest.dev',
      firstName: 'Dr. Emily',
      lastName: 'Zhang',
      role: 'therapist' as const,
    },
  ],
  ADMINS: [
    {
      email: 'test.admin.super@mentaratest.dev',
      firstName: 'Robert',
      lastName: 'Anderson',
      role: 'admin' as const,
    },
    {
      email: 'test.admin.user.manager@mentaratest.dev',
      firstName: 'Linda',
      lastName: 'Martinez',
      role: 'admin' as const,
    },
    {
      email: 'test.admin.content.manager@mentaratest.dev',
      firstName: 'William',
      lastName: 'Johnson',
      role: 'admin' as const,
    },
    {
      email: 'test.admin.billing@mentaratest.dev',
      firstName: 'Nancy',
      lastName: 'Wilson',
      role: 'admin' as const,
    },
    {
      email: 'test.admin.technical@mentaratest.dev',
      firstName: 'Kevin',
      lastName: 'Lee',
      role: 'admin' as const,
    },
  ],
  MODERATORS: [
    {
      email: 'test.moderator.primary@mentaratest.dev',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'moderator' as const,
    },
    {
      email: 'test.moderator.community@mentaratest.dev',
      firstName: 'Taylor',
      lastName: 'Davis',
      role: 'moderator' as const,
    },
    {
      email: 'test.moderator.content@mentaratest.dev',
      firstName: 'Jordan',
      lastName: 'Smith',
      role: 'moderator' as const,
    },
    {
      email: 'test.moderator.support@mentaratest.dev',
      firstName: 'Casey',
      lastName: 'Brown',
      role: 'moderator' as const,
    },
    {
      email: 'test.moderator.night@mentaratest.dev',
      firstName: 'Avery',
      lastName: 'White',
      role: 'moderator' as const,
    },
  ],
};

// Configuration constants - COMPREHENSIVE DEV SEEDING (ENHANCED)
export const SEED_CONFIG = {
  USERS: {
    CLIENTS: 75, // Increased from 5 to 75 for realistic testing
    THERAPISTS: 35, // Increased from 5 to 35 for realistic testing
    ADMINS: 8, // Increased from 5 to 8 for comprehensive testing
    MODERATORS: 12, // Increased from 5 to 12 for comprehensive testing
  },
  COMMUNITIES: {
    ADDITIONAL: 0, // No additional communities - only questionnaire-based ones
    POSTS_PER_COMMUNITY: 15, // Increased from 3 to 15 for active communities
    COMMENTS_PER_POST: 8, // Increased from 3 to 8 for realistic engagement
  },
  RELATIONSHIPS: {
    CLIENT_THERAPIST_RATIO: 0.85, // Increased from 0.8 to 85% assignment rate
    MEETINGS_PER_RELATIONSHIP: 4, // Increased from 1 to 4 meetings per relationship
  },
  ASSESSMENTS: {
    COMPLETION_RATE: 0.85, // Increased from 0.8 to 85% completion rate
  },
  MESSAGING: {
    CONVERSATIONS_PER_RELATIONSHIP: 1, // Direct therapy conversations
    MESSAGES_PER_CONVERSATION: 25, // Increased from 3 to 25 for realistic chat history
    GROUP_CONVERSATIONS: 5, // Increased from 1 to 5 for community engagement
    SUPPORT_CONVERSATIONS: 3, // Increased from 1 to 3 for support channels
  },
  WORKSHEETS: {
    TEMPLATES: 8, // Increased from 3 to 8 for comprehensive therapy tools
    SUBMISSIONS_PER_RELATIONSHIP: 3, // Increased from 1 to 3 submissions per relationship
    COMPLETION_RATE: 0.80, // Increased from 0.75 to 80% completion rate
  },
  REVIEWS: {
    REVIEW_RATE: 0.70, // Increased from 0.6 to 70% review rate
    AVERAGE_RATING: 4.3, // Slightly increased average rating
    DETAILED_REVIEW_RATE: 0.85, // Increased from 0.8 to 85% detailed reviews
  },
  SESSIONS: {
    SESSIONS_PER_RELATIONSHIP: 4, // Increased from 1 to 4 sessions per relationship
    ACTIVITIES_PER_SESSION: 3, // Increased from 1 to 3 activities per session
    PROGRESS_TRACKING_RATE: 0.75, // Increased from 0.5 to 75% tracking rate
  },
  NOTIFICATIONS: {
    DEVICES_PER_USER: 1.5, // Increased from 1.0 to 1.5 devices per user
    NOTIFICATIONS_PER_USER: 12, // Increased from 1 to 12 notifications per user
    READ_RATE: 0.75, // Increased from 0.7 to 75% read rate
  },
  THERAPIST_REQUESTS: {
    REQUEST_RATE: 0.5, // Increased from 0.4 to 50% request rate
    PENDING_RATE: 0.25, // Increased from 0.2 to 25% pending rate
    PRIORITY_DISTRIBUTION: { high: 0.15, medium: 0.65, low: 0.20 },
  },
  AUDIT_LOGS: {
    COUNT: 50, // Increased from 5 to 50 for realistic audit trail
    SUCCESS_RATE: 0.96, // Slightly increased success rate
    ADMIN_ACTION_RATE: 0.35, // Increased from 0.3 to 35% admin actions
  },
};
// Illness communities configuration - Based on questionnaire disorders
// These match the exact disorders from @mentara-commons/src/constants/questionnaire/questionnaire-mapping.ts
export const ILLNESS_COMMUNITIES = [
  {
    name: 'Stress Support',
    slug: 'stress-support',
    description: 'A supportive community for individuals managing stress and overwhelm.',
  },
  {
    name: 'Anxiety Support',
    slug: 'anxiety-support',
    description: 'A supportive community for individuals with anxiety disorders.',
  },
  {
    name: 'Depression Support',
    slug: 'depression-support',
    description: 'A supportive community for individuals with depression.',
  },
  {
    name: 'Insomnia Support',
    slug: 'insomnia-support',
    description: 'A supportive community for individuals struggling with sleep disorders.',
  },
  {
    name: 'Panic Disorder Support',
    slug: 'panic-disorder-support',
    description: 'A supportive community for individuals with panic disorder.',
  },
  {
    name: 'Bipolar Disorder Support',
    slug: 'bipolar-disorder-support',
    description: 'A supportive community for individuals with bipolar disorder (BD).',
  },
  {
    name: 'OCD Support',
    slug: 'ocd-support',
    description: 'A supportive community for individuals with obsessive compulsive disorder.',
  },
  {
    name: 'PTSD Support',
    slug: 'ptsd-support',
    description: 'A supportive community for individuals with post-traumatic stress disorder.',
  },
  {
    name: 'Social Anxiety Support',
    slug: 'social-anxiety-support',
    description: 'A supportive community for individuals with social anxiety.',
  },
  {
    name: 'Phobia Support',
    slug: 'phobia-support',
    description: 'A supportive community for individuals with phobias and specific fears.',
  },
  {
    name: 'Burnout Support',
    slug: 'burnout-support',
    description: 'A supportive community for individuals experiencing burnout.',
  },
  {
    name: 'Eating Disorders Support',
    slug: 'eating-disorders-support',
    description: 'A supportive community for individuals with binge eating and eating disorders.',
  },
  {
    name: 'ADHD Support',
    slug: 'adhd-support',
    description: 'A supportive community for individuals with ADD/ADHD.',
  },
  {
    name: 'Substance Use Support',
    slug: 'substance-use-support',
    description: 'A supportive community for individuals with substance or alcohol use issues.',
  },
];

// Additional communities for comprehensive seeding
export const ADDITIONAL_COMMUNITIES = [
  {
    name: 'General Support',
    slug: 'general-support',
    description: 'A welcoming space for anyone seeking general mental health support.',
  },
  {
    name: 'Mindfulness & Meditation',
    slug: 'mindfulness-meditation',
    description: 'Share mindfulness practices and meditation techniques.',
  },
  {
    name: 'Family & Relationships',
    slug: 'family-relationships',
    description: 'Support for navigating family dynamics and relationship challenges.',
  },
];

// Worksheet templates for therapy assignments
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
    title: 'Relationship Patterns Worksheet',
    description: 'Explore patterns in your relationships and communication styles',
    category: 'Relationship Therapy',
    estimatedDuration: 40,
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
  {
    title: 'Trauma Narrative Timeline',
    description: 'Safe exploration of trauma experiences with professional guidance',
    category: 'Trauma Recovery',
    estimatedDuration: 45,
  },
  {
    title: 'Addiction Recovery Relapse Prevention Plan',
    description: 'Develop strategies and warning signs for maintaining sobriety',
    category: 'Addiction Recovery',
    estimatedDuration: 50,
  },
];

// Common therapy session activities
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

// Notification types for the platform
export const NOTIFICATION_TYPES = [
  'NEW_MESSAGE',
  'APPOINTMENT_REMINDER',
  'WORKSHEET_ASSIGNED',
  'SESSION_SCHEDULED',
  'THERAPIST_APPROVED',
  'COMMUNITY_POST_LIKED',
  'ASSESSMENT_DUE',
  'PROGRESS_MILESTONE',
  'PAYMENT_REMINDER',
  'SYSTEM_ANNOUNCEMENT',
];

// All configurations are already exported above with 'export const'