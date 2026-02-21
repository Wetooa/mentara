import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma-client.provider';
import { Therapist } from '@prisma/client';

export interface PreferenceMatchScore {
  genderMatch: number; // 0-100
  ageMatch: number; // 0-100
  languageMatch: number; // 0-100
  approachMatch: number; // 0-100
  sessionFormatMatch: number; // 0-100
  budgetMatch: number; // 0-100
  locationMatch: number; // 0-100
  overallScore: number; // 0-100
  explanation: {
    genderMatch: string;
    ageMatch: string;
    languageMatch: string;
    approachMatch: string;
    sessionFormatMatch: string;
    budgetMatch: string;
    locationMatch: string;
    recommendations: string[];
  };
}

@Injectable()
export class PreferenceMatchingService {
  private readonly logger = new Logger(PreferenceMatchingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate preference-based match score
   */
  async calculatePreferenceMatch(
    clientId: string,
    therapist: Therapist,
  ): Promise<PreferenceMatchScore> {
    try {
      // Get client preferences
      const preferences = await this.prisma.clientPreferences.findUnique({
        where: { clientId },
      });

      if (!preferences) {
        return this.getNeutralScore();
      }

      // Calculate individual match scores
      const genderMatch = this.calculateGenderMatch(preferences, therapist);
      const ageMatch = this.calculateAgeMatch(preferences, therapist);
      const languageMatch = this.calculateLanguageMatch(preferences, therapist);
      const approachMatch = this.calculateApproachMatch(preferences, therapist);
      const sessionFormatMatch = this.calculateSessionFormatMatch(preferences, therapist);
      const budgetMatch = this.calculateBudgetMatch(preferences, therapist);
      const locationMatch = this.calculateLocationMatch(preferences, therapist);

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        genderMatch * 0.1 +
          ageMatch * 0.1 +
          languageMatch * 0.2 +
          approachMatch * 0.25 +
          sessionFormatMatch * 0.15 +
          budgetMatch * 0.1 +
          locationMatch * 0.1,
      );

      // Build explanation
      const explanation = this.buildExplanation(
        preferences,
        therapist,
        genderMatch,
        ageMatch,
        languageMatch,
        approachMatch,
        sessionFormatMatch,
        budgetMatch,
        locationMatch,
      );

      return {
        genderMatch,
        ageMatch,
        languageMatch,
        approachMatch,
        sessionFormatMatch,
        budgetMatch,
        locationMatch,
        overallScore,
        explanation,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating preference match: ${error instanceof Error ? error.message : String(error)}`,
      );
      return this.getNeutralScore();
    }
  }

  /**
   * Calculate gender preference match
   */
  private calculateGenderMatch(
    preferences: any,
    therapist: Therapist,
  ): number {
    if (!preferences.genderPreference || preferences.genderPreference === 'no-preference') {
      return 50; // Neutral if no preference
    }

    // Get therapist gender from user profile
    // Note: This would require fetching therapist.user.gender
    // For now, we'll return neutral as gender might not be in schema
    return 50;
  }

  /**
   * Calculate age preference match
   */
  private calculateAgeMatch(preferences: any, therapist: Therapist): number {
    if (!preferences.agePreference || preferences.agePreference === 'no-preference') {
      return 50; // Neutral if no preference
    }

    // Calculate therapist age from practiceStartDate (proxy)
    const yearsSinceStart = new Date().getFullYear() - therapist.practiceStartDate.getFullYear();
    const estimatedAge = 25 + yearsSinceStart; // Rough estimate

    // This is simplified - would need actual therapist age
    return 50; // Neutral for now
  }

  /**
   * Calculate language preference match
   */
  private calculateLanguageMatch(
    preferences: any,
    therapist: Therapist,
  ): number {
    const clientLanguages = preferences.languagePreferences || [];
    const therapistLanguages = therapist.languagesOffered || [];

    if (clientLanguages.length === 0) {
      return 50; // Neutral if no preference
    }

    // Check for language matches
    const matches = clientLanguages.filter((lang: string) =>
      therapistLanguages.some(
        (tl) =>
          tl.toLowerCase().includes(lang.toLowerCase()) ||
          lang.toLowerCase().includes(tl.toLowerCase()),
      ),
    );

    if (matches.length === 0) {
      return 0; // No match - critical issue
    }

    // Score based on match ratio
    return Math.round((matches.length / clientLanguages.length) * 100);
  }

  /**
   * Calculate treatment approach match
   */
  private calculateApproachMatch(
    preferences: any,
    therapist: Therapist,
  ): number {
    const clientApproaches = preferences.treatmentApproaches || [];
    const therapistApproaches = [
      ...(therapist.approaches || []),
      ...(therapist.therapeuticApproachesUsedList || []),
    ];

    if (clientApproaches.length === 0) {
      return 50; // Neutral if no preference
    }

    // Check for approach matches
    const matches = clientApproaches.filter((approach: string) =>
      therapistApproaches.some(
        (ta) =>
          ta.toLowerCase().includes(approach.toLowerCase()) ||
          approach.toLowerCase().includes(ta.toLowerCase()),
      ),
    );

    // Score based on match ratio
    return Math.round((matches.length / clientApproaches.length) * 100);
  }

  /**
   * Calculate session format match
   */
  private calculateSessionFormatMatch(
    preferences: any,
    therapist: Therapist,
  ): number {
    const clientFormat = preferences.sessionFormat;
    const therapistAccepts = therapist.acceptTypes || [];

    if (!clientFormat || clientFormat === 'no-preference') {
      return 50; // Neutral if no preference
    }

    // Map client format to therapist acceptTypes
    const formatMapping: Record<string, string[]> = {
      'in-person': ['in-person', 'in_person', 'onsite'],
      video: ['video', 'online', 'virtual', 'telehealth'],
      phone: ['phone', 'telephone', 'call'],
    };

    const mappedFormats = formatMapping[clientFormat] || [clientFormat];
    const hasMatch = mappedFormats.some((format) =>
      therapistAccepts.some(
        (ta) =>
          ta.toLowerCase().includes(format.toLowerCase()) ||
          format.toLowerCase().includes(ta.toLowerCase()),
      ),
    );

    return hasMatch ? 100 : 0;
  }

  /**
   * Calculate budget match
   */
  private calculateBudgetMatch(preferences: any, therapist: Therapist): number {
    const budgetRange = preferences.budgetRange;
    const therapistRate = Number(therapist.hourlyRate);

    if (!budgetRange || budgetRange === 'insurance') {
      // If using insurance, check if therapist accepts insurance
      if (therapist.acceptsInsurance) {
        return 100;
      }
      return 50; // Neutral
    }

    // Map budget range to max rate
    const budgetMapping: Record<string, number> = {
      'under-100': 100,
      '100-150': 150,
      '150-200': 200,
      '200-plus': 10000, // Very high limit
    };

    const maxRate = budgetMapping[budgetRange];
    if (!maxRate) return 50;

    if (therapistRate <= maxRate) {
      // Within budget
      if (therapistRate <= maxRate * 0.8) {
        return 100; // Well within budget
      }
      return 80; // Within budget but close to limit
    } else {
      // Over budget
      const overage = (therapistRate - maxRate) / maxRate;
      if (overage > 0.2) {
        return 0; // Significantly over budget
      }
      return 30; // Slightly over budget
    }
  }

  /**
   * Calculate location match
   */
  private calculateLocationMatch(
    preferences: any,
    therapist: Therapist,
  ): number {
    const clientLocation = preferences.locationPreference;
    const therapistProvince = therapist.province;

    if (!clientLocation) {
      return 50; // Neutral if no preference
    }

    // Simple string matching (could be enhanced with geocoding)
    if (
      therapistProvince &&
      (therapistProvince.toLowerCase().includes(clientLocation.toLowerCase()) ||
        clientLocation.toLowerCase().includes(therapistProvince.toLowerCase()))
    ) {
      return 100; // Match
    }

    return 0; // No match
  }

  /**
   * Build explanation for preference match
   */
  private buildExplanation(
    preferences: any,
    therapist: Therapist,
    genderMatch: number,
    ageMatch: number,
    languageMatch: number,
    approachMatch: number,
    sessionFormatMatch: number,
    budgetMatch: number,
    locationMatch: number,
  ): {
    genderMatch: string;
    ageMatch: string;
    languageMatch: string;
    approachMatch: string;
    sessionFormatMatch: string;
    budgetMatch: string;
    locationMatch: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Gender match explanation
    const genderMatchText =
      preferences.genderPreference && preferences.genderPreference !== 'no-preference'
        ? genderMatch > 50
          ? 'Gender preference matched'
          : 'Gender preference not matched'
        : 'No gender preference specified';

    // Age match explanation
    const ageMatchText =
      preferences.agePreference && preferences.agePreference !== 'no-preference'
        ? ageMatch > 50
          ? 'Age preference matched'
          : 'Age preference not matched'
        : 'No age preference specified';

    // Language match explanation
    let languageMatchText = '';
    if (preferences.languagePreferences && preferences.languagePreferences.length > 0) {
      if (languageMatch === 100) {
        languageMatchText = 'All preferred languages available';
      } else if (languageMatch > 0) {
        languageMatchText = 'Some preferred languages available';
      } else {
        languageMatchText = 'Language preference not matched - may be a barrier';
        recommendations.push('Language mismatch may affect communication');
      }
    } else {
      languageMatchText = 'No language preference specified';
    }

    // Approach match explanation
    let approachMatchText = '';
    if (preferences.treatmentApproaches && preferences.treatmentApproaches.length > 0) {
      if (approachMatch === 100) {
        approachMatchText = 'All preferred treatment approaches available';
      } else if (approachMatch > 50) {
        approachMatchText = 'Most preferred treatment approaches available';
      } else {
        approachMatchText = 'Limited match on preferred treatment approaches';
      }
    } else {
      approachMatchText = 'No treatment approach preference specified';
    }

    // Session format match explanation
    let sessionFormatMatchText = '';
    if (preferences.sessionFormat && preferences.sessionFormat !== 'no-preference') {
      if (sessionFormatMatch === 100) {
        sessionFormatMatchText = `Preferred session format (${preferences.sessionFormat}) available`;
      } else {
        sessionFormatMatchText = `Preferred session format (${preferences.sessionFormat}) not available`;
        recommendations.push('Session format preference not matched');
      }
    } else {
      sessionFormatMatchText = 'No session format preference specified';
    }

    // Budget match explanation
    let budgetMatchText = '';
    if (preferences.budgetRange && preferences.budgetRange !== 'insurance') {
      if (budgetMatch >= 80) {
        budgetMatchText = 'Within your budget range';
      } else if (budgetMatch > 0) {
        budgetMatchText = 'Slightly over your budget range';
        recommendations.push('Therapist rate exceeds your budget preference');
      } else {
        budgetMatchText = 'Significantly over your budget range';
        recommendations.push('Therapist rate is significantly over your budget');
      }
    } else if (preferences.budgetRange === 'insurance') {
      if (therapist.acceptsInsurance) {
        budgetMatchText = 'Accepts your insurance';
      } else {
        budgetMatchText = 'Does not accept insurance';
        recommendations.push('Therapist does not accept insurance');
      }
    } else {
      budgetMatchText = 'No budget preference specified';
    }

    // Location match explanation
    let locationMatchText = '';
    if (preferences.locationPreference) {
      if (locationMatch === 100) {
        locationMatchText = 'Location preference matched';
      } else {
        locationMatchText = 'Location preference not matched';
        recommendations.push('Therapist location does not match your preference');
      }
    } else {
      locationMatchText = 'No location preference specified';
    }

    return {
      genderMatch: genderMatchText,
      ageMatch: ageMatchText,
      languageMatch: languageMatchText,
      approachMatch: approachMatchText,
      sessionFormatMatch: sessionFormatMatchText,
      budgetMatch: budgetMatchText,
      locationMatch: locationMatchText,
      recommendations,
    };
  }

  /**
   * Get neutral score when preferences are unavailable
   */
  private getNeutralScore(): PreferenceMatchScore {
    return {
      genderMatch: 50,
      ageMatch: 50,
      languageMatch: 50,
      approachMatch: 50,
      sessionFormatMatch: 50,
      budgetMatch: 50,
      locationMatch: 50,
      overallScore: 50,
      explanation: {
        genderMatch: 'Preference data unavailable',
        ageMatch: 'Preference data unavailable',
        languageMatch: 'Preference data unavailable',
        approachMatch: 'Preference data unavailable',
        sessionFormatMatch: 'Preference data unavailable',
        budgetMatch: 'Preference data unavailable',
        locationMatch: 'Preference data unavailable',
        recommendations: [],
      },
    };
  }
}

