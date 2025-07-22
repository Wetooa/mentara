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

// Configuration constants - DEVELOPMENT SEEDING (BALANCED)
export const SEED_CONFIG = {
  USERS: {
    CLIENTS: 5, // Balanced for development - enough to test features
    THERAPISTS: 5, // Balanced for development - enough to test features  
    ADMINS: 5, // Balanced for development - enough to test features
    MODERATORS: 5, // Balanced for development - enough to test features
  },
  COMMUNITIES: {
    ADDITIONAL: 0, // No additional communities - only questionnaire-based ones
    POSTS_PER_COMMUNITY: 3, // Reduced to reasonable level - enough to see community activity
    COMMENTS_PER_POST: 3, // Reduced to reasonable level - enough for engagement testing
  },
  RELATIONSHIPS: {
    CLIENT_THERAPIST_RATIO: 0.6, // 60% of clients get therapists (3 out of 5) - realistic
    MEETINGS_PER_RELATIONSHIP: 2, // Reduced to 2 meetings per relationship - adequate for testing
  },
  ASSESSMENTS: {
    COMPLETION_RATE: 0.8, // 80% completion rate - good for testing
  },
  MESSAGING: {
    CONVERSATIONS_PER_RELATIONSHIP: 1, // Direct therapy conversations
    MESSAGES_PER_CONVERSATION: 8, // Reduced to 8 messages - enough to see conversation flow
    GROUP_CONVERSATIONS: 2, // Reduced to 2 group conversations - enough for testing
    SUPPORT_CONVERSATIONS: 1, // Single support conversation - adequate for testing
  },
  WORKSHEETS: {
    TEMPLATES: 4, // Reduced to 4 templates - good variety without overwhelm
    SUBMISSIONS_PER_RELATIONSHIP: 2, // Reduced to 2 submissions per relationship
    COMPLETION_RATE: 0.75, // 75% completion rate - realistic for testing
  },
  REVIEWS: {
    REVIEW_RATE: 0.6, // 60% of relationships get reviews - good for testing
    AVERAGE_RATING: 4.2, // Average therapist rating
    DETAILED_REVIEW_RATE: 0.8, // 80% of reviews include written feedback
  },
  SESSIONS: {
    SESSIONS_PER_RELATIONSHIP: 2, // Reduced to 2 sessions per relationship
    ACTIVITIES_PER_SESSION: 2, // Reduced to 2 activities per session
    PROGRESS_TRACKING_RATE: 0.7, // 70% tracking rate - good for testing
  },
  NOTIFICATIONS: {
    DEVICES_PER_USER: 1.0, // 1 device per user - keeps it simple
    NOTIFICATIONS_PER_USER: 3, // Reduced to 3 notifications per user - adequate for testing
    READ_RATE: 0.7, // 70% of notifications are read
  },
  THERAPIST_REQUESTS: {
    REQUEST_RATE: 0.4, // 40% of clients make therapist requests
    PENDING_RATE: 0.2, // 20% of requests are still pending
    PRIORITY_DISTRIBUTION: { high: 0.1, medium: 0.6, low: 0.3 },
  },
  AUDIT_LOGS: {
    COUNT: 15, // Reduced to 15 audit logs - enough for testing without overwhelm
    SUCCESS_RATE: 0.9, // 90% of actions are successful
    ADMIN_ACTION_RATE: 0.3, // 30% of logs are admin actions
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