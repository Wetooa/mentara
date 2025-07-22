// Enhanced Assessments Seed Module
// Handles creation of comprehensive assessment system data

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG, SIMPLE_SEED_CONFIG } from './config';
import { SeedDataGenerator } from './data-generator';

// Assessment categories with their descriptions and question types
const assessmentCategories = [
  {
    name: 'Anxiety Assessment',
    description: 'Comprehensive anxiety evaluation including GAD-7 and specific phobia assessments',
    assessments: ['GAD-7', 'Social Anxiety', 'Panic Disorder', 'Specific Phobias']
  },
  {
    name: 'Depression Screening',
    description: 'Depression severity assessment using PHQ-9 and related tools',
    assessments: ['PHQ-9', 'Beck Depression Inventory', 'Mood Disorder Questionnaire']
  },
  {
    name: 'Trauma Assessment',
    description: 'PTSD and trauma-related condition evaluation',
    assessments: ['PCL-5', 'Childhood Trauma Questionnaire', 'Acute Stress Disorder']
  },
  {
    name: 'Substance Use Screening',
    description: 'Alcohol and substance abuse assessment tools',
    assessments: ['AUDIT', 'Drug Abuse Screening Test', 'CAGE Questionnaire']
  },
  {
    name: 'Eating Disorder Assessment',
    description: 'Screening for eating disorders and body image issues',
    assessments: ['EAT-26', 'Binge Eating Scale', 'Body Image Assessment']
  },
  {
    name: 'Sleep Assessment',
    description: 'Sleep quality and insomnia evaluation',
    assessments: ['Pittsburgh Sleep Quality Index', 'Insomnia Severity Index', 'Epworth Sleepiness Scale']
  }
];

export async function seedPreAssessments(
  prisma: PrismaClient,
  clients: any[],
  mode: 'simple' | 'comprehensive' = 'comprehensive'
) {
  console.log('📋 Creating comprehensive assessment system...');

  const config = mode === 'simple' ? SIMPLE_SEED_CONFIG : SEED_CONFIG;

  // Create assessment types first
  await createAssessmentTypes(prisma);
  
  // Create pre-assessments for clients
  const assessments: any[] = [];
  const assessmentCount = Math.floor(
    clients.length * config.ASSESSMENTS.COMPLETION_RATE,
  );
  const clientsWithAssessments = faker.helpers.arrayElements(
    clients,
    assessmentCount,
  );

  for (const client of clientsWithAssessments) {
    const isProcessed = faker.datatype.boolean({ probability: 0.9 }); // 90% are processed
    
    const assessment = await prisma.preAssessment.create({
      data: {
        clientId: client.user.id,
        questionnaires: SeedDataGenerator.generateQuestionnaires(),
        answers: SeedDataGenerator.generateAssessmentResponses(),
        answerMatrix: SeedDataGenerator.generateAnswerMatrix(),
        scores: SeedDataGenerator.generateAssessmentScores(),
        severityLevels: SeedDataGenerator.generateSeverityLevels(),
        aiEstimate: SeedDataGenerator.generateAiEstimate(),
        isProcessed,
        processedAt: isProcessed ? faker.date.past({ years: 0.1 }) : null, // Within ~1 month
      },
    });
    assessments.push(assessment);
    
    const status = isProcessed ? '🔄 processed' : '⏳ pending';
    console.log(`✅ Created pre-assessment for ${client.user.firstName} (${status})`);
  }

  console.log(`✅ Successfully created ${assessments.length} pre-assessments`);
  return assessments;
}

async function createAssessmentTypes(prisma: PrismaClient) {
  console.log('🧠 Skipping assessment types creation - using PreAssessment model only...');
  
  // The current schema uses PreAssessment model for assessments
  // This function is kept for future reference when assessment types are implemented
  console.log('⚠️ Assessment and AssessmentQuestion models not available in current schema');
}

function generateQuestionText(assessmentName: string, questionNumber: number): string {
  const questionTemplates = {
    'GAD-7': [
      'Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?',
      'Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?',
      'Over the last 2 weeks, how often have you been bothered by worrying too much about different things?',
      'Over the last 2 weeks, how often have you been bothered by trouble relaxing?'
    ],
    'PHQ-9': [
      'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep?',
      'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?'
    ]
  };

  // Use specific questions if available, otherwise generate generic ones
  if (questionTemplates[assessmentName] && questionTemplates[assessmentName][questionNumber - 1]) {
    return questionTemplates[assessmentName][questionNumber - 1];
  }

  // Generic question templates
  const genericTemplates = [
    `How often do you experience symptoms related to ${assessmentName.toLowerCase()}?`,
    `In the past week, how would you rate your ${assessmentName.toLowerCase().replace('-', ' ')} symptoms?`,
    `How much do these symptoms interfere with your daily activities?`,
    `How distressing are these symptoms for you?`
  ];

  return faker.helpers.arrayElement(genericTemplates);
}
