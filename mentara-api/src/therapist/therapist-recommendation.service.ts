import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { PreAssessment, Therapist } from '@prisma/client';

interface TherapistRecommendationRequest {
  userId: string;
  limit?: number;
  includeInactive?: boolean;
  province?: string;
  maxHourlyRate?: number;
}

interface TherapistRecommendationResponse {
  therapists: any[];
  total: number;
}

@Injectable()
export class TherapistRecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateYearsOfExperience(startDate: Date): number {
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    if (
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() &&
        now.getDate() < startDate.getDate())
    ) {
      years--;
    }
    return years;
  }

  async getRecommendedTherapists(
    request: TherapistRecommendationRequest,
  ): Promise<TherapistRecommendationResponse> {
    try {
      // Get user's pre-assessment results
      const user = await this.prisma.client.findUnique({
        where: { userId: request.userId },
        include: {
          preAssessment: true,
        },
      });
      if (!user) throw new NotFoundException('User not found');
      if (!user.preAssessment)
        throw new NotFoundException('No pre-assessment found for user');

      // Extract user conditions and severity levels
      const userConditions = this.extractUserConditions(user.preAssessment);
      const severityLevels = user.preAssessment.severityLevels as Record<
        string,
        string
      >;

      // Fetch therapists
      const therapists = await this.prisma.therapist.findMany({
        where: {
          status: 'approved',
          ...(request.province && { province: request.province }),
          ...(request.maxHourlyRate && {
            hourlyRate: { lte: request.maxHourlyRate },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: request.limit ?? 10,
        include: {
          user: true,
        },
      });

      // Calculate match scores
      const therapistsWithScores = therapists.map((therapist) => {
        const matchScore = this.calculateMatchScore(therapist, userConditions);
        return { ...therapist, matchScore };
      });

      // Sort by matchScore descending
      const sortedTherapists = therapistsWithScores.toSorted(
        (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0),
      );

      // Determine primary and secondary conditions
      const primaryConditions = this.getPrimaryConditions(userConditions);
      const secondaryConditions = this.getSecondaryConditions(userConditions);

      return {
        totalCount: sortedTherapists.length,
        userConditions: Object.keys(userConditions),
        therapists: sortedTherapists,
        matchCriteria: {
          primaryConditions,
          secondaryConditions,
          severityLevels,
        },
        page: 1,
        pageSize: request.limit ?? 10,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to get therapist recommendations',
      );
    }
  }

  private extractUserConditions(
    preAssessment: PreAssessment,
  ): Record<string, string> {
    const conditions: Record<string, string> = {};
    const severityLevels = preAssessment.severityLevels as Record<
      string,
      string
    >;
    const questionnaires = preAssessment.questionnaires as string[];
    questionnaires.forEach((q) => {
      if (severityLevels[q]) {
        conditions[q] = severityLevels[q];
      }
    });
    return conditions;
  }

  private calculateMatchScore(
    therapist: any,
    userConditions: Record<string, string>,
  ): number {
    let score = 0;
    const expertise = (therapist.expertise as string[]) || [];
    Object.keys(userConditions).forEach((condition) => {
      if (expertise.includes(condition)) score += 20;
    });
    score += Math.min(
      this.calculateYearsOfExperience(therapist.practiceStartDate) * 2,
      20,
    );
    // Add base score for experience
    score += therapist.yearsOfExperience ? therapist.yearsOfExperience * 2 : 0;
    return score;
  }

  private getPrimaryConditions(
    userConditions: Record<string, string>,
  ): string[] {
    return Object.entries(userConditions)
      .filter(([, severity]) => this.getSeverityWeight(severity) >= 4)
      .map(([condition]) => condition);
  }

  private getSecondaryConditions(
    userConditions: Record<string, string>,
  ): string[] {
    return Object.entries(userConditions)
      .filter(([, severity]) => {
        const weight = this.getSeverityWeight(severity);
        return weight >= 2 && weight < 4;
      })
      .map(([condition]) => condition);
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
}
