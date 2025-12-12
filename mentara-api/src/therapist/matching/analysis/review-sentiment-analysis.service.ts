import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma-client.provider';
import { GeminiClientService } from '../../../pre-assessment/services/gemini-client.service';

export interface ReviewSentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sentimentScore: number; // -1 to 1, where 1 is most positive
  strengths: string[]; // Common strengths mentioned
  weaknesses: string[]; // Common weaknesses mentioned
  themes: string[]; // Common themes across reviews
  trustworthinessScore: number; // 0-1, based on review patterns
  reviewCount: number;
  averageRating: number;
}

@Injectable()
export class ReviewSentimentAnalysisService {
  private readonly logger = new Logger(ReviewSentimentAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiClient: GeminiClientService,
  ) {}

  /**
   * Analyze review sentiment for a therapist
   */
  async analyzeReviewSentiment(
    therapistId: string,
  ): Promise<ReviewSentimentAnalysis | null> {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { therapistId },
        select: {
          rating: true,
          content: true,
          title: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (reviews.length === 0) {
        return {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          strengths: [],
          weaknesses: [],
          themes: [],
          trustworthinessScore: 0.5,
          reviewCount: 0,
          averageRating: 0,
        };
      }

      // Calculate average rating
      const averageRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

      // Analyze sentiment using AI if available, otherwise use keyword-based
      const sentimentAnalysis = await this.analyzeSentimentWithAI(reviews);

      // Extract strengths and weaknesses
      const { strengths, weaknesses } = this.extractStrengthsAndWeaknesses(reviews);

      // Identify common themes
      const themes = this.identifyThemes(reviews);

      // Calculate trustworthiness score
      const trustworthinessScore = this.calculateTrustworthinessScore(reviews);

      return {
        overallSentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score,
        strengths,
        weaknesses,
        themes,
        trustworthinessScore,
        reviewCount: reviews.length,
        averageRating,
      };
    } catch (error) {
      this.logger.error(
        `Error analyzing review sentiment for ${therapistId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Analyze sentiment using AI (with fallback to keyword-based)
   */
  private async analyzeSentimentWithAI(
    reviews: Array<{ content: string | null; rating: number }>,
  ): Promise<{ sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'; score: number }> {
    const reviewTexts = reviews
      .filter((r) => r.content)
      .map((r) => r.content!)
      .slice(0, 10) // Analyze up to 10 reviews
      .join('\n\n');

    if (!reviewTexts) {
      // Fallback to rating-based sentiment
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      if (avgRating >= 4) return { sentiment: 'positive', score: 0.7 };
      if (avgRating >= 3) return { sentiment: 'neutral', score: 0 };
      return { sentiment: 'negative', score: -0.5 };
    }

    try {
      // Use AI to analyze sentiment
      const prompt = `Analyze the sentiment of the following therapist reviews. 
      Determine if the overall sentiment is positive, neutral, negative, or mixed.
      Also provide a sentiment score from -1 (very negative) to 1 (very positive).

      Reviews:
      ${reviewTexts}

      Respond with JSON: {"sentiment": "positive|neutral|negative|mixed", "score": -1 to 1}`;

      const response = await this.geminiClient.chatCompletion(
        [{ role: 'user', content: prompt }],
        { temperature: 0.3, max_tokens: 200 },
      );

      // Try to parse JSON response
      try {
        // Response might be a string, extract JSON if present
        const responseText = typeof response === 'string' ? response : JSON.stringify(response);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            sentiment: (parsed.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative' | 'mixed',
            score: parsed.score || 0,
          };
        }
      } catch (parseError) {
        this.logger.warn('Failed to parse AI sentiment response, using fallback');
      }
    } catch (aiError) {
      this.logger.warn('AI sentiment analysis failed, using keyword-based fallback');
    }

    // Fallback to keyword-based analysis
    return this.analyzeSentimentWithKeywords(reviewTexts);
  }

  /**
   * Keyword-based sentiment analysis (fallback)
   */
  private analyzeSentimentWithKeywords(
    text: string,
  ): { sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'; score: number } {
    const lowerText = text.toLowerCase();

    const positiveKeywords = [
      'excellent',
      'great',
      'amazing',
      'wonderful',
      'helpful',
      'supportive',
      'professional',
      'caring',
      'understanding',
      'effective',
      'improved',
      'better',
      'recommend',
    ];
    const negativeKeywords = [
      'poor',
      'bad',
      'terrible',
      'unhelpful',
      'unprofessional',
      'disappointed',
      'waste',
      'ineffective',
      'worse',
      'not recommend',
    ];

    const positiveCount = positiveKeywords.filter((kw) => lowerText.includes(kw)).length;
    const negativeCount = negativeKeywords.filter((kw) => lowerText.includes(kw)).length;

    if (positiveCount > negativeCount * 1.5) {
      return { sentiment: 'positive', score: 0.6 };
    }
    if (negativeCount > positiveCount * 1.5) {
      return { sentiment: 'negative', score: -0.6 };
    }
    if (positiveCount > 0 && negativeCount > 0) {
      return { sentiment: 'mixed', score: 0 };
    }
    return { sentiment: 'neutral', score: 0 };
  }

  /**
   * Extract strengths and weaknesses from reviews
   */
  private extractStrengthsAndWeaknesses(
    reviews: Array<{ content: string | null; rating: number }>,
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: Record<string, number> = {};
    const weaknesses: Record<string, number> = {};

    const strengthKeywords: Record<string, string[]> = {
      'Communication Skills': ['communicate', 'listening', 'clear', 'explain'],
      'Empathy': ['empathetic', 'understanding', 'caring', 'compassionate'],
      'Professionalism': ['professional', 'punctual', 'organized', 'prepared'],
      'Effectiveness': ['helpful', 'effective', 'improved', 'progress'],
      'Approach': ['approach', 'method', 'technique', 'strategy'],
    };

    const weaknessKeywords: Record<string, string[]> = {
      'Communication Issues': ['unclear', 'confusing', 'hard to reach', 'slow response'],
      'Lack of Empathy': ['cold', 'distant', 'unsympathetic', 'judgmental'],
      'Unprofessional': ['unprofessional', 'unprepared', 'disorganized', 'late'],
      'Ineffective': ['ineffective', 'unhelpful', 'no progress', 'waste'],
      'Approach Mismatch': ['wrong approach', 'not suitable', "didn't work"],
    };

    reviews.forEach((review) => {
      if (!review.content) return;
      const content = review.content.toLowerCase();

      // Extract strengths (from positive reviews)
      if (review.rating >= 4) {
        Object.entries(strengthKeywords).forEach(([strength, keywords]) => {
          if (keywords.some((kw) => content.includes(kw))) {
            strengths[strength] = (strengths[strength] || 0) + 1;
          }
        });
      }

      // Extract weaknesses (from negative reviews)
      if (review.rating <= 2) {
        Object.entries(weaknessKeywords).forEach(([weakness, keywords]) => {
          if (keywords.some((kw) => content.includes(kw))) {
            weaknesses[weakness] = (weaknesses[weakness] || 0) + 1;
          }
        });
      }
    });

    // Return top 3 strengths and weaknesses
    return {
      strengths: Object.entries(strengths)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([strength]) => strength),
      weaknesses: Object.entries(weaknesses)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([weakness]) => weakness),
    };
  }

  /**
   * Identify common themes across reviews
   */
  private identifyThemes(
    reviews: Array<{ content: string | null; title: string | null }>,
  ): string[] {
    const themeKeywords: Record<string, string[]> = {
      'Communication': ['communication', 'talk', 'discuss', 'conversation'],
      'Treatment Approach': ['approach', 'method', 'therapy', 'treatment'],
      'Scheduling': ['schedule', 'availability', 'time', 'appointment'],
      'Progress': ['progress', 'improvement', 'better', 'results'],
      'Support': ['support', 'help', 'guidance', 'assistance'],
      'Environment': ['comfortable', 'safe', 'space', 'atmosphere'],
    };

    const themeCounts: Record<string, number> = {};

    reviews.forEach((review) => {
      const text = ((review.content || '') + ' ' + (review.title || '')).toLowerCase();
      Object.entries(themeKeywords).forEach(([theme, keywords]) => {
        if (keywords.some((kw) => text.includes(kw))) {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        }
      });
    });

    // Return top 3 themes
    return Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  /**
   * Calculate trustworthiness score based on review patterns
   */
  private calculateTrustworthinessScore(
    reviews: Array<{ rating: number; createdAt: Date }>,
  ): number {
    if (reviews.length === 0) return 0.5;

    let score = 0.5; // Start with neutral

    // More reviews = more trustworthy (up to 20 reviews)
    const reviewVolumeScore = Math.min(reviews.length / 20, 1) * 0.3;
    score += reviewVolumeScore;

    // Higher average rating = more trustworthy
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingScore = ((avgRating - 1) / 4) * 0.3; // Normalize 1-5 to 0-1
    score += ratingScore;

    // Recent reviews = more current/trustworthy
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentReviews = reviews.filter((r) => r.createdAt >= sixMonthsAgo).length;
    const recencyScore = Math.min(recentReviews / 5, 1) * 0.2; // Max 5 recent reviews
    score += recencyScore;

    // Rating consistency (lower variance = more trustworthy)
    const ratings = reviews.map((r) => r.rating);
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const variance =
      ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;
    const consistencyScore = Math.max(0, 1 - variance / 4) * 0.2; // Lower variance = higher score
    score += consistencyScore;

    return Math.min(score, 1);
  }
}

