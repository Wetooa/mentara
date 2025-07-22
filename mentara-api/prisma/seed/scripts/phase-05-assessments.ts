// Phase 5: Pre-Assessments
// Creates mental health assessments for clients

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { seedPreAssessments } from '../assessments.seed';

export async function runPhase05Assessments(
  prisma: PrismaClient,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`📋 PHASE 5: Creating pre-assessments (${config} mode)...`);

  try {
    // Check if assessments already exist (idempotent check)
    const existingCount = await prisma.preAssessment.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing assessments, skipping phase`);
      return {
        success: true,
        message: `Found ${existingCount} existing assessments`,
        skipped: true,
      };
    }

    // Get clients from users data
    const clients = usersData.clients || [];
    if (clients.length === 0) {
      return {
        success: false,
        message: 'No clients found in users data for assessment creation',
      };
    }

    // Create pre-assessments using the existing seed function
    const assessments = await seedPreAssessments(prisma, clients, config);

    console.log(`✅ Phase 5 completed: Created ${assessments.length} pre-assessments`);

    return {
      success: true,
      message: `Pre-assessments phase completed - ${assessments.length} assessments created`,
      data: { assessments },
    };

  } catch (error) {
    console.error('❌ Phase 5 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}