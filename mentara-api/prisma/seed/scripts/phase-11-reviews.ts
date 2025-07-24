// Phase 11: Therapist Reviews & Ratings
// Creates reviews and ratings for therapists

import { PrismaClient } from '@prisma/client';
import { PhaseResult } from './progress-tracker';
import { seedReviews } from '../reviews.seed';

export async function runPhase11Reviews(
  prisma: PrismaClient,
  relationshipsData: any,
  meetingsData: any,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`⭐ PHASE 11: Creating therapist reviews & ratings (${config} mode)...`);

  try {
    const existingCount = await prisma.review.count();
    if (existingCount > 0) {
      console.log(`⏭️ Found ${existingCount} existing reviews, skipping phase`);
      
      // Return existing data for next phases
      const existingReviews = await prisma.review.findMany();
      
      return {
        success: true,
        message: `Found ${existingCount} existing reviews`,
        skipped: true,
        data: { reviews: existingReviews },
      };
    }

    // Get relationships, meetings, and users from previous phases
    const relationships = relationshipsData?.relationships || [];
    const meetings = meetingsData?.meetings || [];
    const users = usersData?.users || [];

    if (relationships.length === 0) {
      return {
        success: false,
        message: 'No relationships found for review creation',
      };
    }

    // Create reviews for therapists based on client-therapist relationships
    const reviewsResult = await seedReviews(prisma, relationships, meetings, users);

    const reviews = reviewsResult.reviews || [];
    const helpfulVotes = reviewsResult.helpfulVotes || [];

    console.log(`✅ Phase 11 completed: Created ${reviews.length} reviews, ${helpfulVotes.length} helpful votes`);

    return {
      success: true,
      message: `Reviews & ratings phase completed - ${reviews.length} reviews created`,
      data: { reviews, helpfulVotes },
    };

  } catch (error) {
    console.error('❌ Phase 11 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}