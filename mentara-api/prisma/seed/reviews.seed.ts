// Reviews Seed Module
// Handles creation of therapist reviews and helpful votes

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedReviews(
  prisma: PrismaClient,
  relationships: any[],
  meetings: any[],
  allUsers: any[]
) {
  console.log('⭐ Creating therapist reviews...');

  const reviews: any[] = [];
  const helpfulVotes: any[] = [];

  // Create reviews for established client-therapist relationships
  for (const { relationship, client, therapist } of relationships) {
    try {
      // Only create reviews for relationships that have been active for a while
      const relationshipAge = Date.now() - new Date(relationship.assignedAt).getTime();
      const hasBeenActiveForMonth = relationshipAge > 30 * 24 * 60 * 60 * 1000; // 30 days

      // Higher probability of review if relationship has been active longer
      const reviewProbability = hasBeenActiveForMonth ? 0.7 : 0.3;
      
      if (!faker.datatype.boolean({ probability: reviewProbability })) {
        continue;
      }

      // Get meetings for this relationship to optionally link review to specific meeting
      const relationshipMeetings = meetings.filter(
        meeting => 
          meeting.clientId === client.client.userId && 
          meeting.therapistId === therapist.therapist.userId &&
          meeting.status === 'COMPLETED'
      );

      // Optionally link to a specific meeting (30% chance)
      const linkedMeeting = faker.datatype.boolean({ probability: 0.3 }) && relationshipMeetings.length > 0
        ? faker.helpers.arrayElement(relationshipMeetings)
        : null;

      // Generate realistic rating with positive skew
      const rating = generateRealisticRating();

      // Determine if review should be anonymous
      const isAnonymous = faker.datatype.boolean({ probability: 0.3 });

      // Generate review content based on rating
      const { title, content } = generateReviewContent(rating, therapist.user.firstName);

      // Create the review
      const review = await prisma.review.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          meetingId: linkedMeeting?.id || null,
          rating,
          title,
          content,
          isAnonymous,
          isVerified: true, // Mark as verified since from real client-therapist relationship
          createdAt: faker.date.between({
            from: relationship.assignedAt,
            to: new Date(),
          }),
        },
      });
      reviews.push(review);

      console.log(
        `✅ Created ${rating}-star review from ${client.user.firstName} for ${therapist.user.firstName}`
      );
    } catch (error) {
      console.error(
        `Failed to create review for ${client.user.firstName} and ${therapist.user.firstName}:`,
        error
      );
    }
  }

  // Create some pending/flagged reviews for admin moderation testing
  const moderationReviewsCount = Math.min(5, Math.floor(reviews.length * 0.1));
  for (let i = 0; i < moderationReviewsCount; i++) {
    try {
      const randomRelationship = faker.helpers.arrayElement(relationships);
      const { client, therapist } = randomRelationship;
      
      const status = faker.helpers.arrayElement(['PENDING', 'FLAGGED', 'REJECTED']);
      const rating = faker.number.int({ min: 1, max: 5 });
      
      await prisma.review.create({
        data: {
          clientId: client.client.userId,
          therapistId: therapist.therapist.userId,
          rating,
          title: generateModerationReviewTitle(status),
          content: generateModerationReviewContent(status),
          isAnonymous: true,
          isVerified: false,
        },
      });
    } catch (error) {
      // Skip if duplicate review (unique constraint)
    }
  }

  // Note: ReviewHelpful model not available in current schema
  // Skipping helpful votes for now

  // Calculate and log review statistics
  const reviewStats = calculateReviewStats(reviews);
  
  console.log(`📊 Review creation summary:`);
  console.log(`   ⭐ Total reviews: ${reviews.length}`);
  console.log(`   👍 Helpful votes: ${helpfulVotes.length}`);
  console.log(`   ✅ Approved: ${reviews.filter(r => r.status === 'APPROVED').length}`);
  console.log(`   ⏳ Pending: ${reviews.filter(r => r.status === 'PENDING').length}`);
  console.log(`   🚩 Flagged: ${reviews.filter(r => r.status === 'FLAGGED').length}`);
  console.log(`   ❌ Rejected: ${reviews.filter(r => r.status === 'REJECTED').length}`);
  console.log(`   📈 Average rating: ${reviewStats.averageRating.toFixed(1)}`);
  console.log(`   🎯 Rating distribution: ${reviewStats.ratingDistribution}`);

  return { reviews, helpfulVotes };
}

function generateRealisticRating(): number {
  // Realistic distribution: most therapy reviews are positive
  // 5 stars: 45%, 4 stars: 30%, 3 stars: 15%, 2 stars: 7%, 1 star: 3%
  const rand = Math.random();
  if (rand < 0.45) return 5;
  if (rand < 0.75) return 4;
  if (rand < 0.90) return 3;
  if (rand < 0.97) return 2;
  return 1;
}

function generateReviewContent(rating: number, therapistName: string): { title: string; content: string } {
  if (rating >= 4) {
    return {
      title: faker.helpers.arrayElement([
        'Excellent therapist, highly recommend',
        'Life-changing experience',
        'Professional and caring',
        'Amazing progress in short time',
        'Exactly what I needed',
        'Outstanding support and guidance',
        'Compassionate and effective',
        'Transformed my perspective',
      ]),
      content: faker.helpers.arrayElement([
        `${therapistName} has been incredibly helpful in my healing journey. Their approach is both professional and compassionate, and I've seen significant improvement in my mental health. I would highly recommend them to anyone seeking therapy.`,
        `Working with ${therapistName} has been transformative. They create a safe space where I feel comfortable sharing my thoughts and feelings. The strategies and tools they've provided have made a real difference in my daily life.`,
        `I was hesitant about therapy at first, but ${therapistName} made me feel at ease from our very first session. Their expertise and genuine care have helped me work through challenges I've been facing for years.`,
        `${therapistName} is an exceptional therapist who truly listens and provides valuable insights. The progress I've made in our sessions has exceeded my expectations. I'm grateful for their support and guidance.`,
        `The therapy sessions with ${therapistName} have been exactly what I needed. They have a wonderful way of helping me understand my thoughts and emotions while providing practical tools for improvement.`,
      ]),
    };
  } else if (rating === 3) {
    return {
      title: faker.helpers.arrayElement([
        'Good therapist, some helpful sessions',
        'Mixed experience overall',
        'Helpful but not quite the right fit',
        'Professional but limited progress',
        'Decent therapy experience',
      ]),
      content: faker.helpers.arrayElement([
        `${therapistName} is professional and knowledgeable. While I've had some helpful sessions, I feel like we haven't quite found the right approach for my specific needs. May work better for others.`,
        `My experience with ${therapistName} has been okay. Some sessions were more helpful than others. They are clearly skilled, but I'm not sure if their style is the best match for me.`,
        `${therapistName} provided some useful insights and tools. The therapy was helpful to a degree, though I feel like progress was slower than I had hoped for.`,
      ]),
    };
  } else {
    return {
      title: faker.helpers.arrayElement([
        'Not the right fit for me',
        'Disappointing experience',
        'Expected more from therapy',
        'Communication issues',
        'Limited progress made',
      ]),
      content: faker.helpers.arrayElement([
        `Unfortunately, my experience with ${therapistName} didn't meet my expectations. While they are professional, I didn't feel we connected well or that the approach was effective for my situation.`,
        `I had hoped for more progress in my sessions with ${therapistName}. The therapy style didn't seem to align with what I was looking for, and I didn't feel fully heard or understood.`,
        `My therapy experience with ${therapistName} was challenging. Communication felt difficult at times, and I didn't see the improvement I was hoping for during our time together.`,
      ]),
    };
  }
}

function generateModerationReviewTitle(status: string): string {
  if (status === 'FLAGGED') {
    return faker.helpers.arrayElement([
      'Inappropriate content flagged',
      'Review contains personal information',
      'Potentially fake review',
    ]);
  } else if (status === 'REJECTED') {
    return faker.helpers.arrayElement([
      'Rejected: Violates community guidelines',
      'Rejected: Inappropriate language',
      'Rejected: Not a genuine review',
    ]);
  } else {
    return faker.helpers.arrayElement([
      'Pending review awaiting moderation',
      'New review needs approval',
      'Under review for approval',
    ]);
  }
}

function generateModerationReviewContent(status: string): string {
  if (status === 'FLAGGED') {
    return 'This review has been flagged for containing inappropriate content or personal information that violates our community guidelines.';
  } else if (status === 'REJECTED') {
    return 'This review was rejected for violating our community standards and review policies.';
  } else {
    return 'This review is currently pending moderation and will be approved or rejected based on our community guidelines.';
  }
}

function generateModerationNote(status: string): string {
  const notes = {
    FLAGGED: [
      'Contains potential personal information',
      'Language needs review',
      'Reported by community member',
      'Suspicious review pattern detected',
    ],
    REJECTED: [
      'Violates community guidelines',
      'Contains inappropriate language',
      'Appears to be fake or spam',
      'Does not meet review standards',
    ],
  };

  return faker.helpers.arrayElement(notes[status] || ['Reviewed by moderation team']);
}

function calculateReviewStats(reviews: any[]) {
  const approvedReviews = reviews.filter(r => r.status === 'APPROVED');
  const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = approvedReviews.length > 0 ? totalRating / approvedReviews.length : 0;

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  approvedReviews.forEach(review => {
    ratingCounts[review.rating]++;
  });

  const ratingDistribution = `5★:${ratingCounts[5]}, 4★:${ratingCounts[4]}, 3★:${ratingCounts[3]}, 2★:${ratingCounts[2]}, 1★:${ratingCounts[1]}`;

  return {
    averageRating,
    ratingDistribution,
    totalApproved: approvedReviews.length,
  };
}