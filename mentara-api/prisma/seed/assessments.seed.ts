// Enhanced Assessments Seed Module
// Handles creation of comprehensive assessment system data

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';
import { SeedDataGenerator } from './data-generator';

export async function seedPreAssessments(
  prisma: PrismaClient,
  clients: any[],
  mode: 'simple' | 'comprehensive' = 'comprehensive'
) {
  console.log('📋 Creating comprehensive assessment system...');

  const config = SEED_CONFIG;

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
        answers: SeedDataGenerator.generateAnswerMatrix(), // Use flat array of 201 responses
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
