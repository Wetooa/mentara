// NOTE: Comprehensive database seeding with realistic data
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { ILLNESS_COMMUNITIES } from '../src/communities/illness-communities.config';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

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
      id: uuidv4(),
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
      providerType: faker.helpers.arrayElement(['Individual', 'Group Practice', 'Hospital']),
      professionalLicenseType: faker.helpers.arrayElement(['LCSW', 'LPC', 'LMFT', 'Psychologist', 'MD']),
      isPRCLicensed: faker.datatype.boolean() ? 'Yes' : 'No',
      prcLicenseNumber: `PRC-${faker.string.numeric(8)}`,
      expirationDateOfLicense: faker.date.future({ years: 3 }),
      practiceStartDate: faker.date.past({ years: 15 }),
      areasOfExpertise: faker.helpers.arrayElements([
        'Anxiety Disorders', 'Depression', 'PTSD', 'Couples Therapy', 'Family Therapy',
        'Addiction Recovery', 'Eating Disorders', 'Bipolar Disorder', 'ADHD', 'Autism Spectrum',
        'Grief Counseling', 'Anger Management', 'Sleep Disorders', 'Chronic Pain', 'OCD'
      ], { min: 2, max: 6 }),
      assessmentTools: faker.helpers.arrayElements([
        'PHQ-9', 'GAD-7', 'AUDIT', 'BDI-II', 'MMPI-2', 'ASRS', 'PCL-5', 'MDQ'
      ], { min: 2, max: 5 }),
      therapeuticApproachesUsedList: faker.helpers.arrayElements([
        'CBT', 'DBT', 'Psychodynamic', 'Humanistic', 'EMDR', 'ACT', 'IFS', 'Gestalt'
      ], { min: 2, max: 4 }),
      languagesOffered: faker.helpers.arrayElements([
        'English', 'Spanish', 'Mandarin', 'Tagalog', 'French', 'Korean', 'Arabic'
      ], { min: 1, max: 3 }),
      providedOnlineTherapyBefore: faker.datatype.boolean(),
      comfortableUsingVideoConferencing: true,
      preferredSessionLength: faker.helpers.arrayElements([30, 45, 60, 90], { min: 1, max: 3 }),
      privateConfidentialSpace: 'Yes',
      compliesWithDataPrivacyAct: true,
      professionalLiabilityInsurance: 'Yes',
      complaintsOrDisciplinaryActions: faker.datatype.boolean({ probability: 0.1 }) ? faker.lorem.sentence() : 'None',
      willingToAbideByPlatformGuidelines: true,
      expertise: faker.helpers.arrayElements([
        'Anxiety Disorders', 'Mood Disorders', 'Trauma Recovery', 'Relationship Issues',
        'Addiction Treatment', 'Eating Disorder Recovery', 'LGBTQ+ Affirmative Therapy'
      ], { min: 2, max: 4 }),
      approaches: faker.helpers.arrayElements([
        'Cognitive Behavioral Therapy', 'Mindfulness-Based Therapy', 'Solution-Focused Therapy',
        'Psychodynamic Therapy', 'Dialectical Behavior Therapy'
      ], { min: 1, max: 3 }),
      languages: faker.helpers.arrayElements(['English', 'Spanish', 'Tagalog', 'Mandarin'], { min: 1, max: 2 }),
      illnessSpecializations: faker.helpers.arrayElements([
        'Depression', 'Anxiety', 'PTSD', 'Bipolar Disorder', 'ADHD', 'Eating Disorders'
      ], { min: 1, max: 4 }),
      acceptTypes: faker.helpers.arrayElements([
        'Individual', 'Couples', 'Family', 'Group'
      ], { min: 1, max: 3 }),
      treatmentSuccessRates: {
        anxiety: faker.number.float({ min: 0.65, max: 0.95, fractionDigits: 2 }),
        depression: faker.number.float({ min: 0.60, max: 0.90, fractionDigits: 2 }),
        trauma: faker.number.float({ min: 0.70, max: 0.88, fractionDigits: 2 }),
      },
      sessionLength: faker.helpers.arrayElement(['45 minutes', '60 minutes', '90 minutes']),
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
      depression: faker.helpers.arrayElement(['minimal', 'mild', 'moderate', 'moderately_severe', 'severe']),
      anxiety: faker.helpers.arrayElement(['minimal', 'mild', 'moderate', 'severe']),
      substance_use: faker.helpers.arrayElement(['low_risk', 'hazardous', 'harmful', 'dependent']),
      sleep_disorder: faker.helpers.arrayElement(['no_clinically_significant', 'subthreshold', 'moderate', 'severe']),
      panic_disorder: faker.helpers.arrayElement(['minimal', 'mild', 'moderate', 'severe']),
    };
  }
}

async function seedUsers() {
  console.log('👥 Creating users...');
  
  const users = [];
  
  // Create admin users
  for (let i = 0; i < SEED_CONFIG.USERS.ADMINS; i++) {
    const userData = SeedDataGenerator.generateUserData('admin', {
      email: `admin${i + 1}@mentara.com`,
      firstName: 'Admin',
      lastName: `User ${i + 1}`,
    });
    users.push(await prisma.user.create({ data: userData }));
    console.log(`✅ Created admin: ${userData.firstName} ${userData.lastName}`);
  }

  // Create moderator users
  for (let i = 0; i < SEED_CONFIG.USERS.MODERATORS; i++) {
    const userData = SeedDataGenerator.generateUserData('moderator', {
      email: `moderator${i + 1}@mentara.com`,
      firstName: 'Moderator',
      lastName: `User ${i + 1}`,
    });
    users.push(await prisma.user.create({ data: userData }));
    console.log(`✅ Created moderator: ${userData.firstName} ${userData.lastName}`);
  }

  // Create client users
  const clients = [];
  for (let i = 0; i < SEED_CONFIG.USERS.CLIENTS; i++) {
    const userData = SeedDataGenerator.generateUserData('client');
    const user = await prisma.user.create({ data: userData });
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: faker.datatype.boolean(),
      },
    });
    clients.push({ user, client });
    users.push(user);
    console.log(`✅ Created client: ${userData.firstName} ${userData.lastName}`);
  }

  // Create therapist users
  const therapists = [];
  for (let i = 0; i < SEED_CONFIG.USERS.THERAPISTS; i++) {
    const userData = SeedDataGenerator.generateUserData('therapist');
    const user = await prisma.user.create({ data: userData });
    const therapistData = SeedDataGenerator.generateTherapistData();
    const therapist = await prisma.therapist.create({
      data: {
        userId: user.id,
        ...therapistData,
      },
    });
    therapists.push({ user, therapist });
    users.push(user);
    console.log(`✅ Created therapist: ${userData.firstName} ${userData.lastName}`);
  }

  return { users, clients, therapists };
}

async function seedCommunities() {
  console.log('🏘️  Creating communities...');
  
  const communities = [];

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
  }

  // Create additional general communities
  const additionalCommunityTypes = [
    { name: 'Mindfulness & Meditation', description: 'A space for sharing mindfulness practices and meditation experiences' },
    { name: 'Support Circle', description: 'General support for anyone going through difficult times' },
    { name: 'Wellness Warriors', description: 'Focusing on physical and mental wellness together' },
    { name: 'Creative Therapy', description: 'Using art, music, and creativity for healing' },
    { name: 'Family & Relationships', description: 'Navigating family dynamics and relationship challenges' },
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
  }

  return communities;
}

async function seedMemberships(users: any[], communities: any[]) {
  console.log('👥 Creating community memberships...');
  
  const memberships = [];
  
  // Get only client and therapist users for community memberships
  const memberUsers = users.filter(user => ['client', 'therapist'].includes(user.role));
  
  for (const community of communities) {
    // Each community gets 60-80% of users as members
    const memberCount = Math.floor(memberUsers.length * faker.number.float({ min: 0.6, max: 0.8 }));
    const communityMembers = faker.helpers.arrayElements(memberUsers, memberCount);
    
    for (const user of communityMembers) {
      try {
        const membership = await prisma.membership.create({
          data: {
            userId: user.id,
            communityId: community.id,
            role: faker.helpers.arrayElement(['member', 'member', 'member', 'moderator']), // 75% members, 25% moderators
            joinedAt: faker.date.past({ years: 2 }),
          },
        });
        memberships.push(membership);
      } catch (error) {
        // Skip if membership already exists
      }
    }
    console.log(`✅ Created memberships for ${community.name}: ${communityMembers.length} members`);
  }
  
  return memberships;
}

async function seedClientTherapistRelationships(clients: any[], therapists: any[]) {
  console.log('🤝 Creating client-therapist relationships...');
  
  const relationships = [];
  const assignmentCount = Math.floor(clients.length * SEED_CONFIG.RELATIONSHIPS.CLIENT_THERAPIST_RATIO);
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
    console.log(`✅ Assigned ${client.user.firstName} to therapist ${therapist.user.firstName}`);
  }
  
  return relationships;
}

async function seedPreAssessments(clients: any[]) {
  console.log('📋 Creating pre-assessments...');
  
  const assessments = [];
  const assessmentCount = Math.floor(clients.length * SEED_CONFIG.ASSESSMENTS.COMPLETION_RATE);
  const clientsWithAssessments = faker.helpers.arrayElements(clients, assessmentCount);
  
  for (const client of clientsWithAssessments) {
    const assessment = await prisma.preAssessment.create({
      data: {
        userId: client.user.id,
        responses: SeedDataGenerator.generateAssessmentResponses(),
        scores: SeedDataGenerator.generateAssessmentScores(),
        severityLevels: SeedDataGenerator.generateSeverityLevels(),
        completedAt: faker.date.past({ months: 6 }),
      },
    });
    assessments.push(assessment);
    console.log(`✅ Created pre-assessment for ${client.user.firstName}`);
  }
  
  return assessments;
}

async function seedMeetings(relationships: any[]) {
  console.log('📅 Creating meetings...');
  
  const meetings = [];
  
  for (const { relationship, client, therapist } of relationships) {
    const meetingCount = faker.number.int({ min: 1, max: SEED_CONFIG.RELATIONSHIPS.MEETINGS_PER_RELATIONSHIP });
    
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
          status: faker.helpers.arrayElement(['COMPLETED', 'COMPLETED', 'SCHEDULED', 'CANCELLED']),
          notes: faker.lorem.paragraph(),
          meetingType: faker.helpers.arrayElement(['initial', 'followup', 'crisis', 'assessment']),
        },
      });
      meetings.push(meeting);
    }
    console.log(`✅ Created ${meetingCount} meetings for ${client.user.firstName} with ${therapist.user.firstName}`);
  }
  
  return meetings;
}

async function seedCommunityContent(communities: any[], users: any[]) {
  console.log('📝 Creating community content...');
  
  const posts = [];
  const comments = [];
  
  for (const community of communities) {
    // Get community members
    const memberships = await prisma.membership.findMany({
      where: { communityId: community.id },
      include: { user: true },
    });
    
    if (memberships.length === 0) continue;
    
    // Create posts
    for (let i = 0; i < SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY; i++) {
      const author = faker.helpers.arrayElement(memberships).user;
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 5 })),
          authorId: author.id,
          communityId: community.id,
          isAnonymous: faker.datatype.boolean({ probability: 0.3 }),
          createdAt: faker.date.past({ months: 6 }),
        },
      });
      posts.push(post);
      
      // Create comments for each post
      for (let j = 0; j < SEED_CONFIG.COMMUNITIES.COMMENTS_PER_POST; j++) {
        const commenter = faker.helpers.arrayElement(memberships).user;
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
          const heartGiver = faker.helpers.arrayElement(memberships).user;
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
      const heartCount = faker.number.int({ min: 0, max: Math.min(5, memberships.length) });
      const heartGivers = faker.helpers.arrayElements(memberships, heartCount);
      for (const heartGiver of heartGivers) {
        try {
          await prisma.postHeart.create({
            data: {
              userId: heartGiver.user.id,
              postId: post.id,
            },
          });
        } catch (error) {
          // Skip if heart already exists
        }
      }
    }
    console.log(`✅ Created content for ${community.name}: ${SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY} posts with comments`);
  }
  
  return { posts, comments };
}

async function seedTherapistAvailability(therapists: any[]) {
  console.log('📅 Creating therapist availability...');
  
  const availabilities = [];
  
  for (const { therapist, user } of therapists) {
    // Create availability for each day of the week
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    const selectedDays = faker.helpers.arrayElements(daysOfWeek, faker.number.int({ min: 3, max: 5 }));
    
    for (const dayOfWeek of selectedDays) {
      const availability = await prisma.therapistAvailability.create({
        data: {
          therapistId: user.id,
          dayOfWeek,
          startTime: faker.helpers.arrayElement(['09:00:00', '10:00:00', '11:00:00']),
          endTime: faker.helpers.arrayElement(['16:00:00', '17:00:00', '18:00:00']),
          timezone: 'America/New_York',
          isRecurring: true,
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
    const relationships = await seedClientTherapistRelationships(clients, therapists);
    
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
    console.log(`   🤝 Client-Therapist Relationships: ${relationships.length}`);
    console.log(`   📅 Meetings: ${relationships.length * SEED_CONFIG.RELATIONSHIPS.MEETINGS_PER_RELATIONSHIP} (average)`);
    console.log(`   📋 Pre-assessments: ${Math.floor(clients.length * SEED_CONFIG.ASSESSMENTS.COMPLETION_RATE)}`);
    console.log(`   📝 Posts per community: ${SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY}`);
    console.log(`   💬 Comments per post: ${SEED_CONFIG.COMMUNITIES.COMMENTS_PER_POST}`);

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