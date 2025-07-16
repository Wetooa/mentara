// Assessments Seed Module
// Handles creation of pre-assessment data

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';
import { SeedDataGenerator } from './data-generator';

export async function seedPreAssessments(
  prisma: PrismaClient,
  clients: any[]
) {
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
