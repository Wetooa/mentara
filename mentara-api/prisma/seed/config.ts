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