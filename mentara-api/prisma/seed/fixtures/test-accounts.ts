/**
 * Test Account Fixtures
 * 
 * Predefined test accounts with known credentials for development and testing.
 * All accounts use password: "password123"
 * 
 * These accounts MUST be present after every seed run.
 */

import { DEFAULT_PASSWORD } from '../config';

export interface TestAccount {
  id: string; // Specific predictable ID
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist' | 'admin' | 'moderator';
  bio?: string;
  isActive?: boolean;
  specialData?: any; // Role-specific data
}

/**
 * Client Test Accounts (MUST ALWAYS EXIST)
 * From: TEST_ACCOUNTS.md
 */
export const TEST_CLIENTS: TestAccount[] = [
  {
    id: 'dev_client_1',
    email: 'client1@mentaratest.dev',
    firstName: 'Client',
    lastName: '1',
    role: 'client',
    bio: 'Test client account 1 for development and testing.',
  },
  {
    id: 'dev_client_2',
    email: 'client2@mentaratest.dev',
    firstName: 'Client',
    lastName: '2',
    role: 'client',
    bio: 'Test client account 2 for development and testing.',
  },
  {
    id: 'dev_client_3',
    email: 'client3@mentaratest.dev',
    firstName: 'Client',
    lastName: '3',
    role: 'client',
    bio: 'Test client account 3 for development and testing.',
  },
];

/**
 * Therapist Test Accounts (MUST ALWAYS EXIST)
 * From: TEST_ACCOUNTS.md
 */
export const TEST_THERAPISTS: TestAccount[] = [
  {
    id: 'dev_therapist_1',
    email: 'therapist1@mentaratest.dev',
    firstName: 'Dr. Therapist',
    lastName: '1',
    role: 'therapist',
    bio: 'Licensed therapist specializing in anxiety and depression.',
    specialData: {
      mobile: '+1-555-0101',
      province: 'California',
      providerType: 'Clinical Psychologist',
      professionalLicenseType: 'Licensed Clinical Psychologist',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'PSY12345',
      yearsOfExperience: 8,
      areasOfExpertise: ['Anxiety', 'Depression'],
      therapeuticApproachesUsedList: ['CBT', 'Mindfulness-Based Therapy'],
      languagesOffered: ['English'],
      hourlyRate: 100.00,
      status: 'APPROVED',
    },
  },
  {
    id: 'dev_therapist_2',
    email: 'therapist2@mentaratest.dev',
    firstName: 'Dr. Therapist',
    lastName: '2',
    role: 'therapist', 
    bio: 'Licensed therapist specializing in anxiety and depression.',
    specialData: {
      mobile: '+1-555-0102',
      province: 'New York',
      providerType: 'Licensed Clinical Social Worker',
      professionalLicenseType: 'LCSW',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'LCSW67890',
      yearsOfExperience: 10,
      areasOfExpertise: ['Anxiety', 'Depression'],
      therapeuticApproachesUsedList: ['CBT', 'Mindfulness-Based Therapy'],
      languagesOffered: ['English'],
      hourlyRate: 100.00,
      status: 'APPROVED',
    },
  },
  {
    id: 'dev_therapist_3',
    email: 'therapist3@mentaratest.dev',
    firstName: 'Dr. Therapist',
    lastName: '3',
    role: 'therapist',
    bio: 'Licensed therapist specializing in anxiety and depression.',
    specialData: {
      mobile: '+1-555-0103',
      province: 'Texas',
      providerType: 'Marriage and Family Therapist',
      professionalLicenseType: 'LMFT',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'MFT11111',
      yearsOfExperience: 6,
      areasOfExpertise: ['Anxiety', 'Depression'],
      therapeuticApproachesUsedList: ['CBT', 'Mindfulness-Based Therapy'],
      languagesOffered: ['English'],
      hourlyRate: 100.00,
      status: 'APPROVED',
    },
  },
];

/**
 * Admin Test Accounts (MUST ALWAYS EXIST)
 * From: TEST_ACCOUNTS.md
 */
export const TEST_ADMINS: TestAccount[] = [
  {
    id: 'dev_admin_1',
    email: 'admin1@mentaratest.dev',
    firstName: 'Admin',
    lastName: '1',
    role: 'admin',
    bio: 'System Administrator with full platform access.',
    specialData: {
      permissions: ['user_management', 'therapist_approval', 'system_admin'],
    },
  },
  {
    id: 'dev_admin_2',
    email: 'admin2@mentaratest.dev',
    firstName: 'Admin',
    lastName: '2',
    role: 'admin',
    bio: 'System Administrator with full platform access.',
    specialData: {
      permissions: ['user_management', 'therapist_approval', 'system_admin'],
    },
  },
  {
    id: 'dev_admin_3',
    email: 'admin3@mentaratest.dev',
    firstName: 'Admin',
    lastName: '3',
    role: 'admin',
    bio: 'System Administrator with full platform access.',
    specialData: {
      permissions: ['user_management', 'therapist_approval', 'system_admin'],
    },
  },
];

/**
 * Moderator Test Accounts (MUST ALWAYS EXIST)
 * From: TEST_ACCOUNTS.md
 */
export const TEST_MODERATORS: TestAccount[] = [
  {
    id: 'dev_moderator_1',
    email: 'moderator1@mentaratest.dev',
    firstName: 'Moderator',
    lastName: '1',
    role: 'moderator',
    bio: 'Community Moderator for content moderation.',
    specialData: {
      permissions: ['content_moderation', 'community_management'],
    },
  },
  {
    id: 'dev_moderator_2',
    email: 'moderator2@mentaratest.dev',
    firstName: 'Moderator',
    lastName: '2',
    role: 'moderator',
    bio: 'Community Moderator for content moderation.',
    specialData: {
      permissions: ['content_moderation', 'community_management'],
    },
  },
  {
    id: 'dev_moderator_3',
    email: 'moderator3@mentaratest.dev',
    firstName: 'Moderator',
    lastName: '3',
    role: 'moderator',
    bio: 'Community Moderator for content moderation.',
    specialData: {
      permissions: ['content_moderation', 'community_management'],
    },
  },
];

/**
 * Required Test Communities (MUST ALWAYS EXIST)
 * Identified by slug; DB assigns UUID for id.
 */
export const TEST_COMMUNITY_SLUGS = ['adhd-support', 'anxiety-support', 'depression-support'] as const;

export const TEST_COMMUNITIES: Array<{ name: string; slug: string; description: string }> = [
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

/**
 * All test accounts combined
 */
export const ALL_TEST_ACCOUNTS: TestAccount[] = [
  ...TEST_CLIENTS,
  ...TEST_THERAPISTS,
  ...TEST_ADMINS,
  ...TEST_MODERATORS,
];

/**
 * Sample realistic user data for generating additional users
 */
export const SAMPLE_USER_DATA = {
  firstNames: {
    male: ['James', 'Michael', 'David', 'John', 'Robert', 'William', 'Christopher', 'Matthew', 'Daniel', 'Anthony'],
    female: ['Mary', 'Jennifer', 'Linda', 'Patricia', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa'],
    neutral: ['Alex', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix'],
  },
  lastNames: [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  ],
  provinces: [
    'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois', 'Ohio', 'Georgia', 
    'North Carolina', 'Michigan', 'New Jersey', 'Virginia', 'Washington', 'Arizona', 'Massachusetts',
  ],
  therapistSpecialties: [
    'Anxiety Disorders', 'Depression', 'PTSD/Trauma', 'Bipolar Disorder', 'OCD', 'Eating Disorders',
    'Substance Abuse', 'Family Therapy', 'Couples Counseling', 'Child Psychology', 'ADHD',
    'Grief Counseling', 'Social Anxiety', 'Panic Disorders', 'Personality Disorders',
  ],
  therapeuticApproaches: [
    'Cognitive Behavioral Therapy (CBT)', 'Dialectical Behavior Therapy (DBT)', 'EMDR',
    'Psychodynamic Therapy', 'Humanistic Therapy', 'Family Systems Therapy',
    'Solution-Focused Brief Therapy', 'Acceptance and Commitment Therapy (ACT)',
    'Mindfulness-Based Therapy', 'Trauma-Focused CBT', 'Motivational Interviewing',
  ],
  clientBios: [
    'New to therapy and looking for support with anxiety and stress management.',
    'Working through depression and relationship challenges with professional guidance.',
    'Focusing on trauma recovery and building healthy coping mechanisms.',
    'Managing work-life balance and preventing burnout in a demanding career.',
    'Exploring family dynamics and improving communication with loved ones.',
    'Dealing with major life transitions and finding direction for the future.',
    'Working on self-esteem and confidence building through therapeutic support.',
    'Managing chronic mental health conditions with ongoing professional care.',
    'Focused on grief counseling after experiencing significant personal loss.',
    'Building healthy relationships and addressing attachment patterns.',
  ],
};
