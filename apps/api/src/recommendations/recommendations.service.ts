import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { RecommendationResponseDto, RecommendedTherapistDto } from './types/recommendations.dto';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly questionnaireMap: Record<string, string> = {
    // Acronyms
    GAD7: 'Anxiety',
    PHQ9: 'Depression',
    ISI: 'Insomnia',
    ASRS: 'ADHD',
    AUDIT: 'Alcohol Use',
    DAST10: 'Substance Use',
    PCL5: 'PTSD',
    MDQ: 'Bipolar Disorder',
    EDEQ: 'Eating Disorders',
    // Web IDs
    adhd: 'ADHD',
    alcohol: 'Alcohol Use',
    'binge-eating': 'Eating Disorders',
    burnout: 'Burnout',
    'drug-abuse': 'Substance Use',
    anxiety: 'Anxiety',
    insomnia: 'Insomnia',
    'mood-disorder': 'Bipolar Disorder',
    'obsessional-compulsive': 'OCD',
    'panic-disorder': 'Panic',
    stress: 'Stress',
    phobia: 'Phobia',
    depression: 'Depression',
    ptsd: 'PTSD',
    'social-phobia': 'Social Anxiety',
  };

  async getRecommendations(userId: string): Promise<RecommendationResponseDto> {
    try {
      this.logger.log(`Fetching recommendations for user ${userId}`);

      // 1. Get the latest pre-assessment
      const preAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      // 2. Extract conditions from questionnaire scores
      const userConditions: string[] = [];
      if (preAssessment && preAssessment.data) {
        const data = preAssessment.data as any;
        const scores = data.questionnaireScores || {};

        Object.entries(scores).forEach(([key, value]: [string, any]) => {
          const condition = this.questionnaireMap[key];
          if (condition && (value.severity === 'Moderate' || value.severity === 'Moderately Severe' || value.severity === 'Severe' || value.severity === 'High')) {
            userConditions.push(condition);
          }
        });
      }

      this.logger.log(`User conditions identified: ${userConditions.join(', ')}`);

      // 3. Find therapists matching these conditions
      // If no conditions identified or no pre-assessment, we'll suggest general ones
      const therapistWhere: any = {
        status: 'APPROVED',
      };

      if (userConditions.length > 0) {
        therapistWhere.OR = [
          { expertise: { hasSome: userConditions } },
          { illnessSpecializations: { hasSome: userConditions } },
          { areasOfExpertise: { hasSome: userConditions } },
        ];
      }

      const therapists = await this.prisma.therapist.findMany({
        where: therapistWhere,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        take: 10,
      });

      // 4. Transform and score therapists
      const recommendedTherapists: RecommendedTherapistDto[] = therapists.map((therapist) => {
        const reviews = therapist.reviews || [];
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        // Simple scoring logic:
        // - Base score: 50
        // - Each matching condition: +10
        // - Rating: + (rating * 2)
        // - Experience: + (years * 0.5)
        let matchScore = 50;
        const matchReasons: string[] = [];

        userConditions.forEach((condition) => {
          const allSpecializations = [
            ...(therapist.expertise || []),
            ...(therapist.illnessSpecializations || []),
            ...(therapist.areasOfExpertise || []),
          ];
          if (allSpecializations.some(s => s.toLowerCase().includes(condition.toLowerCase()))) {
            matchScore += 10;
            matchReasons.push(`Expert in ${condition}`);
          }
        });

        matchScore += averageRating * 2;
        matchScore += (therapist.yearsOfExperience || 0) * 0.5;

        // Add reason for rating if high
        if (averageRating >= 4.5) {
          matchReasons.push('Highly rated by clients');
        }

        // Add reason for experience if significant
        if ((therapist.yearsOfExperience || 0) >= 10) {
          matchReasons.push('Extensive clinical experience');
        }

        // Use accessibility needs to boost matching if remote/online is mentioned
        const accessibility = preAssessment?.accessibilityNeeds?.toLowerCase() || '';
        if ((accessibility.includes('online') || accessibility.includes('video') || accessibility.includes('remote')) && therapist.comfortableUsingVideoConferencing) {
          matchScore += 5;
          matchReasons.push('Supports remote/online therapy sessions');
        }

        return {
          id: therapist.userId,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          expertise: therapist.expertise || [],
          illnessSpecializations: therapist.illnessSpecializations || [],
          therapeuticApproaches: therapist.approaches || [],
          yearsOfExperience: therapist.yearsOfExperience || 0,
          hourlyRate: Number(therapist.hourlyRate),
          rating: averageRating,
          reviewCount: reviews.length,
          matchScore: Math.min(Math.round(matchScore), 100),
          matchReasons: matchReasons.length > 0 ? matchReasons : ['General mental health support'],
        };
      });

      // Sort by match score descending
      recommendedTherapists.sort((a, b) => b.matchScore - a.matchScore);

      return {
        success: true,
        data: {
          therapists: recommendedTherapists,
          total: recommendedTherapists.length,
          userConditions,
          userContext: {
            pastTherapyExperiences: preAssessment?.pastTherapyExperiences,
            medicationHistory: preAssessment?.medicationHistory,
            accessibilityNeeds: preAssessment?.accessibilityNeeds,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error generating recommendations: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate therapist recommendations');
    }
  }
}
