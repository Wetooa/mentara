/**
 * Users Generator
 * 
 * Creates users, clients, therapists, admins, and moderators with realistic profiles
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserConfig, DEFAULT_PASSWORD } from '../config';
import { 
  ALL_TEST_ACCOUNTS, 
  SAMPLE_USER_DATA, 
  TestAccount 
} from '../fixtures/test-accounts';

export interface UsersData {
  users: any[];
  clients: any[];
  therapists: any[];
  admins: any[];
  moderators: any[];
}

/**
 * Generate all users and their role-specific profiles
 */
export async function generateUsers(prisma: PrismaClient, config: UserConfig): Promise<UsersData> {
  console.log('  Creating user accounts...');
  
  // Hash the default password once
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
  const result: UsersData = {
    users: [],
    clients: [],
    therapists: [],
    admins: [],
    moderators: [],
  };

  // Create test accounts first
  await createTestAccounts(prisma, hashedPassword, result);

  // Generate additional users to meet config requirements
  await generateAdditionalUsers(prisma, config, hashedPassword, result);

  console.log(`    ✅ ${result.users.length} users created`);
  console.log(`    📊 ${result.clients.length} clients, ${result.therapists.length} therapists, ${result.admins.length} admins, ${result.moderators.length} moderators`);

  return result;
}

/**
 * Create predefined test accounts
 */
async function createTestAccounts(
  prisma: PrismaClient, 
  hashedPassword: string, 
  result: UsersData
): Promise<void> {
  for (const account of ALL_TEST_ACCOUNTS) {
    // Create base user
    const user = await prisma.user.create({
      data: {
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        password: hashedPassword,
        emailVerified: true,
        bio: account.bio,
        isActive: account.isActive ?? true,
        avatarUrl: generateAvatarUrl(account.firstName, account.lastName),
        createdAt: randomPastDate(90), // Created within last 90 days
      },
    });

    result.users.push(user);

    // Create role-specific profiles
    await createRoleSpecificProfile(prisma, user, account, result);
  }
}

/**
 * Generate additional users beyond test accounts
 */
async function generateAdditionalUsers(
  prisma: PrismaClient,
  config: UserConfig,
  hashedPassword: string,
  result: UsersData
): Promise<void> {
  const needed = {
    clients: Math.max(0, config.clients - result.clients.length),
    therapists: Math.max(0, config.therapists - result.therapists.length),
    admins: Math.max(0, config.admins - result.admins.length),
    moderators: Math.max(0, config.moderators - result.moderators.length),
  };

  // Generate additional clients
  for (let i = 0; i < needed.clients; i++) {
    const userData = generateRandomUserData('client', i);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        emailVerified: Math.random() > 0.1, // 90% verified
        createdAt: randomPastDate(180),
      },
    });

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: Math.random() > 0.6,
      },
    });

    result.users.push(user);
    result.clients.push({ user, client });
  }

  // Generate additional therapists
  for (let i = 0; i < needed.therapists; i++) {
    const userData = generateRandomUserData('therapist', i);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        emailVerified: true, // All therapists must be verified
        createdAt: randomPastDate(365), // Therapists have been around longer
      },
    });

    const therapist = await prisma.therapist.create({
      data: generateTherapistData(user.id),
    });

    result.users.push(user);
    result.therapists.push({ user, therapist });
  }

  // Generate additional admins  
  for (let i = 0; i < needed.admins; i++) {
    const userData = generateRandomUserData('admin', i);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        emailVerified: true,
        createdAt: randomPastDate(730), // Admins are long-term
      },
    });

    const admin = await prisma.admin.create({
      data: {
        userId: user.id,
        permissions: ['USER_MANAGEMENT', 'SUPPORT_TICKETS'],
        adminLevel: 'admin',
      },
    });

    result.users.push(user);
    result.admins.push({ user, admin });
  }

  // Generate additional moderators
  for (let i = 0; i < needed.moderators; i++) {
    const userData = generateRandomUserData('moderator', i);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        emailVerified: true,
        createdAt: randomPastDate(365),
      },
    });

    const moderator = await prisma.moderator.create({
      data: {
        userId: user.id,
        permissions: ['MODERATE_POSTS', 'MODERATE_COMMENTS'],
      },
    });

    result.users.push(user);
    result.moderators.push({ user, moderator });
  }
}

/**
 * Create role-specific profiles for test accounts
 */
async function createRoleSpecificProfile(
  prisma: PrismaClient,
  user: any,
  account: TestAccount,
  result: UsersData
): Promise<void> {
  switch (account.role) {
    case 'client':
      const client = await prisma.client.create({
        data: {
          userId: user.id,
          hasSeenTherapistRecommendations: Math.random() > 0.5,
        },
      });
      result.clients.push({ user, client });
      break;

    case 'therapist':
      const therapistData = account.specialData ? 
        { ...generateTherapistData(user.id), ...account.specialData, status: 'APPROVED' } :
        { ...generateTherapistData(user.id), status: 'APPROVED' };
      
      const therapist = await prisma.therapist.create({
        data: therapistData,
      });
      result.therapists.push({ user, therapist });
      break;

    case 'admin':
      const admin = await prisma.admin.create({
        data: {
          userId: user.id,
          permissions: account.specialData?.permissions || ['USER_MANAGEMENT'],
          adminLevel: account.specialData?.adminLevel || 'admin',
        },
      });
      result.admins.push({ user, admin });
      break;

    case 'moderator':
      const moderator = await prisma.moderator.create({
        data: {
          userId: user.id,  
          permissions: account.specialData?.permissions || ['MODERATE_POSTS', 'MODERATE_COMMENTS'],
        },
      });
      result.moderators.push({ user, moderator });
      break;
  }
}

/**
 * Generate random user data
 */
function generateRandomUserData(role: string, index: number): any {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstNames = [...SAMPLE_USER_DATA.firstNames[gender], ...SAMPLE_USER_DATA.firstNames.neutral];
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(SAMPLE_USER_DATA.lastNames);
  
  return {
    email: `generated.${role}.${index + 1}@mentaradev.local`,
    firstName,
    lastName,
    role,
    bio: role === 'client' ? randomChoice(SAMPLE_USER_DATA.clientBios) : 
         role === 'therapist' ? `Licensed mental health professional with expertise in ${randomChoice(SAMPLE_USER_DATA.therapistSpecialties)}.` :
         `Platform ${role} with system administration responsibilities.`,
    avatarUrl: generateAvatarUrl(firstName, lastName),
    isActive: Math.random() > 0.05, // 95% active rate
    birthDate: role === 'client' ? randomBirthDate(18, 65) : randomBirthDate(25, 60), // Therapists typically older
  };
}

/**
 * Generate therapist-specific data
 */
function generateTherapistData(userId: string): any {
  const licenseTypes = ['Licensed Clinical Psychologist', 'LCSW', 'LMFT', 'LPC', 'Licensed Psychiatrist'];
  const providerTypes = ['Clinical Psychologist', 'Licensed Clinical Social Worker', 'Marriage and Family Therapist', 'Licensed Professional Counselor', 'Psychiatrist'];
  
  const licenseType = randomChoice(licenseTypes);
  const providerType = randomChoice(providerTypes);
  const yearsExp = randomInt(2, 20);
  const specialties = randomChoices(SAMPLE_USER_DATA.therapistSpecialties, randomInt(2, 5));
  const approaches = randomChoices(SAMPLE_USER_DATA.therapeuticApproaches, randomInt(2, 4));

  return {
    userId,
    mobile: `+1-555-${String(randomInt(1000, 9999))}`,
    province: randomChoice(SAMPLE_USER_DATA.provinces),
    timezone: 'UTC',
    status: Math.random() > 0.1 ? 'APPROVED' : 'PENDING', // 90% approved
    providerType,
    professionalLicenseType: licenseType,
    isPRCLicensed: 'Yes',
    prcLicenseNumber: `${licenseType.substring(0, 3).toUpperCase()}${randomInt(10000, 99999)}`,
    expirationDateOfLicense: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years from now
    practiceStartDate: new Date(Date.now() - yearsExp * 365 * 24 * 60 * 60 * 1000),
    licenseVerified: Math.random() > 0.1, // 90% verified
    yearsOfExperience: yearsExp,
    areasOfExpertise: specialties,
    therapeuticApproachesUsedList: approaches,
    languagesOffered: Math.random() > 0.7 ? ['English', randomChoice(['Spanish', 'French', 'Mandarin', 'German'])] : ['English'],
    providedOnlineTherapyBefore: Math.random() > 0.3, // 70% have online experience
    comfortableUsingVideoConferencing: Math.random() > 0.1, // 90% comfortable
    preferredSessionLength: [60], // Standard 60-minute sessions
    compliesWithDataPrivacyAct: true,
    professionalLiabilityInsurance: 'Professional Liability Insurance - $1M coverage',
    acceptsInsurance: Math.random() > 0.4, // 60% accept insurance
    acceptedInsuranceTypes: Math.random() > 0.4 ? ['Blue Cross Blue Shield', 'Aetna', 'Cigna'] : [],
    willingToAbideByPlatformGuidelines: true,
    assessmentTools: randomChoices(['PHQ-9', 'GAD-7', 'Beck Depression Inventory', 'PTSD Checklist'], randomInt(1, 3)),
    specialCertifications: randomChoices(['EMDR', 'DBT', 'CBT Certification', 'Trauma-Informed Care'], randomInt(0, 2)),
    expertise: specialties.slice(0, 3), // Use first 3 specialties as expertise
    approaches: approaches.slice(0, 2), // Use first 2 approaches
    languages: Math.random() > 0.7 ? ['English', randomChoice(['Spanish', 'French', 'Mandarin'])] : ['English'],
    illnessSpecializations: specialties.slice(0, 2),
    acceptTypes: ['Individual', 'Couples', 'Family'].slice(0, randomInt(1, 3)),
    treatmentSuccessRates: {
      anxiety: Math.random() * 0.3 + 0.6, // 60-90%
      depression: Math.random() * 0.3 + 0.6,
      trauma: Math.random() * 0.25 + 0.65,
    },
    sessionLength: '60 minutes',
    hourlyRate: 120 + Math.random() * 80, // $120-200 per hour
  };
}

/**
 * Utility functions
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(daysAgo: number): Date {
  const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

function randomBirthDate(minAge: number, maxAge: number): Date {
  const ageInMs = (minAge + Math.random() * (maxAge - minAge)) * 365 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ageInMs);
}

function generateAvatarUrl(firstName: string, lastName: string): string {
  // Use DiceBear API for consistent avatar generation
  const seed = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z-]/g, '');
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}