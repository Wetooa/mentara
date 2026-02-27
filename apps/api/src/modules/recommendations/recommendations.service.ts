import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { RecommendedTherapistDto, RecommendedCommunityDto, TherapistRecommendationResponseDto, CommunityRecommendationResponseDto } from './types/recommendations.dto';
import { Prisma, QuestionnaireType } from '@prisma/client';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly questionnairePatterns: { pattern: RegExp; condition: string }[] = [
  { pattern: /GAD7|anxiety/i, condition: 'anxiety' },
  { pattern: /PHQ9|PHQ-9|depression/i, condition: 'depression' },
  { pattern: /ISI|insomnia/i, condition: 'insomnia' },
  { pattern: /ASRS|adhd/i, condition: 'adhd' },
  { pattern: /AUDIT|alcohol/i, condition: 'alcohol' },
  { pattern: /DAST10|drug-abuse/i, condition: 'drug_abuse' },
  { pattern: /PCL-5|ptsd/i, condition: 'ptsd' },
  { pattern: /MDQ|mood-disorder|bipolar/i, condition: 'bipolar' },
  { pattern: /EDEQ|binge-eating|eating-disorder/i, condition: 'eating_disorder' },
  { pattern: /burnout/i, condition: 'burnout' },
  { pattern: /obsessional-compulsive|ocd/i, condition: 'ocd' },
  { pattern: /panic-disorder|panic/i, condition: 'panic' },
  { pattern: /stress/i, condition: 'stress' },
  { pattern: /social-phobia|social-anxiety/i, condition: 'social_anxiety' },
  { pattern: /phobia/i, condition: 'phobia' },
];

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
      const data = preAssessment.data as Record<string, unknown>;
      const scores = (data.questionnaireScores || {}) as Record<string, { severity?: string }>;

      Object.entries(scores).forEach(([key, value]) => {
        const patternMatch = this.questionnairePatterns.find(p => p.pattern.test(key));
        const condition = patternMatch?.condition;
        
        if (condition && value.severity) {
          userConditions.push(condition.toUpperCase());
        }
      });
    }

    return { preAssessment, userConditions };
  }

  async getTherapistRecommendations(userId: string): Promise<TherapistRecommendationResponseDto> {
    try {
      this.logger.log(`Fetching therapist recommendations for user ${userId}`);

      const { userConditions } = await this.getUserAssessmentAndConditions(userId);
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

      this.logger.log(`Found ${therapists.length} therapists`);

      const recommendedTherapists: RecommendedTherapistDto[] = therapists.map((therapist) => {
       

        return {
          id: therapist.userId,
          firstName: therapist.user.firstName,
          lastName: therapist.user.lastName,
          expertise: therapist.expertise || [],
          illnessSpecializations: therapist.illnessSpecializations || [],
          therapeuticApproaches: therapist.approaches || [],
          yearsOfExperience: therapist.yearsOfExperience || 0,
          hourlyRate: Number(therapist.hourlyRate),
          rating: 5,
          reviewCount: 10,
          matchScore: 100,
          matchReasons: ['General mental health support'],
        };
      });

      const topTherapists = recommendedTherapists.sort(() => Math.random() - 0.5);

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

      // Map condition strings (e.g. "ANXIETY") to QuestionnaireType enums
      const conditionUpperToEnum: Record<string, QuestionnaireType> = {
        ANXIETY: QuestionnaireType.ANXIETY,
        DEPRESSION: QuestionnaireType.DEPRESSION,
        INSOMNIA: QuestionnaireType.INSOMNIA,
        ADHD: QuestionnaireType.ADHD,
        ALCOHOL: QuestionnaireType.ALCOHOL,
        DRUG_ABUSE: QuestionnaireType.DRUG_ABUSE,
        PTSD: QuestionnaireType.PTSD,
        BIPOLAR: QuestionnaireType.BIPOLAR,
        EATING_DISORDER: QuestionnaireType.EATING_DISORDER,
        BURNOUT: QuestionnaireType.BURNOUT,
        OCD: QuestionnaireType.OCD,
        PANIC: QuestionnaireType.PANIC,
        STRESS: QuestionnaireType.STRESS,
        SOCIAL_ANXIETY: QuestionnaireType.SOCIAL_ANXIETY,
        PHOBIA: QuestionnaireType.PHOBIA,
      };

      const targetEnums: QuestionnaireType[] = userConditions
        .map((c) => conditionUpperToEnum[c])
        .filter((c): c is QuestionnaireType => !!c);

      const communityWhere: Prisma.CommunityWhereInput =
        targetEnums.length > 0 ? { illnesses: { hasSome: targetEnums } } : {};

      const communities = await this.prisma.community.findMany({
        where: communityWhere,
        include: {
          _count: { select: { memberships: true } },
        },
      });

      // Sort by member count descending, take top 3
      const topCommunities: RecommendedCommunityDto[] = communities
        .sort((a, b) => (b._count?.memberships ?? 0) - (a._count?.memberships ?? 0))
        .slice(0, 3)
        .map((community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          description: community.description,
          imageUrl: community.imageUrl,
          memberCount: community._count?.memberships ?? 0,
          matchScore: 100,
          matchReasons: ['Matches your assessment profile'],
        }));

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

