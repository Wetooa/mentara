import { faker } from '@faker-js/faker';
import { PrismaService } from '../providers/prisma-client.provider';
import { v4 as uuidv4 } from 'uuid';

export class TestDataFactory {
  constructor(private prisma: PrismaService) {}

  // User Factory
  createUserData(overrides: Partial<any> = {}) {
    return {
      id: uuidv4(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      middleName: faker.person.middleName(),
      lastName: faker.person.lastName(),
      birthDate: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
      address: faker.location.streetAddress(),
      avatarUrl: faker.image.avatar(),
      role: 'client',
      bio: faker.lorem.paragraph(),
      coverImageUrl: faker.image.url(),
      isActive: true,
      ...overrides,
    };
  }

  async createUser(overrides: Partial<any> = {}) {
    const userData = this.createUserData(overrides);
    return await this.prisma.user.create({ data: userData });
  }

  // Client Factory
  async createClient(userOverrides: Partial<any> = {}) {
    const user = await this.createUser({ role: 'client', ...userOverrides });
    return await this.prisma.client.create({
      data: {
        userId: user.id,
        hasSeenTherapistRecommendations: false,
      },
      include: { user: true },
    });
  }

  // Therapist Factory
  createTherapistData(userOverrides: Partial<any> = {}) {
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
      ]),
      isPRCLicensed: faker.datatype.boolean() ? 'Yes' : 'No',
      prcLicenseNumber: `PRC-${faker.string.numeric(8)}`,
      expirationDateOfLicense: faker.date.future({ years: 3 }),
      practiceStartDate: faker.date.past({ years: 10 }),
      areasOfExpertise: faker.helpers.arrayElements(
        [
          'Anxiety',
          'Depression',
          'PTSD',
          'Couples Therapy',
          'Family Therapy',
          'Addiction',
          'Eating Disorders',
          'Bipolar Disorder',
        ],
        { min: 2, max: 5 },
      ),
      assessmentTools: faker.helpers.arrayElements(
        ['PHQ-9', 'GAD-7', 'AUDIT', 'BDI-II', 'MMPI-2'],
        { min: 1, max: 3 },
      ),
      therapeuticApproachesUsedList: faker.helpers.arrayElements(
        ['CBT', 'DBT', 'Psychodynamic', 'Humanistic', 'EMDR'],
        { min: 1, max: 3 },
      ),
      languagesOffered: faker.helpers.arrayElements(
        ['English', 'Spanish', 'Mandarin', 'Tagalog', 'French'],
        { min: 1, max: 2 },
      ),
      providedOnlineTherapyBefore: faker.datatype.boolean(),
      comfortableUsingVideoConferencing: faker.datatype.boolean(),
      preferredSessionLength: faker.helpers.arrayElements([30, 45, 60, 90], {
        min: 1,
        max: 2,
      }),
      privateConfidentialSpace: faker.datatype.boolean() ? 'Yes' : 'No',
      compliesWithDataPrivacyAct: true,
      professionalLiabilityInsurance: faker.datatype.boolean() ? 'Yes' : 'No',
      complaintsOrDisciplinaryActions: faker.datatype.boolean()
        ? faker.lorem.sentence()
        : 'None',
      willingToAbideByPlatformGuidelines: true,
      expertise: faker.helpers.arrayElements(
        [
          'Anxiety Disorders',
          'Mood Disorders',
          'Trauma Recovery',
          'Relationship Issues',
        ],
        { min: 1, max: 3 },
      ),
      approaches: faker.helpers.arrayElements(
        [
          'Cognitive Behavioral Therapy',
          'Mindfulness-Based Therapy',
          'Solution-Focused Therapy',
        ],
        { min: 1, max: 2 },
      ),
      languages: faker.helpers.arrayElements(
        ['English', 'Spanish', 'Tagalog'],
        { min: 1, max: 2 },
      ),
      illnessSpecializations: faker.helpers.arrayElements(
        ['Depression', 'Anxiety', 'PTSD', 'Bipolar Disorder'],
        { min: 1, max: 3 },
      ),
      acceptTypes: faker.helpers.arrayElements(
        ['Individual', 'Couples', 'Family', 'Group'],
        { min: 1, max: 2 },
      ),
      treatmentSuccessRates: {
        anxiety: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 2 }),
        depression: faker.number.float({
          min: 0.6,
          max: 0.95,
          fractionDigits: 2,
        }),
      },
      sessionLength: faker.helpers.arrayElement([
        '30 minutes',
        '45 minutes',
        '60 minutes',
      ]),
      hourlyRate: faker.number.float({ min: 80, max: 200, fractionDigits: 2 }),
      status: 'approved',
      ...userOverrides,
    };
  }

  async createTherapist(userOverrides: Partial<any> = {}) {
    const user = await this.createUser({ role: 'therapist', ...userOverrides });
    const therapistData = this.createTherapistData();

    return await this.prisma.therapist.create({
      data: {
        userId: user.id,
        ...therapistData,
        status: 'APPROVED' as const,
      },
      include: { user: true },
    });
  }

  // Community Factory
  async createCommunity(overrides: Partial<any> = {}) {
    const communityData = {
      name: faker.company.name() + ' Support Group',
      description: faker.lorem.paragraph(),
      slug: faker.lorem.slug(),
      imageUrl: faker.image.url(),
      ...overrides,
    };

    return await this.prisma.community.create({ data: communityData });
  }

  // Meeting Factory
  async createMeeting(
    clientId: string,
    therapistId: string,
    overrides: Partial<any> = {},
  ) {
    const meetingData = {
      clientId,
      therapistId,
      startTime: faker.date.future(),
      duration: faker.helpers.arrayElement([30, 45, 60]),
      status: 'SCHEDULED' as any,
      description: faker.lorem.paragraph(),
      ...overrides,
    };

    return await this.prisma.meeting.create({ data: meetingData });
  }

  // Pre-assessment Factory
  async createPreAssessment(userId: string, overrides: Partial<any> = {}) {
    const assessmentData = {
      clientId: userId,
      questionnaires: this.generateQuestionnaires(),
      answers: this.generateAssessmentResponses(),
      answerMatrix: this.generateAnswerMatrix(),
      scores: this.generateAssessmentScores(),
      severityLevels: this.generateSeverityLevels(),
      aiEstimate: this.generateAiEstimate(),
      ...overrides,
    };

    return await this.prisma.preAssessment.create({ data: assessmentData });
  }

  // Post Factory
  async createPost(
    authorId: string,
    communityId: string,
    overrides: Partial<any> = {},
  ) {
    const postData = {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      userId: authorId,
      roomId: communityId,
      ...overrides,
    };

    return await this.prisma.post.create({ data: postData });
  }

  // Comment Factory
  async createComment(
    postId: string,
    userId: string,
    overrides: Partial<any> = {},
  ) {
    const commentData = {
      content: faker.lorem.paragraph(),
      postId,
      userId,
      ...overrides,
    };

    return await this.prisma.comment.create({ data: commentData });
  }

  // Helper methods for complex data structures
  private generateAssessmentResponses() {
    const responses = {};
    // Generate responses for different assessment tools
    for (let i = 1; i <= 201; i++) {
      responses[`q${i}`] = faker.number.int({ min: 0, max: 4 });
    }
    return responses;
  }

  private generateAssessmentScores() {
    return {
      PHQ: faker.number.int({ min: 0, max: 27 }),
      GAD7: faker.number.int({ min: 0, max: 21 }),
      AUDIT: faker.number.int({ min: 0, max: 40 }),
      // Add more assessment scores as needed
    };
  }

  private generateSeverityLevels() {
    return {
      depression: faker.helpers.arrayElement([
        'minimal',
        'mild',
        'moderate',
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
    };
  }

  private generateQuestionnaires() {
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

  private generateAnswerMatrix() {
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

  private generateAiEstimate() {
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

  // Bulk creation methods
  async createMultipleUsers(count: number, overrides: Partial<any> = {}) {
    const users: any[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.createUser(overrides));
    }
    return users;
  }

  async createMultipleTherapists(count: number, overrides: Partial<any> = {}) {
    const therapists: any[] = [];
    for (let i = 0; i < count; i++) {
      therapists.push(await this.createTherapist(overrides));
    }
    return therapists;
  }

  async createMultipleClients(count: number, overrides: Partial<any> = {}) {
    const clients: any[] = [];
    for (let i = 0; i < count; i++) {
      clients.push(await this.createClient(overrides));
    }
    return clients;
  }

  // Test scenario builders
  async createCompleteTherapyScenario() {
    // Create a client and therapist
    const client = await this.createClient();
    const therapist = await this.createTherapist();

    // Create client-therapist relationship
    await this.prisma.clientTherapist.create({
      data: {
        clientId: client.userId,
        therapistId: therapist.userId,
        assignedAt: faker.date.past(),
      },
    });

    // Create pre-assessment
    const preAssessment = await this.createPreAssessment(client.userId);

    // Create some meetings
    const meetings: any[] = [];
    for (let i = 0; i < 3; i++) {
      meetings.push(
        await this.createMeeting(client.userId, therapist.userId, {
          startTime: faker.date.future({ years: (7 * (i + 1)) / 365 }),
        }),
      );
    }

    return {
      client,
      therapist,
      preAssessment,
      meetings,
    };
  }

  async createCommunityWithContent() {
    const community = await this.createCommunity();
    const users = await this.createMultipleUsers(5);

    // Create memberships
    for (const user of users) {
      await this.prisma.membership.create({
        data: {
          userId: user.id,
          communityId: community.id,
          role: 'MEMBER',
        },
      });
    }

    // Create posts and comments
    const posts: any[] = [];
    for (let i = 0; i < 3; i++) {
      const post = await this.createPost(
        faker.helpers.arrayElement(users).id,
        community.id,
      );
      posts.push(post);

      // Add comments to each post
      for (let j = 0; j < 2; j++) {
        await this.createComment(post.id, faker.helpers.arrayElement(users).id);
      }
    }

    return {
      community,
      users,
      posts,
    };
  }
}
