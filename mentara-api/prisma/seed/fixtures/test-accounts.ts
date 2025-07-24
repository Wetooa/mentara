/**
 * Test Account Fixtures
 * 
 * Predefined test accounts with known credentials for development and testing.
 * All accounts use password: "password123"
 */

import { DEFAULT_PASSWORD } from '../config';

export interface TestAccount {
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist' | 'admin' | 'moderator';
  bio?: string;
  isActive?: boolean;
  specialData?: any; // Role-specific data
}

/**
 * Client Test Accounts
 */
export const TEST_CLIENTS: TestAccount[] = [
  {
    email: 'test.client.basic@mentaradev.local',
    firstName: 'Sarah',
    lastName: 'Johnson', 
    role: 'client',
    bio: 'New to therapy, looking for support with general anxiety and stress management.',
  },
  {
    email: 'test.client.experienced@mentaradev.local',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    role: 'client',
    bio: 'Working on depression and relationship challenges with 2+ years of therapy experience.',
  },
  {
    email: 'test.client.trauma@mentaradev.local',
    firstName: 'Jennifer',
    lastName: 'Chen',
    role: 'client',
    bio: 'PTSD survivor focusing on trauma recovery and building healthy coping mechanisms.',
  },
  {
    email: 'test.client.anxiety@mentaradev.local',
    firstName: 'David',
    lastName: 'Kim',
    role: 'client',
    bio: 'Managing social anxiety and panic disorder. Active in anxiety support communities.',
  },
  {
    email: 'test.client.wellness@mentaradev.local',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    role: 'client',
    bio: 'Focused on preventive mental health and maintaining overall wellness through mindfulness.',
  },
];

/**
 * Therapist Test Accounts
 */
export const TEST_THERAPISTS: TestAccount[] = [
  {
    email: 'test.therapist.cbt@mentaradev.local',
    firstName: 'Dr. Michael',
    lastName: 'Thompson',
    role: 'therapist',
    bio: 'Licensed Clinical Psychologist specializing in Cognitive Behavioral Therapy with 8+ years experience.',
    specialData: {
      mobile: '+1-555-0101',
      province: 'California',
      providerType: 'Clinical Psychologist',
      professionalLicenseType: 'Licensed Clinical Psychologist',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'PSY12345',
      yearsOfExperience: 8,
      areasOfExpertise: ['Anxiety Disorders', 'Depression', 'Cognitive Behavioral Therapy'],
      therapeuticApproachesUsedList: ['CBT', 'Mindfulness-Based Therapy', 'Solution-Focused Therapy'],
      languagesOffered: ['English', 'Spanish'],
    },
  },
  {
    email: 'test.therapist.trauma@mentaradev.local',
    firstName: 'Dr. Lisa',
    lastName: 'Parker',
    role: 'therapist', 
    bio: 'Trauma specialist with expertise in PTSD, EMDR therapy, and complex trauma recovery.',
    specialData: {
      mobile: '+1-555-0102',
      province: 'New York',
      providerType: 'Licensed Clinical Social Worker',
      professionalLicenseType: 'LCSW',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'LCSW67890',
      yearsOfExperience: 12,
      areasOfExpertise: ['Trauma Recovery', 'PTSD', 'EMDR', 'Complex Trauma'],
      therapeuticApproachesUsedList: ['EMDR', 'Trauma-Focused CBT', 'Somatic Therapy'],
      languagesOffered: ['English', 'French'],
    },
  },
  {
    email: 'test.therapist.family@mentaradev.local',
    firstName: 'Dr. Amanda',
    lastName: 'Williams',
    role: 'therapist',
    bio: 'Marriage and Family Therapist focusing on relationship dynamics and family systems.',
    specialData: {
      mobile: '+1-555-0103',
      province: 'Texas',
      providerType: 'Marriage and Family Therapist',
      professionalLicenseType: 'LMFT',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'MFT11111',
      yearsOfExperience: 6,
      areasOfExpertise: ['Family Therapy', 'Couples Counseling', 'Relationship Issues'],
      therapeuticApproachesUsedList: ['Family Systems Therapy', 'Emotionally Focused Therapy', 'Gottman Method'],
      languagesOffered: ['English'],
    },
  },
  {
    email: 'test.therapist.addiction@mentaradev.local',
    firstName: 'Dr. James',
    lastName: "O'Connor",
    role: 'therapist',
    bio: 'Addiction counselor and dual diagnosis specialist with extensive substance abuse treatment experience.',
    specialData: {
      mobile: '+1-555-0104',
      province: 'Florida',
      providerType: 'Licensed Professional Counselor',
      professionalLicenseType: 'LPC',
      isPRCLicensed: 'Yes',
      prcLicenseNumber: 'LPC22222',
      yearsOfExperience: 10,
      areasOfExpertise: ['Substance Abuse', 'Dual Diagnosis', 'Addiction Recovery'],
      therapeuticApproachesUsedList: ['Motivational Interviewing', 'Dialectical Behavior Therapy', '12-Step Facilitation'],
      languagesOffered: ['English'],
    },
  },
];

/**
 * Admin Test Accounts
 */
export const TEST_ADMINS: TestAccount[] = [
  {
    email: 'test.admin.super@mentaradev.local',
    firstName: 'Robert',
    lastName: 'Anderson',
    role: 'admin',
    bio: 'System Administrator with full platform access and user management capabilities.',
    specialData: {
      permissions: ['USER_MANAGEMENT', 'THERAPIST_APPROVAL', 'SYSTEM_CONFIG', 'BILLING_MANAGEMENT'],
      adminLevel: 'super',
    },
  },
  {
    email: 'test.admin.user.manager@mentaradev.local',
    firstName: 'Linda',
    lastName: 'Martinez',
    role: 'admin',
    bio: 'User Management Administrator focused on account oversight and support.',
    specialData: {
      permissions: ['USER_MANAGEMENT', 'SUPPORT_TICKETS'],
      adminLevel: 'admin',
    },
  },
  {
    email: 'test.admin.content@mentaradev.local',
    firstName: 'William',
    lastName: 'Johnson',
    role: 'admin',
    bio: 'Content Administrator managing community moderation and content policies.',
    specialData: {
      permissions: ['CONTENT_MODERATION', 'COMMUNITY_MANAGEMENT'],
      adminLevel: 'admin',
    },
  },
];

/**
 * Moderator Test Accounts
 */
export const TEST_MODERATORS: TestAccount[] = [
  {
    email: 'test.moderator.primary@mentaradev.local',
    firstName: 'Alex',
    lastName: 'Morgan',
    role: 'moderator',
    bio: 'Primary Community Moderator overseeing multiple mental health support communities.',
    specialData: {
      permissions: ['MODERATE_POSTS', 'MODERATE_COMMENTS', 'COMMUNITY_MANAGEMENT'],
    },
  },
  {
    email: 'test.moderator.anxiety@mentaradev.local',
    firstName: 'Taylor',
    lastName: 'Davis',
    role: 'moderator',
    bio: 'Anxiety Support Community Moderator with lived experience and peer support training.',
    specialData: {
      permissions: ['MODERATE_POSTS', 'MODERATE_COMMENTS'],
    },
  },
  {
    email: 'test.moderator.trauma@mentaradev.local',
    firstName: 'Jordan',
    lastName: 'Smith',
    role: 'moderator',
    bio: 'PTSD & Trauma Recovery Community Moderator specializing in crisis intervention.',
    specialData: {
      permissions: ['MODERATE_POSTS', 'MODERATE_COMMENTS', 'CRISIS_INTERVENTION'],
    },
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