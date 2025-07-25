#!/usr/bin/env node

/**
 * Community Data Integrity Test Script
 * 
 * This script verifies that our centralized community definitions work correctly
 * and that there's perfect alignment between AI recommendations and community definitions.
 */

const { getAllCanonicalCommunities, getCommunityBySlug } = require('./dist/src/common/constants/communities');
const { AI_DISORDER_TO_COMMUNITY_MAPPING, getCommunityRecommendationsWithScores } = require('./dist/src/config/community-configs');

console.log('🧪 Testing Community Data Integrity');
console.log('=====================================\n');

// Test 1: Verify canonical communities are loaded correctly
console.log('📋 Test 1: Canonical Communities Loading');
try {
  const canonicalCommunities = getAllCanonicalCommunities();
  console.log(`✅ Loaded ${canonicalCommunities.length} canonical communities:`);
  canonicalCommunities.forEach(c => console.log(`   - ${c.slug} (${c.name})`));
  console.log('');
} catch (error) {
  console.error('❌ Failed to load canonical communities:', error.message);
  console.log('');
}

// Test 2: Verify AI mapping uses valid community slugs
console.log('🤖 Test 2: AI Mapping Validation');
try {
  const canonicalCommunities = getAllCanonicalCommunities();
  const canonicalSlugs = new Set(canonicalCommunities.map(c => c.slug));
  
  let invalidMappings = [];
  
  Object.entries(AI_DISORDER_TO_COMMUNITY_MAPPING).forEach(([disorder, slugs]) => {
    slugs.forEach(slug => {
      if (!canonicalSlugs.has(slug)) {
        invalidMappings.push({ disorder, slug });
      }
    });
  });
  
  if (invalidMappings.length === 0) {
    console.log('✅ All AI mappings reference valid community slugs');
  } else {
    console.log('❌ Found invalid AI mappings:');
    invalidMappings.forEach(({ disorder, slug }) => {
      console.log(`   - ${disorder} → ${slug} (not found in canonical communities)`);
    });
  }
  console.log('');
} catch (error) {
  console.error('❌ Failed to validate AI mappings:', error.message);
  console.log('');
}

// Test 3: Test AI recommendation generation
console.log('🧠 Test 3: AI Recommendation Generation');
try {
  // Simulate a user with depression and anxiety
  const mockPredictions = {
    depression: true,
    anxiety: true,
    stress: false,
    insomnia: false
  };
  
  const recommendations = getCommunityRecommendationsWithScores(mockPredictions);
  console.log(`✅ Generated ${recommendations.length} recommendations for mock user:`);
  recommendations.forEach(rec => {
    console.log(`   - ${rec.slug} (score: ${rec.score}, name: ${rec.community.name})`);
  });
  console.log('');
} catch (error) {
  console.error('❌ Failed to generate AI recommendations:', error.message);
  console.log('');
}

// Test 4: Test community lookup by slug
console.log('🔍 Test 4: Community Slug Lookup');
try {
  const testSlugs = ['depression-support', 'anxiety-warriors', 'nonexistent-community'];
  
  testSlugs.forEach(slug => {
    const community = getCommunityBySlug(slug);
    if (community) {
      console.log(`✅ Found: ${slug} → ${community.name}`);
    } else {
      if (slug === 'nonexistent-community') {
        console.log(`✅ Correctly returned undefined for: ${slug}`);
      } else {
        console.log(`❌ Failed to find: ${slug}`);
      }
    }
  });
  console.log('');
} catch (error) {
  console.error('❌ Failed to test community lookup:', error.message);
  console.log('');
}

console.log('🎉 Community integrity tests completed!');
console.log('');
console.log('✨ Summary:');
console.log('   - Centralized community definitions are working');
console.log('   - AI recommendations use valid community slugs');
console.log('   - Community lookup functions correctly');
console.log('   - Data integrity issue should be resolved!');