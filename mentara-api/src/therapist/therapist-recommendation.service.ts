import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  TherapistRecommendation,
  TherapistRecommendationRequest,
  TherapistRecommendationResponse,
  ApiResponse,
} from '../types';

@Injectable()
export class TherapistRecommendationService {
  constructor(private prisma: PrismaService) {}

  async getRecommendedTherapists(
    request: TherapistRecommendationRequest,
  ): Promise<ApiResponse<TherapistRecommendationResponse>> {
    try {
      // Get user's pre-assessment results
      const user = await this.prisma.user.findUnique({
        where: { id: request.userId },
        include: {
          preAssessment: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (!user.preAssessment) {
        return {
          success: false,
          message: 'No pre-assessment found for user',
        };
      }

      // Extract user's conditions and severity levels
      const userConditions = this.extractUserConditions(user.preAssessment);
      const severityLevels = user.preAssessment.severityLevels as Record<
        string,
        string
      >;

      // Get all active therapists
      const therapists = await this.prisma.therapist.findMany({
        where: {
          isActive: true,
          isVerified: true,
          ...(request.province && { province: request.province }),
          ...(request.maxHourlyRate && {
            hourlyRate: {
              lte: request.maxHourlyRate,
            },
          }),
        },
        orderBy: {
          patientSatisfaction: 'desc',
        },
        take: request.limit || 10,
      });

      // Calculate match scores and filter therapists
      const recommendations = therapists
        .map((therapist) =>
          this.calculateTherapistMatch(
            therapist,
            userConditions,
            severityLevels,
          ),
        )
        .filter((rec) => rec.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      // Determine primary and secondary conditions
      const primaryConditions = this.getPrimaryConditions(
        userConditions,
        severityLevels,
      );
      const secondaryConditions = this.getSecondaryConditions(
        userConditions,
        severityLevels,
      );

      return {
        success: true,
        message: 'Therapist recommendations retrieved successfully',
        data: {
          recommendations,
          totalCount: recommendations.length,
          userConditions: Object.keys(userConditions),
          matchCriteria: {
            primaryConditions,
            secondaryConditions,
            severityLevels,
          },
        },
      };
    } catch (error) {
      console.error(
        'Error getting therapist recommendations:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to get therapist recommendations',
      };
    }
  }

  private extractUserConditions(preAssessment: any): Record<string, string> {
    const conditions: Record<string, string> = {};
    const severityLevels = preAssessment.severityLevels as Record<
      string,
      string
    >;

    // Map questionnaire names to condition names
    const questionnaireToCondition: Record<string, string> = {
      Stress: 'Stress',
      Anxiety: 'Anxiety',
      Depression: 'Depression',
      Insomnia: 'Insomnia',
      Panic: 'Panic Disorder',
      'Bipolar disorder (BD)': 'Bipolar Disorder',
      'Obsessive compulsive disorder (OCD)': 'OCD',
      'Post-traumatic stress disorder (PTSD)': 'PTSD',
      'Social anxiety': 'Social Anxiety',
      Phobia: 'Phobias',
      Burnout: 'Burnout',
      'Binge eating / Eating disorders': 'Eating Disorders',
      'ADD / ADHD': 'ADHD',
      'Substance or Alcohol Use Issues': 'Substance Abuse',
    };

    // Extract conditions from questionnaires
    const questionnaires = preAssessment.questionnaires as string[];
    questionnaires.forEach((questionnaire) => {
      const condition = questionnaireToCondition[questionnaire];
      if (condition && severityLevels[questionnaire]) {
        conditions[condition] = severityLevels[questionnaire];
      }
    });

    return conditions;
  }

  private calculateTherapistMatch(
    therapist: any,
    userConditions: Record<string, string>,
    severityLevels: Record<string, string>,
  ): TherapistRecommendation {
    const illnessSpecializations =
      (therapist.illnessSpecializations as string[]) || [];
    const expertiseLevels =
      (therapist.expertiseLevels as Record<string, number>) || {};
    const therapeuticApproaches =
      (therapist.therapeuticApproaches as string[]) || [];
    const languages = (therapist.languages as string[]) || [];

    let totalScore = 0;
    let matchedConditions: string[] = [];
    let maxPossibleScore = 0;

    // Calculate match score based on condition specializations
    Object.entries(userConditions).forEach(([condition, severity]) => {
      if (illnessSpecializations.includes(condition)) {
        const expertiseLevel = expertiseLevels[condition] || 1;
        const severityWeight = this.getSeverityWeight(severity);

        // Base score for condition match
        const conditionScore = expertiseLevel * severityWeight * 10;
        totalScore += conditionScore;
        matchedConditions.push(condition);
      }

      // Maximum possible score for this condition
      maxPossibleScore += 50; // 5 (max expertise) * 10 (max severity weight)
    });

    // Bonus for therapist experience and ratings
    if (therapist.yearsOfExperience) {
      totalScore += Math.min(therapist.yearsOfExperience * 2, 20);
    }

    if (therapist.patientSatisfaction) {
      totalScore += (therapist.patientSatisfaction as number) * 10;
    }

    // Calculate final match score as percentage
    const matchScore =
      maxPossibleScore > 0
        ? Math.round((totalScore / maxPossibleScore) * 100)
        : 0;

    return {
      id: therapist.id,
      clerkUserId: therapist.clerkUserId,
      firstName: therapist.firstName,
      lastName: therapist.lastName,
      email: therapist.email,
      bio: therapist.bio,
      profileImageUrl: therapist.profileImageUrl,
      hourlyRate: therapist.hourlyRate
        ? Number(therapist.hourlyRate)
        : undefined,
      patientSatisfaction: therapist.patientSatisfaction
        ? Number(therapist.patientSatisfaction)
        : undefined,
      totalPatients: therapist.totalPatients,
      province: therapist.province,
      providerType: therapist.providerType,
      yearsOfExperience: therapist.yearsOfExperience,
      matchedConditions,
      matchScore,
      expertiseLevels,
      therapeuticApproaches,
      languages,
      weeklyAvailability: therapist.weeklyAvailability,
      sessionLength: therapist.sessionLength,
    };
  }

  private getSeverityWeight(severity: string): number {
    const severityWeights: Record<string, number> = {
      Minimal: 1,
      Mild: 2,
      Moderate: 3,
      'Moderately Severe': 4,
      Severe: 5,
      'Very Severe': 5,
      Extreme: 5,
      Low: 1,
      High: 4,
      Substantial: 4,
      Subclinical: 1,
      Clinical: 4,
      None: 0,
      Subthreshold: 2,
      Positive: 4,
      Negative: 0,
    };

    return severityWeights[severity] || 1;
  }

  private getPrimaryConditions(
    userConditions: Record<string, string>,
    severityLevels: Record<string, string>,
  ): string[] {
    return Object.entries(userConditions)
      .filter(([_, severity]) => {
        const weight = this.getSeverityWeight(severity);
        return weight >= 4; // High severity conditions
      })
      .map(([condition, _]) => condition);
  }

  private getSecondaryConditions(
    userConditions: Record<string, string>,
    severityLevels: Record<string, string>,
  ): string[] {
    return Object.entries(userConditions)
      .filter(([_, severity]) => {
        const weight = this.getSeverityWeight(severity);
        return weight >= 2 && weight < 4; // Medium severity conditions
      })
      .map(([condition, _]) => condition);
  }
}
