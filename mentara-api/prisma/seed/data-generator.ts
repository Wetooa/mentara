// Seed Data Generator Utilities
// Centralized fake data generation for seeding

import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export class SeedDataGenerator {
  static generateUserData(role: string, specificData: any = {}) {
    // Simple dummy password for all seeded users (unless specified in specificData)
    const defaultPassword = 'password123';
    const password = specificData.password || defaultPassword;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
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
      emailVerified: true, // Set to true for test accounts to enable login
      ...specificData,
      password: hashedPassword, // Hashed dummy password (overrides any from specificData)
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
      status: 'APPROVED',
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
    // Create a 1D array of exactly 201 elements for AI evaluation
    // This matches the format expected by the frontend conversion utility
    const matrix: number[] = new Array(201).fill(0);
    
    // Realistic assessment ranges based on frontend startIndices
    const assessmentRanges = [
      { start: 0, end: 14, name: 'Phobia' },           // PHQ: 15 questions
      { start: 15, end: 32, name: 'ADD/ADHD' },        // ASRS: 18 questions  
      { start: 33, end: 42, name: 'Substance Use' },   // AUDIT: 10 questions
      { start: 43, end: 58, name: 'Binge Eating' },    // BES: 16 questions
      { start: 69, end: 75, name: 'Anxiety' },         // GAD7: 7 questions
      { start: 76, end: 82, name: 'Insomnia' },        // ISI: 7 questions
      { start: 83, end: 104, name: 'Burnout' },        // MBI: 22 questions
      { start: 105, end: 117, name: 'Bipolar' },       // MDQ: 13 questions
      { start: 120, end: 137, name: 'OCD' },           // OCI_R: 18 questions
      { start: 138, end: 157, name: 'PTSD' },          // PCL5: 20 questions
      { start: 158, end: 164, name: 'Panic' },         // PDSS: 7 questions
      { start: 165, end: 173, name: 'Depression' },    // PHQ9: 9 questions
      { start: 174, end: 183, name: 'Stress' },        // PSS: 10 questions
      { start: 184, end: 200, name: 'Social Anxiety' } // SPIN: 17 questions
    ];
    
    // Simulate realistic responses for 2-4 assessment categories per person
    const selectedAssessments = faker.helpers.arrayElements(assessmentRanges, { min: 2, max: 4 });
    
    for (const assessment of selectedAssessments) {
      // Generate realistic responses for this assessment category
      // Most mental health assessments use 0-4 scale (never, rarely, sometimes, often, always)
      for (let i = assessment.start; i <= assessment.end; i++) {
        if (i < 201) { // Safety check
          // Weighted towards lower scores (most people don't have severe symptoms)
          const responseOptions = [0, 0, 0, 1, 1, 2, 2, 3, 4]; // 3x more likely to be 0, etc.
          matrix[i] = faker.helpers.arrayElement(responseOptions);
        }
      }
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