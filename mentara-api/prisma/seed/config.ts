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
  ],
};

// Configuration constants
export const SEED_CONFIG = {
  USERS: {
    CLIENTS: 50,
    THERAPISTS: 15,
    ADMINS: 2,
    MODERATORS: 3,
  },
  COMMUNITIES: {
    ADDITIONAL: 5, // Additional to illness communities
    POSTS_PER_COMMUNITY: 8,
    COMMENTS_PER_POST: 4,
  },
  RELATIONSHIPS: {
    CLIENT_THERAPIST_RATIO: 0.7, // 70% of clients get assigned to therapists
    MEETINGS_PER_RELATIONSHIP: 3,
  },
  ASSESSMENTS: {
    COMPLETION_RATE: 0.8, // 80% of clients complete pre-assessments
  },
  MESSAGING: {
    CONVERSATIONS_PER_RELATIONSHIP: 1, // Direct therapy conversations
    MESSAGES_PER_CONVERSATION: 15, // Average messages in therapy conversations
    GROUP_CONVERSATIONS: 3, // Number of group support conversations
    SUPPORT_CONVERSATIONS: 2, // Number of community support conversations
  },
  WORKSHEETS: {
    TEMPLATES: 10, // Number of worksheet templates to create
    SUBMISSIONS_PER_RELATIONSHIP: 3, // Average submissions per client-therapist pair
    COMPLETION_RATE: 0.75, // 75% completion rate for assigned worksheets
  },
  REVIEWS: {
    REVIEW_RATE: 0.6, // 60% of completed relationships get reviews
    AVERAGE_RATING: 4.2, // Average therapist rating
    DETAILED_REVIEW_RATE: 0.8, // 80% of reviews include written feedback
  },
  SESSIONS: {
    SESSIONS_PER_RELATIONSHIP: 5, // Average therapy sessions per relationship
    ACTIVITIES_PER_SESSION: 3, // Activities tracked per session
    PROGRESS_TRACKING_RATE: 0.9, // 90% of sessions have progress records
  },
  NOTIFICATIONS: {
    DEVICES_PER_USER: 1.3, // Average devices per user (some have multiple)
    NOTIFICATIONS_PER_USER: 12, // Average notifications per user
    READ_RATE: 0.7, // 70% of notifications are read
  },
  THERAPIST_REQUESTS: {
    REQUEST_RATE: 0.4, // 40% of clients make additional therapist requests
    PENDING_RATE: 0.2, // 20% of requests are still pending
    PRIORITY_DISTRIBUTION: { high: 0.1, medium: 0.6, low: 0.3 },
  },
  AUDIT_LOGS: {
    COUNT: 500, // Number of audit log entries to generate
    SUCCESS_RATE: 0.95, // 95% of actions are successful
    ADMIN_ACTION_RATE: 0.3, // 30% of logs are admin actions
  },
};

// Illness communities configuration (using new questionnaire constants)
export const ILLNESS_COMMUNITIES = [
  {
    name: 'ADHD Support',
    slug: 'adhd-support',
    description: 'A supportive community for individuals with ADHD to share experiences, coping strategies, and resources.',
  },
  {
    name: 'Anxiety Support',
    slug: 'anxiety-support', 
    description: 'Connect with others managing anxiety disorders, share coping techniques, and find understanding.',
  },
  {
    name: 'Depression Support',
    slug: 'depression-support',
    description: 'A safe space for those dealing with depression to share their journey and support each other.',
  },
  {
    name: 'PTSD & Trauma Recovery',
    slug: 'ptsd-trauma-recovery',
    description: 'Support for survivors of trauma and those working through PTSD recovery.',
  },
  {
    name: 'Substance Use Recovery',
    slug: 'substance-recovery',
    description: 'Community for individuals in recovery from alcohol and substance use disorders.',
  },
  {
    name: 'Eating Disorder Recovery',
    slug: 'eating-disorder-recovery',
    description: 'Support for those recovering from binge eating and other eating disorders.',
  },
  {
    name: 'Burnout & Stress Management',
    slug: 'burnout-stress-management',
    description: 'Resources and support for managing workplace burnout and chronic stress.',
  },
  {
    name: 'Sleep Disorders',
    slug: 'sleep-disorders',
    description: 'Community for those dealing with insomnia and other sleep-related challenges.',
  },
  {
    name: 'Mood Disorders',
    slug: 'mood-disorders',
    description: 'Support for individuals with bipolar disorder and other mood disorders.',
  },
  {
    name: 'OCD Support',
    slug: 'ocd-support',
    description: 'Community for those managing obsessive-compulsive disorder and related conditions.',
  },
  {
    name: 'Panic & Anxiety',
    slug: 'panic-anxiety',
    description: 'Specific support for panic disorder and severe anxiety management.',
  },
  {
    name: 'Phobia Support',
    slug: 'phobia-support',
    description: 'Community for overcoming specific phobias and irrational fears.',
  },
  {
    name: 'Social Anxiety Support',
    slug: 'social-anxiety-support',
    description: 'Support for those dealing with social anxiety and social phobias.',
  },
];

// Additional community types for general support
export const ADDITIONAL_COMMUNITIES = [
  {
    name: 'Mindfulness & Meditation',
    description: 'A space for sharing mindfulness practices and meditation experiences',
  },
  {
    name: 'Support Circle',
    description: 'General support for anyone going through difficult times',
  },
  {
    name: 'Wellness Warriors',
    description: 'Focusing on physical and mental wellness together',
  },
  {
    name: 'Creative Therapy',
    description: 'Using art, music, and creativity for healing',
  },
  {
    name: 'Family & Relationships',
    description: 'Navigating family dynamics and relationship challenges',
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