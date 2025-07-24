// Phase 10: Worksheets & Therapy Materials
// Creates therapy worksheets and assignments

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';

export async function runPhase10Worksheets(
  prisma: PrismaClient,
  relationshipsData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`📚 PHASE 10: Creating worksheets & therapy materials (${config} mode)...`);

  try {
    const existingCount = await prisma.worksheet.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing worksheets, skipping phase`);
      return {
        success: true,
        message: `Found ${existingCount} existing worksheets`,
        skipped: true,
      };
    }

    // Import and call the actual worksheet seeding function
    const { seedWorksheets } = await import('../worksheets.seed');
    const result = await seedWorksheets(prisma, relationshipsData.relationships || []);
    
    const totalWorksheets = result.worksheets?.length || 0;

    console.log(`✅ Phase 10 completed: ${totalWorksheets} worksheets & therapy materials created`);

    return {
      success: true,
      message: `Created ${totalWorksheets} worksheets and therapy materials`,
      data: result,
    };

  } catch (error) {
    console.error('❌ Phase 10 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}