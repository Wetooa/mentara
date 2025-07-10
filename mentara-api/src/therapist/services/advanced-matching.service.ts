import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { PreAssessment, Therapist, Client } from '@prisma/client';

export interface MatchingWeights {
  conditionMatch: number; // 40%
  approachCompatibility: number; // 25%
  experienceAndSuccess: number; // 20%
  reviewsAndRatings: number; // 10%
  availabilityAndLogistics: number; // 5%
}

export interface TherapistScore {
  therapist: Therapist & { user: any };
  totalScore: number;
  breakdown: {
    conditionScore: number;
    approachScore: number;
    experienceScore: number;
    reviewScore: number;
    logisticsScore: number;
  };
  matchExplanation: {
    primaryMatches: string[];
    secondaryMatches: string[];
    approachMatches: string[];
    experienceYears: number;
    averageRating: number;
    totalReviews: number;
    successRates: Record<string, number>;
  };
}

export interface SeverityMapping {
  [key: string]: number;
}

export interface UserConditionProfile {
  primaryConditions: Array<{
    condition: string;
    severity: string;
    weight: number;
  }>;
  secondaryConditions: Array<{
    condition: string;
    severity: string;
    weight: number;
  }>;
  preferredApproaches: string[];
  sessionPreferences: {
    format: string[]; // online, in-person, hybrid
    duration: string[];
    frequency: string;
  };
  demographics: {
    ageRange: string;
    genderPreference?: string;
    languagePreference: string[];
  };
  logistics: {
    maxHourlyRate?: number;
    province?: string;
    insuranceTypes?: string[];
  };
}

@Injectable()
export class AdvancedMatchingService {
  private readonly defaultWeights: MatchingWeights = {
    conditionMatch: 0.4,
    approachCompatibility: 0.25,
    experienceAndSuccess: 0.2,
    reviewsAndRatings: 0.1,
    availabilityAndLogistics: 0.05,
  };

  private readonly severityWeights: SeverityMapping = {
    // Depression/Anxiety scales
    Minimal: 1,
    Mild: 2,
    Moderate: 3,
    'Moderately Severe': 4,
    Severe: 5,
    'Very Severe': 5,
    Extreme: 5,

    // General severity levels
    Low: 1,
    High: 4,
    Substantial: 4,

    // Clinical thresholds
    Subclinical: 1,
    Clinical: 4,
    Subthreshold: 2,

    // Binary indicators
    Positive: 4,
    Negative: 0,
    None: 0,
  };

  constructor(private readonly prisma: PrismaService) {}

  async calculateAdvancedMatch(
    client: Client & { preAssessment: PreAssessment; clientPreferences: any[] },
    therapist: Therapist & { user: any; reviews: any[] },
    weights: MatchingWeights = this.defaultWeights,
  ): Promise<TherapistScore> {
    // Build user condition profile
    const userProfile = this.buildUserConditionProfile(client);

    // Calculate individual score components
    const conditionScore = this.calculateConditionMatchScore(
      userProfile,
      therapist,
    );
    const approachScore = this.calculateApproachCompatibilityScore(
      userProfile,
      therapist,
    );
    const experienceScore = this.calculateExperienceAndSuccessScore(
      userProfile,
      therapist,
    );
    const reviewScore = await this.calculateReviewScore(therapist);
    const logisticsScore = this.calculateLogisticsScore(userProfile, therapist);

    // Calculate weighted total score
    const totalScore = Math.round(
      conditionScore * weights.conditionMatch +
        approachScore * weights.approachCompatibility +
        experienceScore * weights.experienceAndSuccess +
        reviewScore * weights.reviewsAndRatings +
        logisticsScore * weights.availabilityAndLogistics,
    );

    // Build match explanation
    const matchExplanation = this.buildMatchExplanation(
      userProfile,
      therapist,
      conditionScore,
      approachScore,
      experienceScore,
      reviewScore,
    );

    return {
      therapist,
      totalScore,
      breakdown: {
        conditionScore: Math.round(conditionScore),
        approachScore: Math.round(approachScore),
        experienceScore: Math.round(experienceScore),
        reviewScore: Math.round(reviewScore),
        logisticsScore: Math.round(logisticsScore),
      },
      matchExplanation,
    };
  }

  private buildUserConditionProfile(
    client: Client & { preAssessment: PreAssessment; clientPreferences: any[] },
  ): UserConditionProfile {
    const severityLevels = client.preAssessment.severityLevels as Record<
      string,
      string
    >;
    const questionnaires = client.preAssessment.questionnaires as string[];

    // Categorize conditions by severity
    const primaryConditions: Array<{
      condition: string;
      severity: string;
      weight: number;
    }> = [];
    const secondaryConditions: Array<{
      condition: string;
      severity: string;
      weight: number;
    }> = [];

    questionnaires.forEach((condition) => {
      const severity = severityLevels[condition];
      const weight = this.severityWeights[severity] || 1;

      if (weight >= 4) {
        primaryConditions.push({ condition, severity, weight });
      } else if (weight >= 2) {
        secondaryConditions.push({ condition, severity, weight });
      }
    });

    // Extract preferences from client preferences
    const preferences = this.parseClientPreferences(client.clientPreferences);

    return {
      primaryConditions,
      secondaryConditions,
      preferredApproaches: preferences.approaches || [],
      sessionPreferences: {
        format: preferences.sessionFormat || ['online', 'in-person'],
        duration: preferences.sessionDuration || [],
        frequency: preferences.sessionFrequency || 'weekly',
      },
      demographics: {
        ageRange: preferences.therapistAge || 'any',
        genderPreference: preferences.therapistGender,
        languagePreference: preferences.languages || ['English'],
      },
      logistics: {
        maxHourlyRate: preferences.maxBudget,
        province: preferences.location,
        insuranceTypes: preferences.insurance || [],
      },
    };
  }

  private calculateConditionMatchScore(
    userProfile: UserConditionProfile,
    therapist: Therapist,
  ): number {
    let score = 0;
    const expertise = therapist.expertise || [];
    const specializations = therapist.illnessSpecializations || [];
    const allTherapistConditions = [...expertise, ...specializations];

    // Primary conditions scoring (higher weight)
    userProfile.primaryConditions.forEach(({ condition, weight }) => {
      if (allTherapistConditions.includes(condition)) {
        score += 30 * (weight / 5); // Scale by severity
      }
    });

    // Secondary conditions scoring (lower weight)
    userProfile.secondaryConditions.forEach(({ condition, weight }) => {
      if (allTherapistConditions.includes(condition)) {
        score += 15 * (weight / 5); // Scale by severity
      }
    });

    // Bonus for specialized expertise depth
    const matchedConditions = [
      ...userProfile.primaryConditions.map((c) => c.condition),
      ...userProfile.secondaryConditions.map((c) => c.condition),
    ].filter((condition) => allTherapistConditions.includes(condition));

    const expertiseDepthBonus = Math.min(matchedConditions.length * 5, 20);
    score += expertiseDepthBonus;

    return Math.min(score, 100); // Cap at 100
  }

  private calculateApproachCompatibilityScore(
    userProfile: UserConditionProfile,
    therapist: Therapist,
  ): number {
    let score = 0;
    const therapistApproaches = therapist.approaches || [];
    const therapistApproachesList =
      therapist.therapeuticApproachesUsedList || [];
    const allApproaches = [...therapistApproaches, ...therapistApproachesList];

    // If user has preferred approaches, match them
    if (userProfile.preferredApproaches.length > 0) {
      const matchedApproaches = userProfile.preferredApproaches.filter(
        (approach) => allApproaches.includes(approach),
      );

      score =
        (matchedApproaches.length / userProfile.preferredApproaches.length) *
        100;
    } else {
      // If no preference specified, give points for evidence-based approaches
      const evidenceBasedApproaches = [
        'Cognitive Behavioral Therapy (CBT)',
        'Dialectical Behavior Therapy (DBT)',
        'Acceptance and Commitment Therapy (ACT)',
        'Eye Movement Desensitization and Reprocessing (EMDR)',
        'Mindfulness-Based Cognitive Therapy (MBCT)',
      ];

      const evidenceBasedCount = allApproaches.filter((approach) =>
        evidenceBasedApproaches.includes(approach),
      ).length;

      score = Math.min(evidenceBasedCount * 20, 80); // Max 80 for general evidence-based
    }

    // Bonus for comprehensive approach diversity
    const diversityBonus = Math.min(allApproaches.length * 2, 20);
    score += diversityBonus;

    return Math.min(score, 100);
  }

  private calculateExperienceAndSuccessScore(
    userProfile: UserConditionProfile,
    therapist: Therapist,
  ): number {
    let score = 0;

    // Years of experience scoring
    const yearsExperience = this.calculateYearsOfExperience(
      therapist.practiceStartDate,
    );
    const additionalYears = therapist.yearsOfExperience || 0;
    const totalYears = Math.max(yearsExperience, additionalYears);

    // Experience scoring curve: diminishing returns after 10 years
    if (totalYears <= 5) {
      score += totalYears * 8; // 0-40 points for 0-5 years
    } else if (totalYears <= 10) {
      score += 40 + (totalYears - 5) * 6; // 40-70 points for 5-10 years
    } else {
      score += 70 + Math.min((totalYears - 10) * 2, 20); // 70-90 points for 10+ years
    }

    // Treatment success rates scoring
    const successRates =
      (therapist.treatmentSuccessRates as Record<string, number>) || {};
    const relevantConditions = [
      ...userProfile.primaryConditions.map((c) => c.condition),
      ...userProfile.secondaryConditions.map((c) => c.condition),
    ];

    let successRateBonus = 0;
    let applicableRates = 0;

    relevantConditions.forEach((condition) => {
      if (successRates[condition] !== undefined) {
        successRateBonus += successRates[condition];
        applicableRates++;
      }
    });

    if (applicableRates > 0) {
      const averageSuccessRate = successRateBonus / applicableRates;
      score += (averageSuccessRate / 100) * 20; // Up to 20 bonus points
    }

    return Math.min(score, 100);
  }

  private async calculateReviewScore(
    therapist: Therapist & { reviews: any[] },
  ): Promise<number> {
    if (!therapist.reviews || therapist.reviews.length === 0) {
      return 50; // Neutral score for new therapists
    }

    const approvedReviews = therapist.reviews.filter(
      (review) => review.status === 'APPROVED',
    );

    if (approvedReviews.length === 0) {
      return 50;
    }

    // Calculate average rating
    const totalRating = approvedReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    const averageRating = totalRating / approvedReviews.length;

    // Convert 1-5 rating to 0-100 score
    let score = ((averageRating - 1) / 4) * 100;

    // Bonus for volume of reviews (credibility factor)
    const volumeBonus = Math.min(approvedReviews.length * 2, 20);
    score += volumeBonus;

    // Penalty for very few reviews
    if (approvedReviews.length < 3) {
      score *= 0.8; // 20% penalty for low review count
    }

    return Math.min(score, 100);
  }

  private calculateLogisticsScore(
    userProfile: UserConditionProfile,
    therapist: Therapist,
  ): number {
    let score = 100; // Start with perfect score, deduct for mismatches

    // Location matching
    if (
      userProfile.logistics.province &&
      therapist.province !== userProfile.logistics.province
    ) {
      score -= 30; // Significant penalty for location mismatch
    }

    // Budget compatibility
    if (
      userProfile.logistics.maxHourlyRate &&
      Number(therapist.hourlyRate) > userProfile.logistics.maxHourlyRate
    ) {
      score -= 40; // Major penalty for budget overrun
    }

    // Insurance compatibility
    if (
      userProfile.logistics.insuranceTypes &&
      userProfile.logistics.insuranceTypes.length > 0
    ) {
      const acceptedTypes = therapist.acceptedInsuranceTypes || [];
      const hasInsuranceMatch = userProfile.logistics.insuranceTypes.some(
        (type) => acceptedTypes.includes(type),
      );

      if (!hasInsuranceMatch && therapist.acceptsInsurance) {
        score -= 20; // Penalty for insurance mismatch
      }
    }

    // Language compatibility
    const therapistLanguages = therapist.languagesOffered || ['English'];
    const hasLanguageMatch = userProfile.demographics.languagePreference.some(
      (lang) => therapistLanguages.includes(lang),
    );

    if (!hasLanguageMatch) {
      score -= 25; // Penalty for language barrier
    }

    return Math.max(score, 0);
  }

  private buildMatchExplanation(
    userProfile: UserConditionProfile,
    therapist: Therapist & { reviews: any[] },
    conditionScore: number,
    approachScore: number,
    experienceScore: number,
    reviewScore: number,
  ): TherapistScore['matchExplanation'] {
    const expertise = therapist.expertise || [];
    const specializations = therapist.illnessSpecializations || [];
    const approaches = [
      ...(therapist.approaches || []),
      ...(therapist.therapeuticApproachesUsedList || []),
    ];

    const primaryMatches = userProfile.primaryConditions
      .map((c) => c.condition)
      .filter((condition) =>
        [...expertise, ...specializations].includes(condition),
      );

    const secondaryMatches = userProfile.secondaryConditions
      .map((c) => c.condition)
      .filter((condition) =>
        [...expertise, ...specializations].includes(condition),
      );

    const approachMatches = userProfile.preferredApproaches.filter((approach) =>
      approaches.includes(approach),
    );

    const experienceYears = this.calculateYearsOfExperience(
      therapist.practiceStartDate,
    );

    const approvedReviews =
      therapist.reviews?.filter((r) => r.status === 'APPROVED') || [];
    const averageRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
          approvedReviews.length
        : 0;

    const successRates =
      (therapist.treatmentSuccessRates as Record<string, number>) || {};

    return {
      primaryMatches,
      secondaryMatches,
      approachMatches,
      experienceYears: Math.max(
        experienceYears,
        therapist.yearsOfExperience || 0,
      ),
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: approvedReviews.length,
      successRates,
    };
  }

  private parseClientPreferences(preferences: any[]): Record<string, any> {
    const parsed: Record<string, any> = {};

    preferences.forEach((pref) => {
      try {
        // Handle JSON string values
        if (typeof pref.value === 'string' && pref.value.startsWith('[')) {
          parsed[pref.key] = JSON.parse(pref.value);
        } else {
          parsed[pref.key] = pref.value;
        }
      } catch {
        parsed[pref.key] = pref.value; // Fallback to raw value
      }
    });

    return parsed;
  }

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

    return Math.max(years, 0);
  }
}
