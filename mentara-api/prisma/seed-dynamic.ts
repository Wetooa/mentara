#!/usr/bin/env tsx
/**
 * Dynamic Database Seeding
 *
 * Intelligent, idempotent seeding that ensures minimum data requirements
 * Can be run multiple times safely - only adds missing data
 *
 * Usage:
 *   npm run db:seed:dynamic      # Ensure minimum data exists
 *   npm run db:seed:dynamic:audit # Just show what's missing
 */

import { PrismaClient } from '@prisma/client';
import { DynamicSeedOrchestrator } from './seed/dynamic/dynamic-seed-orchestrator';
import {
  DEFAULT_MINIMUM_REQUIREMENTS,
  getRequirementsForMode,
} from './seed/dynamic/minimum-requirements';

const prisma = new PrismaClient();

async function main() {
  const mode = (process.argv[2] as 'light' | 'medium' | 'heavy') ?? 'medium';
  const auditOnly = process.argv.includes('--audit');

  console.log('🌱 Mentara Dynamic Database Seeding');
  console.log('=====================================');
  console.log(`📊 Mode: ${mode}`);
  console.log(`🔍 Audit Only: ${auditOnly ? 'Yes' : 'No'}`);
  console.log('');

  try {
    const requirements = getRequirementsForMode(mode);
    const orchestrator = new DynamicSeedOrchestrator(requirements);

    const report = await orchestrator.ensureMinimumData(prisma);

    console.log('\n📊 SEEDING REPORT');
    console.log('==================');
    console.log(`✅ Satisfied: ${report.satisfied ? 'Yes' : 'No'}`);
    console.log(`⏱️  Duration: ${(report.duration / 1000).toFixed(2)}s`);
    console.log('\n📈 Items Added:');
    Object.entries(report.itemsAdded).forEach(([key, value]) => {
      if (value > 0) {
        console.log(`   - ${key}: ${value}`);
      }
    });

    if (!report.satisfied) {
      console.log('\n⚠️  Some requirements not fully satisfied');
      console.log(`   Remaining gaps: ${report.gaps.length}`);
    } else {
      console.log('\n🎉 All minimum requirements satisfied!');
    }
  } catch (error) {
    console.error('❌ Dynamic seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
