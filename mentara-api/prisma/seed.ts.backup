// NOTE: Comprehensive database seeding with realistic data
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ILLNESS_COMMUNITIES } from '../src/config/community-configs';

const prisma = new PrismaClient();

// Test accounts from test-accounts.md
const TEST_ACCOUNTS = {
  CLIENTS: [
    {
      id: 'user_2z5S2iaKkRuHpe3BygkU0R3NnDu',
      email: 'test.client.basic@mentaratest.dev',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'client',
    },
    {
      id: 'user_2z5S4N84dgKfWuXzXGYjtXbkWVC',
      email: 'test.client.complete@mentaratest.dev',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      role: 'client',
    },
    {
      id: 'user_2z5S76EFlCdnil28daogAv2A4bB',
      email: 'test.client.inactive@mentaratest.dev',
      firstName: 'Jennifer',
      lastName: 'Chen',
      role: 'client',
      isActive: false,
    },
  ],
  THERAPISTS: [
    {
      id: 'user_2z5S92KNAdBfAg5sBvMAtZvMiIz',
      email: 'test.therapist.approved@mentaratest.dev',
      firstName: 'Dr. Michael',
      lastName: 'Thompson',
      role: 'therapist',
    },
    {
      id: 'user_2z5SBGCUI2ypqCYmIMEanA335FT',
      email: 'test.therapist.pending@mentaratest.dev',
      firstName: 'Dr. Lisa',
      lastName: 'Park',
      role: 'therapist',
    },
    {
      id: 'user_2z5SDHpsxW80HEoqRHkQCon9bHZ',
      email: 'test.therapist.specialist@mentaratest.dev',
      firstName: 'Dr. Amanda',
      lastName: 'Williams',
      role: 'therapist',
    },
  ],
  ADMINS: [
    {
      id: 'user_2z5SQlOzBOgmVn6KStIDToQViDA',
      email: 'test.admin.super@mentaratest.dev',
      firstName: 'Robert',
      lastName: 'Anderson',
      role: 'admin',
    },
    {
      id: 'user_2z5STvOT1aof3ypYHO0KpKFto0S',
      email: 'test.admin.user.manager@mentaratest.dev',
      firstName: 'Linda',
      lastName: 'Martinez',
      role: 'admin',
    },
  ],
  MODERATORS: [
    {
      id: 'user_2z5SGmYtYcImUQ8tTOnmM166iZV',
      email: 'test.moderator.primary@mentaratest.dev',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'moderator',
    },
    {
      id: 'user_2z5SL6dkZ1D1Yq9WBI3rKb2QN1P',
      email: 'test.moderator.community@mentaratest.dev',
      firstName: 'Taylor',
      lastName: 'Davis',
      role: 'moderator',
    },
  ],
};

// Configuration constants
const SEED_CONFIG = {
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

// Seed data generators
class SeedDataGenerator {
  static generateUserData(role: string, specificData: any = {}) {
    return {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      middleName: faker.person.middleName(),
      lastName: faker.person.lastName(),
      birthDate: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
      address: faker.location.streetAddress({ useFullAddress: true }),
      avatarUrl: faker.image.avatar(),
      role,
      bio: faker.lorem.paragraph(),
      coverImageUrl: faker.image.url(),
      isActive: true,
      ...specificData,
    };
  }

  static generateTherapistData() {
    return {
      mobile: faker.phone.number(),
      province: faker.location.state(),
      providerType: faker.helpers.arrayElement([
        'Individual',
        'Group Practice',
        'Hospital',
      ]),
      professionalLicenseType: faker.helpers.arrayElement([
        'LCSW',
        'LPC',
        'LMFT',
        'Psychologist',
        'MD',
      ]),
      isPRCLicensed: faker.datatype.boolean() ? 'Yes' : 'No',
      prcLicenseNumber: `PRC-${faker.string.numeric(8)}`,
      expirationDateOfLicense: faker.date.future({ years: 3 }),
      practiceStartDate: faker.date.past({ years: 15 }),
      areasOfExpertise: faker.helpers.arrayElements(
        [
          'Anxiety Disorders',
          'Depression',
          'PTSD',
          'Couples Therapy',
          'Family Therapy',
          'Addiction Recovery',
          'Eating Disorders',
          'Bipolar Disorder',
          'ADHD',
          'Autism Spectrum',
          'Grief Counseling',
          'Anger Management',
          'Sleep Disorders',
          'Chronic Pain',
          'OCD',
        ],
        { min: 2, max: 6 },
      ),
      assessmentTools: faker.helpers.arrayElements(
        ['PHQ-9', 'GAD-7', 'AUDIT', 'BDI-II', 'MMPI-2', 'ASRS', 'PCL-5', 'MDQ'],
        { min: 2, max: 5 },
      ),
      therapeuticApproachesUsedList: faker.helpers.arrayElements(
        [
          'CBT',
          'DBT',
          'Psychodynamic',
          'Humanistic',
          'EMDR',
          'ACT',
          'IFS',
          'Gestalt',
        ],
        { min: 2, max: 4 },
      ),
      languagesOffered: faker.helpers.arrayElements(
        [
          'English',
          'Spanish',
          'Mandarin',
          'Tagalog',
          'French',
          'Korean',
          'Arabic',
        ],
        { min: 1, max: 3 },
      ),
      providedOnlineTherapyBefore: faker.datatype.boolean(),
      comfortableUsingVideoConferencing: true,
      preferredSessionLength: faker.helpers.arrayElements([30, 45, 60, 90], {
        min: 1,
        max: 3,
      }),
      privateConfidentialSpace: 'Yes',
      compliesWithDataPrivacyAct: true,
      professionalLiabilityInsurance: 'Yes',
      complaintsOrDisciplinaryActions: faker.datatype.boolean({
        probability: 0.1,
      })
        ? faker.lorem.sentence()
        : 'None',
      willingToAbideByPlatformGuidelines: true,
      expertise: faker.helpers.arrayElements(
        [
          'Anxiety Disorders',
          'Mood Disorders',
          'Trauma Recovery',
          'Relationship Issues',
          'Addiction Treatment',
          'Eating Disorder Recovery',
          'LGBTQ+ Affirmative Therapy',
        ],
        { min: 2, max: 4 },
      ),
      approaches: faker.helpers.arrayElements(
        [
          'Cognitive Behavioral Therapy',
          'Mindfulness-Based Therapy',
          'Solution-Focused Therapy',
          'Psychodynamic Therapy',
          'Dialectical Behavior Therapy',
        ],
        { min: 1, max: 3 },
      ),
      languages: faker.helpers.arrayElements(
        ['English', 'Spanish', 'Tagalog', 'Mandarin'],
        { min: 1, max: 2 },
      ),
      illnessSpecializations: faker.helpers.arrayElements(
        [
          'Depression',
          'Anxiety',
          'PTSD',
          'Bipolar Disorder',
          'ADHD',
          'Eating Disorders',
        ],
        { min: 1, max: 4 },
      ),
      acceptTypes: faker.helpers.arrayElements(
        ['Individual', 'Couples', 'Family', 'Group'],
        { min: 1, max: 3 },
      ),
      treatmentSuccessRates: {
        anxiety: faker.number.float({
          min: 0.65,
          max: 0.95,
          fractionDigits: 2,
        }),
        depression: faker.number.float({
          min: 0.6,
          max: 0.9,
          fractionDigits: 2,
        }),
        trauma: faker.number.float({ min: 0.7, max: 0.88, fractionDigits: 2 }),
      },
      sessionLength: faker.helpers.arrayElement([
        '45 minutes',
        '60 minutes',
        '90 minutes',
      ]),
      hourlyRate: faker.number.float({ min: 80, max: 250, fractionDigits: 2 }),
      status: 'approved',
      submissionDate: faker.date.past(),
      processingDate: faker.date.past(),
    };
  }

  static generateAssessmentResponses() {
    const responses = {};
    // Generate responses for 201 questions across different assessment tools
    for (let i = 1; i <= 201; i++) {
      responses[`q${i}`] = faker.number.int({ min: 0, max: 4 });
    }
    return responses;
  }

  static generateAssessmentScores() {
    return {
      PHQ: faker.number.int({ min: 0, max: 27 }),
      GAD7: faker.number.int({ min: 0, max: 21 }),
      AUDIT: faker.number.int({ min: 0, max: 40 }),
      ASRS: faker.number.int({ min: 0, max: 72 }),
      BES: faker.number.int({ min: 0, max: 46 }),
      DAST10: faker.number.int({ min: 0, max: 10 }),
      ISI: faker.number.int({ min: 0, max: 28 }),
      MBI: faker.number.int({ min: 0, max: 132 }),
      MDQ: faker.number.int({ min: 0, max: 13 }),
      OCI_R: faker.number.int({ min: 0, max: 72 }),
      PCL5: faker.number.int({ min: 0, max: 80 }),
      PDSS: faker.number.int({ min: 0, max: 28 }),
      PSS: faker.number.int({ min: 0, max: 40 }),
    };
  }

  static generateSeverityLevels() {
    return {
      depression: faker.helpers.arrayElement([
        'minimal',
        'mild',
        'moderate',
        'moderately_severe',
        'severe',
      ]),
      anxiety: faker.helpers.arrayElement([
        'minimal',
        'mild',
        'moderate',
        'severe',
      ]),
      substance_use: faker.helpers.arrayElement([
        'low_risk',
        'hazardous',
        'harmful',
        'dependent',
      ]),
      sleep_disorder: faker.helpers.arrayElement([
        'no_clinically_significant',
        'subthreshold',
        'moderate',
        'severe',
      ]),
      panic_disorder: faker.helpers.arrayElement([
        'minimal',
        'mild',
        'moderate',
        'severe',
      ]),
    };
  }

  static generateQuestionnaires() {
    return [
      { id: 'PHQ-9', name: 'Patient Health Questionnaire-9', questions: 9 },
      { id: 'GAD-7', name: 'General Anxiety Disorder-7', questions: 7 },
      {
        id: 'AUDIT',
        name: 'Alcohol Use Disorders Identification Test',
        questions: 10,
      },
      { id: 'ASRS', name: 'Adult ADHD Self-Report Scale', questions: 18 },
      { id: 'BES', name: 'Binge Eating Scale', questions: 16 },
      { id: 'DAST-10', name: 'Drug Abuse Screening Test', questions: 10 },
      { id: 'ISI', name: 'Insomnia Severity Index', questions: 7 },
      { id: 'MBI', name: 'Maslach Burnout Inventory', questions: 22 },
      { id: 'MDQ', name: 'Mood Disorder Questionnaire', questions: 13 },
      {
        id: 'OCI-R',
        name: 'Obsessive-Compulsive Inventory-Revised',
        questions: 18,
      },
      { id: 'PCL-5', name: 'PTSD Checklist for DSM-5', questions: 20 },
      { id: 'PDSS', name: 'Panic Disorder Severity Scale', questions: 7 },
      { id: 'PSS', name: 'Perceived Stress Scale', questions: 10 },
    ];
  }

  static generateAnswerMatrix() {
    const matrix: any[] = [];
    for (let questionIndex = 0; questionIndex < 201; questionIndex++) {
      matrix.push({
        questionId: questionIndex + 1,
        scale: faker.helpers.arrayElement([
          'PHQ-9',
          'GAD-7',
          'AUDIT',
          'ASRS',
          'BES',
          'DAST-10',
          'ISI',
          'MBI',
          'MDQ',
          'OCI-R',
          'PCL-5',
          'PDSS',
          'PSS',
        ]),
        weight: faker.number.float({ min: 0.1, max: 1.0, fractionDigits: 2 }),
        reverse_scored: faker.datatype.boolean({ probability: 0.1 }),
      });
    }
    return matrix;
  }

  static generateAiEstimate() {
    return {
      confidence: faker.number.float({
        min: 0.7,
        max: 0.98,
        fractionDigits: 3,
      }),
      risk_factors: faker.helpers.arrayElements(
        [
          'substance_abuse',
          'trauma_history',
          'family_history',
          'chronic_stress',
          'social_isolation',
          'financial_stress',
          'relationship_issues',
        ],
        { min: 1, max: 4 },
      ),
      recommendations: faker.helpers.arrayElements(
        [
          'CBT therapy',
          'medication_evaluation',
          'lifestyle_changes',
          'support_group',
          'stress_management',
          'mindfulness_practice',
        ],
        { min: 2, max: 5 },
      ),
      estimated_severity: {
        overall: faker.helpers.arrayElement(['low', 'moderate', 'high']),
        depression: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        anxiety: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        stress: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      },
    };
  }
}

async function seedUsers() {
  console.log('👥 Creating users...');

  const users: any[] = [];
  const clients: any[] = [];
  const therapists: any[] = [];

  // Create test accounts first with real Clerk IDs
  console.log('🧪 Creating test accounts with real Clerk IDs...');

  // Create test admin users
  for (const adminData of TEST_ACCOUNTS.ADMINS) {
    const userData = SeedDataGenerator.generateUserData('admin', adminData);
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created test admin: ${adminData.firstName} ${adminData.lastName}`,
    );
  }

  // Create test moderator users
  for (const moderatorData of TEST_ACCOUNTS.MODERATORS) {
    const userData = SeedDataGenerator.generateUserData(
      'moderator',
      moderatorData,
    );
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created test moderator: ${moderatorData.firstName} ${moderatorData.lastName}`,
    );
  }

  // Create test client users
  for (const clientData of TEST_ACCOUNTS.CLIENTS) {
    const userData = SeedDataGenerator.generateUserData('client', clientData);
    const user = await prisma.user.create({ data: userData });
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: faker.datatype.boolean(),
      },
    });
    clients.push({ user, client });
    users.push(user);
    console.log(
      `✅ Created test client: ${clientData.firstName} ${clientData.lastName}`,
    );
  }

  // Create test therapist users
  for (const therapistData of TEST_ACCOUNTS.THERAPISTS) {
    const userData = SeedDataGenerator.generateUserData(
      'therapist',
      therapistData,
    );
    const user = await prisma.user.create({ data: userData });
    const therapistProfileData = SeedDataGenerator.generateTherapistData();
    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        ...therapistProfileData,
      },
    });
    therapists.push({ user, therapist });
    users.push(user);
    console.log(
      `✅ Created test therapist: ${therapistData.firstName} ${therapistData.lastName}`,
    );
  }

  // Create additional fake users for testing (if needed)
  console.log('🤖 Creating additional fake users...');

  // Create additional admin users
  const additionalAdmins =
    SEED_CONFIG.USERS.ADMINS - TEST_ACCOUNTS.ADMINS.length;
  for (let i = 0; i < additionalAdmins; i++) {
    const userData = SeedDataGenerator.generateUserData('admin', {
      id: `fake_admin_${i + 1}`,
      email: `admin${i + 1}@mentara.com`,
      firstName: 'Admin',
      lastName: `User ${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created additional admin: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Create additional moderator users
  const additionalModerators =
    SEED_CONFIG.USERS.MODERATORS - TEST_ACCOUNTS.MODERATORS.length;
  for (let i = 0; i < additionalModerators; i++) {
    const userData = SeedDataGenerator.generateUserData('moderator', {
      id: `fake_moderator_${i + 1}`,
      email: `moderator${i + 1}@mentara.com`,
      firstName: 'Moderator',
      lastName: `User ${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    users.push(user);
    console.log(
      `✅ Created additional moderator: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Create additional client users
  const additionalClients =
    SEED_CONFIG.USERS.CLIENTS - TEST_ACCOUNTS.CLIENTS.length;
  for (let i = 0; i < additionalClients; i++) {
    const userData = SeedDataGenerator.generateUserData('client', {
      id: `fake_client_${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: faker.datatype.boolean(),
      },
    });
    clients.push({ user, client });
    users.push(user);
    console.log(
      `✅ Created additional client: ${userData.firstName} ${userData.lastName}`,
    );
  }

  // Create additional therapist users
  const additionalTherapists =
    SEED_CONFIG.USERS.THERAPISTS - TEST_ACCOUNTS.THERAPISTS.length;
  for (let i = 0; i < additionalTherapists; i++) {
    const userData = SeedDataGenerator.generateUserData('therapist', {
      id: `fake_therapist_${i + 1}`,
    });
    const user = await prisma.user.create({ data: userData });
    const therapistProfileData = SeedDataGenerator.generateTherapistData();
    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        ...therapistProfileData,
      },
    });
    therapists.push({ user, therapist });
    users.push(user);
    console.log(
      `✅ Created additional therapist: ${userData.firstName} ${userData.lastName}`,
    );
  }

  return { users, clients, therapists };
}

async function seedCommunities() {
  console.log('🏘️  Creating communities...');

  const communities: any[] = [];

  // Create illness communities from config
  for (const communityConfig of ILLNESS_COMMUNITIES) {
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: communityConfig.slug },
    });

    let community;
    if (!existingCommunity) {
      community = await prisma.community.create({
        data: {
          name: communityConfig.name,
          description: communityConfig.description,
          slug: communityConfig.slug,
          imageUrl: faker.image.url(),
        },
      });
      console.log(`✅ Created illness community: ${communityConfig.name}`);
    } else {
      community = existingCommunity;
      console.log(`⏭️  Community already exists: ${communityConfig.name}`);
    }
    communities.push(community);

    // Create room groups and rooms for this community
    await createRoomStructure(community);
  }

  // Create additional general communities
  const additionalCommunityTypes = [
    {
      name: 'Mindfulness & Meditation',
      description:
        'A space for sharing mindfulness practices and meditation experiences',
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

  for (const type of additionalCommunityTypes) {
    const community = await prisma.community.create({
      data: {
        name: type.name,
        description: type.description,
        slug: faker.lorem.slug() + '-' + Date.now(),
        imageUrl: faker.image.url(),
      },
    });
    communities.push(community);
    console.log(`✅ Created additional community: ${type.name}`);

    // Create room groups and rooms for this community
    await createRoomStructure(community);
  }

  return communities;
}

async function createRoomStructure(community: any) {
  console.log(`🏗️  Creating room structure for ${community.name}...`);

  // Define standardized room groups and rooms for each community
  const roomGroupsConfig = [
    {
      name: 'Welcome & Info',
      order: 1,
      rooms: [
        { name: 'Welcome', order: 1, postingRole: 'moderator' },
        { name: 'Announcements', order: 2, postingRole: 'moderator' },
        { name: 'Community Guidelines', order: 3, postingRole: 'moderator' },
      ],
    },
    {
      name: 'General Discussion',
      order: 2,
      rooms: [
        { name: 'General Chat', order: 1, postingRole: 'member' },
        { name: 'Share Your Story', order: 2, postingRole: 'member' },
        { name: 'Daily Check-ins', order: 3, postingRole: 'member' },
      ],
    },
    {
      name: 'Support & Resources',
      order: 3,
      rooms: [
        { name: 'Ask for Help', order: 1, postingRole: 'member' },
        { name: 'Success Stories', order: 2, postingRole: 'member' },
        { name: 'Helpful Resources', order: 3, postingRole: 'member' },
        { name: 'Coping Strategies', order: 4, postingRole: 'member' },
      ],
    },
  ];

  // Add specialized room group based on community type
  if (community.slug.includes('anxiety')) {
    roomGroupsConfig.push({
      name: 'Anxiety Specific',
      order: 4,
      rooms: [
        { name: 'Panic Attack Support', order: 1, postingRole: 'member' },
        { name: 'Exposure Therapy', order: 2, postingRole: 'member' },
        { name: 'Mindfulness for Anxiety', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('depression')) {
    roomGroupsConfig.push({
      name: 'Depression Specific',
      order: 4,
      rooms: [
        { name: 'Mood Tracking', order: 1, postingRole: 'member' },
        { name: 'Activity Scheduling', order: 2, postingRole: 'member' },
        { name: 'Medication Support', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('ptsd')) {
    roomGroupsConfig.push({
      name: 'PTSD Specific',
      order: 4,
      rooms: [
        { name: 'Trauma Recovery', order: 1, postingRole: 'member' },
        { name: 'EMDR Support', order: 2, postingRole: 'member' },
        { name: 'Grounding Techniques', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('adhd')) {
    roomGroupsConfig.push({
      name: 'ADHD Specific',
      order: 4,
      rooms: [
        { name: 'Focus & Productivity', order: 1, postingRole: 'member' },
        { name: 'Organization Tips', order: 2, postingRole: 'member' },
        { name: 'Medication Management', order: 3, postingRole: 'member' },
      ],
    });
  } else if (community.slug.includes('eating-disorder')) {
    roomGroupsConfig.push({
      name: 'Recovery Focused',
      order: 4,
      rooms: [
        { name: 'Recovery Milestones', order: 1, postingRole: 'member' },
        { name: 'Nutrition Support', order: 2, postingRole: 'member' },
        { name: 'Body Positivity', order: 3, postingRole: 'member' },
      ],
    });
  } else {
    // Generic specialized room group for other conditions
    roomGroupsConfig.push({
      name: 'Specialized Support',
      order: 4,
      rooms: [
        { name: 'Treatment Options', order: 1, postingRole: 'member' },
        { name: 'Progress Tracking', order: 2, postingRole: 'member' },
        { name: 'Peer Support', order: 3, postingRole: 'member' },
      ],
    });
  }

  // Create room groups and rooms
  for (const groupConfig of roomGroupsConfig) {
    // Check if room group already exists
    const existingRoomGroup = await prisma.roomGroup.findFirst({
      where: {
        communityId: community.id,
        name: groupConfig.name,
      },
    });

    let roomGroup;
    if (!existingRoomGroup) {
      roomGroup = await prisma.roomGroup.create({
        data: {
          name: groupConfig.name,
          order: groupConfig.order,
          communityId: community.id,
        },
      });
      console.log(`  ✅ Created room group: ${groupConfig.name}`);
    } else {
      roomGroup = existingRoomGroup;
      console.log(`  ⏭️  Room group already exists: ${groupConfig.name}`);
    }

    // Create rooms for this group
    for (const roomConfig of groupConfig.rooms) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          roomGroupId: roomGroup.id,
          name: roomConfig.name,
        },
      });

      if (!existingRoom) {
        await prisma.room.create({
          data: {
            name: roomConfig.name,
            order: roomConfig.order,
            postingRole: roomConfig.postingRole,
            roomGroupId: roomGroup.id,
          },
        });
        console.log(
          `    ✅ Created room: ${roomConfig.name} (${roomConfig.postingRole}+)`,
        );
      } else {
        console.log(`    ⏭️  Room already exists: ${roomConfig.name}`);
      }
    }
  }
}

async function seedMemberships(users: any[], communities: any[]) {
  console.log('👥 Creating community memberships...');

  const memberships: any[] = [];

  // Get only client and therapist users for community memberships
  const memberUsers = users.filter((user) =>
    ['client', 'therapist'].includes(user.role),
  );

  for (const community of communities) {
    // Each community gets 60-80% of users as members
    const memberCount = Math.floor(
      memberUsers.length * faker.number.float({ min: 0.6, max: 0.8 }),
    );
    const communityMembers = faker.helpers.arrayElements(
      memberUsers,
      memberCount,
    );

    for (const user of communityMembers) {
      try {
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            communityId: community.id,
            role: faker.helpers.arrayElement([
              'member',
              'member',
              'member',
              'moderator',
            ]), // 75% members, 25% moderators
            joinedAt: faker.date.past({ years: 2 }),
          },
        });
        memberships.push(membership);
      } catch (error) {
        // Skip if membership already exists
      }
    }
    console.log(
      `✅ Created memberships for ${community.name}: ${communityMembers.length} members`,
    );
  }

  return memberships;
}

async function seedClientTherapistRelationships(
  clients: any[],
  therapists: any[],
) {
  console.log('🤝 Creating client-therapist relationships...');

  const relationships: any[] = [];
  const assignmentCount = Math.floor(
    clients.length * SEED_CONFIG.RELATIONSHIPS.CLIENT_THERAPIST_RATIO,
  );
  const clientsToAssign = faker.helpers.arrayElements(clients, assignmentCount);

  for (const client of clientsToAssign) {
    const therapist = faker.helpers.arrayElement(therapists);
    const relationship = await prisma.clientTherapist.create({
      data: {
        clientId: client.user.id,
        therapistId: therapist.user.id,
        assignedAt: faker.date.past({ years: 1 }),
        notes: faker.lorem.paragraph(),
      },
    });
    relationships.push({ relationship, client, therapist });
    console.log(
      `✅ Assigned ${client.user.firstName} to therapist ${therapist.user.firstName}`,
    );
  }

  return relationships;
}

async function seedPreAssessments(clients: any[]) {
  console.log('📋 Creating pre-assessments...');

  const assessments: any[] = [];
  const assessmentCount = Math.floor(
    clients.length * SEED_CONFIG.ASSESSMENTS.COMPLETION_RATE,
  );
  const clientsWithAssessments = faker.helpers.arrayElements(
    clients,
    assessmentCount,
  );

  for (const client of clientsWithAssessments) {
    const assessment = await prisma.preAssessment.create({
      data: {
        clientId: client.user.id,
        questionnaires: SeedDataGenerator.generateQuestionnaires(),
        answers: SeedDataGenerator.generateAssessmentResponses(),
        answerMatrix: SeedDataGenerator.generateAnswerMatrix(),
        scores: SeedDataGenerator.generateAssessmentScores(),
        severityLevels: SeedDataGenerator.generateSeverityLevels(),
        aiEstimate: SeedDataGenerator.generateAiEstimate(),
      },
    });
    assessments.push(assessment);
    console.log(`✅ Created pre-assessment for ${client.user.firstName}`);
  }

  return assessments;
}

async function seedMeetings(relationships: any[]) {
  console.log('📅 Creating meetings...');

  const meetings: any[] = [];

  for (const { relationship, client, therapist } of relationships) {
    const meetingCount = faker.number.int({
      min: 1,
      max: SEED_CONFIG.RELATIONSHIPS.MEETINGS_PER_RELATIONSHIP,
    });

    for (let i = 0; i < meetingCount; i++) {
      const startTime = faker.date.between({
        from: relationship.assignedAt,
        to: new Date(),
      });

      const meeting = await prisma.meeting.create({
        data: {
          clientId: client.user.id,
          therapistId: therapist.user.id,
          startTime,
          duration: faker.helpers.arrayElement([45, 60, 90]),
          status: faker.helpers.arrayElement([
            'COMPLETED',
            'COMPLETED',
            'SCHEDULED',
            'CANCELLED',
          ]),
          description: faker.lorem.paragraph(),
          meetingType: faker.helpers.arrayElement([
            'initial',
            'followup',
            'crisis',
            'assessment',
          ]),
        },
      });
      meetings.push(meeting);
    }
    console.log(
      `✅ Created ${meetingCount} meetings for ${client.user.firstName} with ${therapist.user.firstName}`,
    );
  }

  return meetings;
}

async function seedCommunityContent(communities: any[], users: any[]) {
  console.log('📝 Creating community content...');

  const posts: any[] = [];
  const comments: any[] = [];

  for (const community of communities) {
    // Get community members
    const memberships = await prisma.membership.findMany({
      where: { communityId: community.id },
      include: { user: true },
    });

    if (memberships.length === 0) continue;

    // Create room structure for the community
    const roomGroup = await prisma.roomGroup.create({
      data: {
        name: `${community.name} General`,
        order: 1,
        communityId: community.id,
      },
    });

    const room = await prisma.room.create({
      data: {
        name: 'General Discussion',
        order: 1,
        roomGroupId: roomGroup.id,
      },
    });

    // Create posts
    for (let i = 0; i < SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY; i++) {
      const author = faker.helpers.arrayElement(memberships).user;
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 })),
          userId: author?.id,
          roomId: room.id,
          createdAt: faker.date.past({ years: 0.5 }),
        },
      });
      posts.push(post);

      // Create comments for each post
      for (let j = 0; j < SEED_CONFIG.COMMUNITIES.COMMENTS_PER_POST; j++) {
        const commenter = faker.helpers.arrayElement(memberships).user!;
        const comment = await prisma.comment.create({
          data: {
            content: faker.lorem.paragraph(),
            postId: post.id,
            userId: commenter.id,
            createdAt: faker.date.between({
              from: post.createdAt,
              to: new Date(),
            }),
          },
        });
        comments.push(comment);

        // Add some hearts to comments
        if (faker.datatype.boolean({ probability: 0.6 })) {
          const heartGiver = faker.helpers.arrayElement(memberships).user!;
          try {
            await prisma.commentHeart.create({
              data: {
                userId: heartGiver.id,
                commentId: comment.id,
              },
            });
          } catch (error) {
            // Skip if heart already exists
          }
        }
      }

      // Add some hearts to posts
      const heartCount = faker.number.int({
        min: 0,
        max: Math.min(5, memberships.length),
      });
      const heartGivers = faker.helpers.arrayElements(memberships, heartCount);
      for (const heartGiver of heartGivers) {
        try {
          await prisma.postHeart.create({
            data: {
              userId: heartGiver.user!.id,
              postId: post.id,
            },
          });
        } catch (error) {
          // Skip if heart already exists
        }
      }
    }
    console.log(
      `✅ Created content for ${community.name}: ${SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY} posts with comments`,
    );
  }

  return { posts, comments };
}

async function seedTherapistAvailability(therapists: any[]) {
  console.log('📅 Creating therapist availability...');

  const availabilities: any[] = [];

  for (const { user } of therapists) {
    // Create availability for each day of the week
    const daysOfWeek = [1, 2, 3, 4, 5]; // Monday to Friday (1-5)
    const selectedDays = faker.helpers.arrayElements(
      daysOfWeek,
      faker.number.int({ min: 3, max: 5 }),
    );

    for (const dayOfWeek of selectedDays) {
      const availability = await prisma.therapistAvailability.create({
        data: {
          therapistId: user.id,
          dayOfWeek,
          startTime: faker.helpers.arrayElement(['09:00', '10:00', '11:00']),
          endTime: faker.helpers.arrayElement(['16:00', '17:00', '18:00']),
        },
      });
      availabilities.push(availability);
    }
    console.log(`✅ Created availability for therapist ${user.firstName}`);
  }

  return availabilities;
}

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  console.log('📊 Seed configuration:', SEED_CONFIG);

  try {
    // Phase 1: Users
    const { users, clients, therapists } = await seedUsers();

    // Phase 2: Communities
    const communities = await seedCommunities();

    // Phase 3: Memberships
    await seedMemberships(users, communities);

    // Phase 4: Client-Therapist Relationships
    const relationships = await seedClientTherapistRelationships(
      clients,
      therapists,
    );

    // Phase 5: Pre-assessments
    await seedPreAssessments(clients);

    // Phase 6: Meetings
    await seedMeetings(relationships);

    // Phase 7: Community Content
    await seedCommunityContent(communities, users);

    // Phase 8: Therapist Availability
    await seedTherapistAvailability(therapists);

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   👥 Users: ${users.length} total`);
    console.log(`   🔹 Clients: ${clients.length}`);
    console.log(`   🔹 Therapists: ${therapists.length}`);
    console.log(`   🔹 Admins: ${SEED_CONFIG.USERS.ADMINS}`);
    console.log(`   🔹 Moderators: ${SEED_CONFIG.USERS.MODERATORS}`);
    console.log(`   🏘️  Communities: ${communities.length}`);
    console.log(
      `   🤝 Client-Therapist Relationships: ${relationships.length}`,
    );
    console.log(
      `   📅 Meetings: ${relationships.length * SEED_CONFIG.RELATIONSHIPS.MEETINGS_PER_RELATIONSHIP} (average)`,
    );
    console.log(
      `   📋 Pre-assessments: ${Math.floor(clients.length * SEED_CONFIG.ASSESSMENTS.COMPLETION_RATE)}`,
    );
    console.log(
      `   📝 Posts per community: ${SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY}`,
    );
    console.log(
      `   💬 Comments per post: ${SEED_CONFIG.COMMUNITIES.COMMENTS_PER_POST}`,
    );
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
