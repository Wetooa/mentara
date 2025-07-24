#!/usr/bin/env node

/**
 * Community Data Integrity Verification Script
 * 
 * This script checks for mismatches between:
 * 1. Community configurations used for AI recommendations
 * 2. Communities actually seeded in the database
 */

const { PrismaClient } = require('@prisma/client');
const { AI_DISORDER_TO_COMMUNITY_MAPPING } = require('./src/config/community-configs');

const prisma = new PrismaClient();

async function verifyDataIntegrity() {
  console.log('🔍 Verifying Community Data Integrity');
  console.log('=====================================\n');

  try {
    // Get all communities from database
    const dbCommunities = await prisma.community.findMany({
      select: { name: true, slug: true }
    });

    console.log(`📊 Found ${dbCommunities.length} communities in database:`);
    dbCommunities.forEach(c => console.log(`  - ${c.slug} (${c.name})`));
    console.log('');

    // Get all community slugs expected by AI recommendations
    const aiRecommendedSlugs = new Set();
    Object.values(AI_DISORDER_TO_COMMUNITY_MAPPING).forEach(slugs => {
      slugs.forEach(slug => aiRecommendedSlugs.add(slug));
    });

    console.log(`🤖 AI system expects ${aiRecommendedSlugs.size} community slugs:`);
    Array.from(aiRecommendedSlugs).forEach(slug => console.log(`  - ${slug}`));
    console.log('');

    // Find mismatches
    const dbSlugs = new Set(dbCommunities.map(c => c.slug));
    const missingSlugs = Array.from(aiRecommendedSlugs).filter(slug => !dbSlugs.has(slug));
    const extraSlugs = Array.from(dbSlugs).filter(slug => !aiRecommendedSlugs.has(slug));

    if (missingSlugs.length > 0) {
      console.log('❌ CRITICAL: Missing communities in database:');
      missingSlugs.forEach(slug => console.log(`  - ${slug}`));
      console.log('');
    }

    if (extraSlugs.length > 0) {
      console.log('⚠️  Extra communities in database (not used by AI):');
      extraSlugs.forEach(slug => console.log(`  - ${slug}`));
      console.log('');
    }

    if (missingSlugs.length === 0 && extraSlugs.length === 0) {
      console.log('✅ Perfect alignment between AI recommendations and database!');
    } else {
      console.log('💥 DATA INTEGRITY ISSUE DETECTED!');
      console.log(`   Missing: ${missingSlugs.length}, Extra: ${extraSlugs.length}`);
      console.log('   This is likely the cause of foreign key constraint errors.');
    }

    return { missingSlugs, extraSlugs, dbCommunities };

  } catch (error) {
    console.error('Error during verification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyDataIntegrity()
  .then(result => {
    console.log('\n📋 Verification completed.');
    if (result.missingSlugs.length > 0) {
      process.exit(1); // Exit with error code
    }
  })
  .catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });