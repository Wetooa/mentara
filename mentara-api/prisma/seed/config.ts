// Seed Configuration Constants
// Centralized configuration for database seeding

// Test accounts from test-accounts.md
export const TEST_ACCOUNTS = {
  CLIENTS: [
    {
      id: 'fake_client_test_1',
      email: 'test.client.basic@mentaratest.dev',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'client' as const,
    },
    {
      id: 'fake_client_test_2',
      email: 'test.client.complete@mentaratest.dev',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      role: 'client' as const,
    },
    {
      id: 'fake_client_test_3',
      email: 'test.client.inactive@mentaratest.dev',
      firstName: 'Jennifer',
      lastName: 'Chen',
      role: 'client' as const,
      isActive: false,
    },
    {
      id: 'fake_client_test_4',
      email: 'test.client.premium@mentaratest.dev',
      firstName: 'David',
      lastName: 'Kim',
      role: 'client' as const,
    },
    {
      id: 'fake_client_test_5',
      email: 'test.client.longterm@mentaratest.dev',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      role: 'client' as const,
    },
  ],
  THERAPISTS: [
    {
      id: 'fake_therapist_test_1',
      email: 'test.therapist.approved@mentaratest.dev',
      firstName: 'Dr. Michael',
      lastName: 'Thompson',
      role: 'therapist' as const,
    },
    {
      id: 'fake_therapist_test_2',
      email: 'test.therapist.pending@mentaratest.dev',
      firstName: 'Dr. Lisa',
      lastName: 'Park',
      role: 'therapist' as const,
    },
    {
      id: 'fake_therapist_test_3',
      email: 'test.therapist.specialist@mentaratest.dev',
      firstName: 'Dr. Amanda',
      lastName: 'Williams',
      role: 'therapist' as const,
    },
    {
      id: 'fake_therapist_test_4',
      email: 'test.therapist.trauma@mentaratest.dev',
      firstName: 'Dr. James',
      lastName: 'O\'Connor',
      role: 'therapist' as const,
    },
    {
      id: 'fake_therapist_test_5',
      email: 'test.therapist.anxiety@mentaratest.dev',
      firstName: 'Dr. Emily',
      lastName: 'Zhang',
      role: 'therapist' as const,
    },
  ],
  ADMINS: [
    {
      id: 'fake_admin_test_1',
      email: 'test.admin.super@mentaratest.dev',
      firstName: 'Robert',
      lastName: 'Anderson',
      role: 'admin' as const,
    },
    {
      id: 'fake_admin_test_2',
      email: 'test.admin.user.manager@mentaratest.dev',
      firstName: 'Linda',
      lastName: 'Martinez',
      role: 'admin' as const,
    },
    {
      id: 'fake_admin_test_3',
      email: 'test.admin.content.manager@mentaratest.dev',
      firstName: 'William',
      lastName: 'Johnson',
      role: 'admin' as const,
    },
    {
      id: 'fake_admin_test_4',
      email: 'test.admin.billing@mentaratest.dev',
      firstName: 'Nancy',
      lastName: 'Wilson',
      role: 'admin' as const,
    },
    {
      id: 'fake_admin_test_5',
      email: 'test.admin.technical@mentaratest.dev',
      firstName: 'Kevin',
      lastName: 'Lee',
      role: 'admin' as const,
    },
  ],
  MODERATORS: [
    {
      id: 'fake_moderator_test_1',
      email: 'test.moderator.primary@mentaratest.dev',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'moderator' as const,
    },
    {
      id: 'fake_moderator_test_2',
      email: 'test.moderator.community@mentaratest.dev',
      firstName: 'Taylor',
      lastName: 'Davis',
      role: 'moderator' as const,
    },
    {
      id: 'fake_moderator_test_3',
      email: 'test.moderator.content@mentaratest.dev',
      firstName: 'Jordan',
      lastName: 'Smith',
      role: 'moderator' as const,
    },
    {
      id: 'fake_moderator_test_4',
      email: 'test.moderator.support@mentaratest.dev',
      firstName: 'Casey',
      lastName: 'Brown',
      role: 'moderator' as const,
    },
    {
      id: 'fake_moderator_test_5',
      email: 'test.moderator.night@mentaratest.dev',
      firstName: 'Avery',
      lastName: 'White',
      role: 'moderator' as const,
    },
  ],
};

// Configuration constants - COMPREHENSIVE DEV SEEDING
export const SEED_CONFIG = {
  USERS: {
    CLIENTS: 5, // 5 clients for comprehensive testing
    THERAPISTS: 5, // 5 therapists for comprehensive testing
    ADMINS: 5, // 5 admins for comprehensive testing
    MODERATORS: 5, // 5 moderators for comprehensive testing
  },
  COMMUNITIES: {
    ADDITIONAL: 3, // 3 communities total
    POSTS_PER_COMMUNITY: 0, // Skip posts for ultra-fast seeding
    COMMENTS_PER_POST: 0, // Skip comments for ultra-fast seeding
  },
  RELATIONSHIPS: {
    CLIENT_THERAPIST_RATIO: 0.8, // 80% of clients get assigned to therapists
    MEETINGS_PER_RELATIONSHIP: 1, // Reduced from 3 for testing
  },
  ASSESSMENTS: {
    COMPLETION_RATE: 0.8, // 80% of clients complete pre-assessments
  },
  MESSAGING: {
    CONVERSATIONS_PER_RELATIONSHIP: 1, // Direct therapy conversations
    MESSAGES_PER_CONVERSATION: 3, // Reduced from 15 for testing
    GROUP_CONVERSATIONS: 1, // Reduced from 3 for testing
    SUPPORT_CONVERSATIONS: 1, // Reduced from 2 for testing
  },
  WORKSHEETS: {
    TEMPLATES: 3, // Reduced from 10 for testing
    SUBMISSIONS_PER_RELATIONSHIP: 1, // Reduced from 3 for testing
    COMPLETION_RATE: 0.75, // 75% completion rate for assigned worksheets
  },
  REVIEWS: {
    REVIEW_RATE: 0.6, // 60% of completed relationships get reviews
    AVERAGE_RATING: 4.2, // Average therapist rating
    DETAILED_REVIEW_RATE: 0.8, // 80% of reviews include written feedback
  },
  SESSIONS: {
    SESSIONS_PER_RELATIONSHIP: 1, // Further reduced for testing
    ACTIVITIES_PER_SESSION: 1, // Further reduced for testing
    PROGRESS_TRACKING_RATE: 0.5, // Reduced to 50% for testing
  },
  NOTIFICATIONS: {
    DEVICES_PER_USER: 1.0, // Reduced from 1.3 for testing
    NOTIFICATIONS_PER_USER: 1, // Ultra-minimal for testing
    READ_RATE: 0.7, // 70% of notifications are read
  },
  THERAPIST_REQUESTS: {
    REQUEST_RATE: 0.4, // 40% of clients make additional therapist requests
    PENDING_RATE: 0.2, // 20% of requests are still pending
    PRIORITY_DISTRIBUTION: { high: 0.1, medium: 0.6, low: 0.3 },
  },
  AUDIT_LOGS: {
    COUNT: 5, // Ultra-minimal for testing
    SUCCESS_RATE: 0.95, // 95% of actions are successful
    ADMIN_ACTION_RATE: 0.3, // 30% of logs are admin actions
  },
};

// Illness communities configuration - ULTRA-FAST DEV VERSION
export const ILLNESS_COMMUNITIES = [
  {
    name: 'ADHD Support',
    slug: 'adhd-support',
    description: 'A supportive community for individuals with ADHD.',
  },
  {
    name: 'Anxiety Support',
    slug: 'anxiety-support',
    description: 'A supportive community for individuals with anxiety.',
  },
  {
    name: 'Depression Support',
    slug: 'depression-support',
    description: 'A supportive community for individuals with depression.',
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