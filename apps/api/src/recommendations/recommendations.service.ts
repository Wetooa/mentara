import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { RecommendedTherapistDto, RecommendedCommunityDto, TherapistRecommendationResponseDto, CommunityRecommendationResponseDto } from './types/recommendations.dto';
import { Prisma, QuestionnaireType } from '@prisma/client';

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
    "PCL-5": 'PTSD',
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

  private readonly conditionToEnumMap: Record<string, QuestionnaireType> = {
    Anxiety: QuestionnaireType.ANXIETY,
    Depression: QuestionnaireType.DEPRESSION,
    Insomnia: QuestionnaireType.INSOMNIA,
    ADHD: QuestionnaireType.ADHD,
    'Alcohol Use': QuestionnaireType.ALCOHOL,
    'Substance Use': QuestionnaireType.DRUG_ABUSE,
    PTSD: QuestionnaireType.PTSD,
    'Bipolar Disorder': QuestionnaireType.BIPOLAR,
    'Eating Disorders': QuestionnaireType.EATING_DISORDER,
    OCD: QuestionnaireType.OCD,
    Panic: QuestionnaireType.PANIC,
    Stress: QuestionnaireType.STRESS,
    Phobia: QuestionnaireType.PHOBIA,
    'Social Anxiety': QuestionnaireType.SOCIAL_ANXIETY,
    Burnout: QuestionnaireType.BURNOUT,
  };

  private async getUserAssessmentAndConditions(userId: string) {
    const preAssessment = await this.prisma.preAssessment.findFirst({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const userConditions: string[] = [];
    if (preAssessment && preAssessment.data) {
      const data = preAssessment.data as Record<string, any>;
      const scores = (data.questionnaireScores || {}) as Record<string, any>;

      Object.entries(scores).forEach(([key, value]) => {
        const condition = this.questionnaireMap[key];
        if (condition && value.severity) {
          userConditions.push(condition);
        }
      });
    }

    return { preAssessment, userConditions };
  }

  async getTherapistRecommendations(userId: string): Promise<TherapistRecommendationResponseDto> {
    try {
      this.logger.log(`Fetching therapist recommendations for user ${userId}`);

      const { preAssessment, userConditions } = await this.getUserAssessmentAndConditions(userId);
      this.logger.log(`User conditions identified: ${userConditions.join(', ')}`);

      const therapistWhere: Prisma.TherapistWhereInput = {
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
      });

      const recommendedTherapists: RecommendedTherapistDto[] = therapists.map((therapist) => {
        const reviews = therapist.reviews || [];
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

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

        if (averageRating >= 4.5) matchReasons.push('Highly rated by clients');
        if ((therapist.yearsOfExperience || 0) >= 10) matchReasons.push('Extensive clinical experience');

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

      recommendedTherapists.sort((a, b) => b.matchScore - a.matchScore);
      const topTherapists = recommendedTherapists.slice(0, 3);

      return {
        success: true,
        data: {
          therapists: topTherapists,
          total: topTherapists.length,
          userConditions,
        },
      };
    } catch (error) {
      this.logger.error(`Error generating therapist recommendations: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate therapist recommendations');
    }
  }

  async getCommunityRecommendations(userId: string): Promise<CommunityRecommendationResponseDto> {
    try {
      this.logger.log(`Fetching community recommendations for user ${userId}`);

      const { userConditions } = await this.getUserAssessmentAndConditions(userId);
      this.logger.log(`User conditions identified: ${userConditions.join(', ')}`);

      const targetEnums: QuestionnaireType[] = userConditions
        .map(c => this.conditionToEnumMap[c])
        .filter((c): c is QuestionnaireType => !!c);

      const communityWhere: Prisma.CommunityWhereInput = {};
      if (targetEnums.length > 0) {
        communityWhere.illnesses = {
          hasSome: targetEnums,
        };
      }

      const communities = await this.prisma.community.findMany({
        where: communityWhere,
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
        },
      });

      const recommendedCommunities: RecommendedCommunityDto[] = communities.map((community) => {
        let matchScore = 60;
        const matchReasons: string[] = [];
        const communityIllnesses = community.illnesses || [];

        userConditions.forEach((condition) => {
          const enumValue = this.conditionToEnumMap[condition];
          if (enumValue && (communityIllnesses as QuestionnaireType[]).includes(enumValue)) {
            matchScore += 15;
            matchReasons.push(`Focuses on ${condition}`);
          }
        });

        const memberCount = community._count?.memberships || 0;
        if (memberCount > 50) {
          matchScore += 5;
          matchReasons.push('Active community');
        }

        return {
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          imageUrl: community.imageUrl,
          memberCount,
          matchScore: Math.min(Math.round(matchScore), 100),
          matchReasons: matchReasons.length > 0 ? matchReasons : ['Supportive peer environment'],
        };
      });

      recommendedCommunities.sort((a, b) => b.matchScore - a.matchScore);
      const topCommunities = recommendedCommunities.slice(0, 3);

      return {
        success: true,
        data: {
          communities: topCommunities,
          total: topCommunities.length,
          userConditions,
        },
      };
    } catch (error) {
      this.logger.error(`Error generating community recommendations: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate community recommendations');
    }
  }
}
