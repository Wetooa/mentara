import { Injectable } from '@nestjs/common';
import { Therapist, Client, PreAssessment } from '@prisma/client';

export interface PersonalityCompatibility {
  communicationStyle: number;
  personalityMatch: number;
  culturalCompatibility: number;
  overallCompatibility: number;
}

export interface SessionCompatibility {
  formatMatch: number; // online vs in-person
  durationMatch: number;
  frequencyMatch: number;
  schedulingCompatibility: number;
  overallCompatibility: number;
}

export interface DemographicCompatibility {
  ageCompatibility: number;
  genderCompatibility: number;
  languageCompatibility: number;
  culturalCompatibility: number;
  overallCompatibility: number;
}

export interface CompatibilityAnalysis {
  personalityCompatibility: PersonalityCompatibility;
  sessionCompatibility: SessionCompatibility;
  demographicCompatibility: DemographicCompatibility;
  overallCompatibilityScore: number;
  compatibilityFactors: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
}

@Injectable()
export class CompatibilityAnalysisService {
  async analyzeCompatibility(
    client: Client & {
      preAssessment: PreAssessment;
      clientPreferences: any[];
      user: any;
    },
    therapist: Therapist & { user: any },
  ): Promise<CompatibilityAnalysis> {
    const clientPrefs = this.parseClientPreferences(client.clientPreferences);
    const assessmentData = client.preAssessment;

    // Analyze different compatibility dimensions
    const personalityCompatibility = this.analyzePersonalityCompatibility(
      assessmentData,
      clientPrefs,
      therapist,
    );

    const sessionCompatibility = this.analyzeSessionCompatibility(
      clientPrefs,
      therapist,
    );

    const demographicCompatibility = this.analyzeDemographicCompatibility(
      client,
      clientPrefs,
      therapist,
    );

    // Calculate overall compatibility score
    const overallCompatibilityScore = this.calculateOverallCompatibility(
      personalityCompatibility,
      sessionCompatibility,
      demographicCompatibility,
    );

    // Generate compatibility factors and recommendations
    const compatibilityFactors = this.generateCompatibilityFactors(
      personalityCompatibility,
      sessionCompatibility,
      demographicCompatibility,
      clientPrefs,
      therapist,
    );

    return {
      personalityCompatibility,
      sessionCompatibility,
      demographicCompatibility,
      overallCompatibilityScore,
      compatibilityFactors,
    };
  }

  private analyzePersonalityCompatibility(
    assessment: PreAssessment,
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): PersonalityCompatibility {
    // Communication style analysis
    const communicationStyle = this.analyzeCommunicationStyle(
      assessment,
      clientPrefs,
      therapist,
    );

    // Personality matching based on assessment results
    const personalityMatch = this.analyzePersonalityMatch(
      assessment,
      clientPrefs,
      therapist,
    );

    // Cultural compatibility
    const culturalCompatibility = this.analyzeCulturalCompatibility(
      clientPrefs,
      therapist,
    );

    const overallCompatibility = Math.round(
      communicationStyle * 0.4 +
        personalityMatch * 0.4 +
        culturalCompatibility * 0.2,
    );

    return {
      communicationStyle,
      personalityMatch,
      culturalCompatibility,
      overallCompatibility,
    };
  }

  private analyzeCommunicationStyle(
    assessment: PreAssessment,
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    let score = 70; // Start with neutral score

    const severityLevels = assessment.severityLevels as Record<string, string>;

    // Analyze based on mental health conditions and preferred communication style
    const hasAnxiety =
      severityLevels['anxiety'] &&
      this.getSeverityWeight(severityLevels['anxiety']) >= 3;
    const hasDepression =
      severityLevels['depression'] &&
      this.getSeverityWeight(severityLevels['depression']) >= 3;
    const hasPTSD =
      severityLevels['ptsd'] &&
      this.getSeverityWeight(severityLevels['ptsd']) >= 3;

    const preferredStyle =
      clientPrefs.communicationStyle || clientPrefs.therapistStyle;
    const therapistApproaches = therapist.approaches || [];

    // Match communication preferences
    if (preferredStyle) {
      switch (preferredStyle) {
        case 'direct':
          if (
            therapistApproaches.includes('Cognitive Behavioral Therapy (CBT)')
          ) {
            score += 20;
          }
          break;
        case 'gentle':
          if (
            therapistApproaches.includes('Person-Centered Therapy') ||
            therapistApproaches.includes('Humanistic Therapy')
          ) {
            score += 20;
          }
          break;
        case 'structured':
          if (
            therapistApproaches.includes(
              'Dialectical Behavior Therapy (DBT)',
            ) ||
            therapistApproaches.includes('Cognitive Behavioral Therapy (CBT)')
          ) {
            score += 20;
          }
          break;
        case 'flexible':
          if (
            therapistApproaches.includes('Integrative Therapy') ||
            therapistApproaches.includes('Eclectic Therapy')
          ) {
            score += 20;
          }
          break;
      }
    }

    // Adjust based on specific conditions
    if (
      hasAnxiety &&
      therapistApproaches.includes('Cognitive Behavioral Therapy (CBT)')
    ) {
      score += 10; // CBT is effective for anxiety
    }

    if (
      hasPTSD &&
      therapistApproaches.includes(
        'Eye Movement Desensitization and Reprocessing (EMDR)',
      )
    ) {
      score += 15; // EMDR is specialized for PTSD
    }

    if (
      hasDepression &&
      therapistApproaches.includes('Interpersonal Therapy (IPT)')
    ) {
      score += 10; // IPT is effective for depression
    }

    return Math.min(score, 100);
  }

  private analyzePersonalityMatch(
    assessment: PreAssessment,
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    let score = 70; // Start with neutral score

    const severityLevels = assessment.severityLevels as Record<string, string>;

    // Analyze introversion/extraversion needs
    const socialAnxiety = severityLevels['social_anxiety']
      ? this.getSeverityWeight(severityLevels['social_anxiety'])
      : 0;

    if (socialAnxiety >= 3) {
      // Introverted clients may prefer calmer, more reserved therapists
      const therapistPersonality = clientPrefs.therapistPersonality;
      if (
        therapistPersonality === 'calm' ||
        therapistPersonality === 'reserved'
      ) {
        score += 15;
      }
    }

    // Analyze need for structure vs flexibility
    const hasOCD =
      severityLevels['ocd'] &&
      this.getSeverityWeight(severityLevels['ocd']) >= 3;
    const hasADHD =
      severityLevels['adhd'] &&
      this.getSeverityWeight(severityLevels['adhd']) >= 3;

    if (hasOCD) {
      // OCD clients often benefit from structured approaches
      const approaches = therapist.approaches || [];
      if (
        approaches.includes('Cognitive Behavioral Therapy (CBT)') ||
        approaches.includes('Exposure and Response Prevention (ERP)')
      ) {
        score += 20;
      }
    }

    if (hasADHD) {
      // ADHD clients may benefit from more interactive approaches
      const approaches = therapist.approaches || [];
      if (
        approaches.includes('Behavioral Therapy') ||
        approaches.includes('Coaching')
      ) {
        score += 15;
      }
    }

    // Match warmth preferences
    const warmthPreference = clientPrefs.therapistWarmth;
    if (
      warmthPreference === 'high' &&
      therapist.approaches?.includes('Person-Centered Therapy')
    ) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private analyzeCulturalCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    let score = 80; // Start with good cultural neutrality

    // Language compatibility
    const clientLanguages = clientPrefs.preferredLanguages || ['English'];
    const therapistLanguages = therapist.languagesOffered || ['English'];

    const hasLanguageMatch = clientLanguages.some((lang) =>
      therapistLanguages.includes(lang),
    );

    if (!hasLanguageMatch) {
      score -= 30; // Significant penalty for language barriers
    } else if (
      clientLanguages.length > 1 &&
      clientLanguages.filter((lang) => therapistLanguages.includes(lang))
        .length > 1
    ) {
      score += 10; // Bonus for multiple shared languages
    }

    // Cultural background considerations
    const culturalPreference =
      clientPrefs.culturalBackground || clientPrefs.therapistCulture;
    if (culturalPreference && culturalPreference !== 'no_preference') {
      // This would require additional therapist cultural background data
      // For now, maintain neutral score unless specifically matched
      score += 0;
    }

    // Religious/spiritual considerations
    const spiritualPreference = clientPrefs.spiritualPreferences;
    const therapistApproaches = therapist.approaches || [];

    if (
      spiritualPreference === 'important' &&
      therapistApproaches.includes('Spiritual Therapy')
    ) {
      score += 15;
    } else if (
      spiritualPreference === 'avoid' &&
      therapistApproaches.includes('Spiritual Therapy')
    ) {
      score -= 20;
    }

    return Math.max(score, 0);
  }

  private analyzeSessionCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): SessionCompatibility {
    // Format matching (online vs in-person)
    const formatMatch = this.analyzeFormatCompatibility(clientPrefs, therapist);

    // Duration matching
    const durationMatch = this.analyzeDurationCompatibility(
      clientPrefs,
      therapist,
    );

    // Frequency matching
    const frequencyMatch = this.analyzeFrequencyCompatibility(
      clientPrefs,
      therapist,
    );

    // Scheduling compatibility (future enhancement)
    const schedulingCompatibility = 80; // Placeholder - would integrate with availability system

    const overallCompatibility = Math.round(
      formatMatch * 0.3 +
        durationMatch * 0.2 +
        frequencyMatch * 0.2 +
        schedulingCompatibility * 0.3,
    );

    return {
      formatMatch,
      durationMatch,
      frequencyMatch,
      schedulingCompatibility,
      overallCompatibility,
    };
  }

  private analyzeFormatCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    const clientFormat = clientPrefs.sessionFormat ||
      clientPrefs.preferredFormat || ['online', 'in-person'];

    let score = 70; // Neutral base

    // Check if therapist supports client's preferred format
    if (Array.isArray(clientFormat)) {
      if (
        clientFormat.includes('online') &&
        therapist.providedOnlineTherapyBefore
      ) {
        score += 15;
      }

      if (clientFormat.includes('in-person')) {
        score += 15; // Assume most therapists can do in-person
      }

      if (
        clientFormat.includes('online') &&
        !therapist.comfortableUsingVideoConferencing
      ) {
        score -= 25; // Penalty if therapist not comfortable with required format
      }
    }

    return Math.min(score, 100);
  }

  private analyzeDurationCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    const clientDuration =
      clientPrefs.sessionDuration || clientPrefs.preferredDuration;
    const therapistDurations = therapist.preferredSessionLength || [50, 60];

    if (!clientDuration) {
      return 80; // Neutral score if no preference
    }

    const clientDurationNum = parseInt(clientDuration);
    const hasMatch =
      therapistDurations.includes(clientDurationNum) ||
      therapistDurations.some((d) => Math.abs(d - clientDurationNum) <= 10);

    return hasMatch ? 90 : 60;
  }

  private analyzeFrequencyCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    const clientFrequency = clientPrefs.sessionFrequency;

    if (!clientFrequency) {
      return 80; // Neutral if no preference
    }

    // Most therapists are flexible with frequency
    // This could be enhanced with therapist availability data
    return 85;
  }

  private analyzeDemographicCompatibility(
    client: Client & { user: any },
    clientPrefs: Record<string, any>,
    therapist: Therapist & { user: any },
  ): DemographicCompatibility {
    const ageCompatibility = this.analyzeAgeCompatibility(
      client,
      clientPrefs,
      therapist,
    );
    const genderCompatibility = this.analyzeGenderCompatibility(
      clientPrefs,
      therapist,
    );
    const languageCompatibility = this.analyzeLanguageCompatibility(
      clientPrefs,
      therapist,
    );
    const culturalCompatibility = this.analyzeCulturalCompatibility(
      clientPrefs,
      therapist,
    );

    const overallCompatibility = Math.round(
      ageCompatibility * 0.2 +
        genderCompatibility * 0.3 +
        languageCompatibility * 0.3 +
        culturalCompatibility * 0.2,
    );

    return {
      ageCompatibility,
      genderCompatibility,
      languageCompatibility,
      culturalCompatibility,
      overallCompatibility,
    };
  }

  private analyzeAgeCompatibility(
    client: Client & { user: any },
    clientPrefs: Record<string, any>,
    therapist: Therapist & { user: any },
  ): number {
    const agePreference = clientPrefs.therapistAge || clientPrefs.agePreference;

    if (!agePreference || agePreference === 'any') {
      return 90; // No preference means high compatibility
    }

    // This would require therapist age data in the user model
    // For now, return neutral score
    return 75;
  }

  private analyzeGenderCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist & { user: any },
  ): number {
    const genderPreference =
      clientPrefs.therapistGender || clientPrefs.genderPreference;

    if (
      !genderPreference ||
      genderPreference === 'any' ||
      genderPreference === 'no_preference'
    ) {
      return 90; // No preference means high compatibility
    }

    // This would require gender data in the user model
    // For now, return neutral score unless specific matching is implemented
    return 75;
  }

  private analyzeLanguageCompatibility(
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): number {
    const clientLanguages = clientPrefs.preferredLanguages ||
      clientPrefs.languages || ['English'];
    const therapistLanguages = therapist.languagesOffered || ['English'];

    const matchedLanguages = clientLanguages.filter((lang) =>
      therapistLanguages.includes(lang),
    );

    if (matchedLanguages.length === 0) {
      return 20; // Poor compatibility with no shared languages
    }

    const matchRatio = matchedLanguages.length / clientLanguages.length;
    return Math.round(20 + matchRatio * 80); // Scale from 20-100
  }

  private calculateOverallCompatibility(
    personality: PersonalityCompatibility,
    session: SessionCompatibility,
    demographic: DemographicCompatibility,
  ): number {
    return Math.round(
      personality.overallCompatibility * 0.4 +
        session.overallCompatibility * 0.3 +
        demographic.overallCompatibility * 0.3,
    );
  }

  private generateCompatibilityFactors(
    personality: PersonalityCompatibility,
    session: SessionCompatibility,
    demographic: DemographicCompatibility,
    clientPrefs: Record<string, any>,
    therapist: Therapist,
  ): { strengths: string[]; concerns: string[]; recommendations: string[] } {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths
    if (personality.communicationStyle >= 80) {
      strengths.push('Excellent communication style match');
    }
    if (personality.personalityMatch >= 80) {
      strengths.push('Strong personality compatibility');
    }
    if (session.formatMatch >= 80) {
      strengths.push('Session format preferences align well');
    }
    if (demographic.languageCompatibility >= 80) {
      strengths.push('Shared language proficiency');
    }

    // Identify concerns
    if (personality.communicationStyle < 60) {
      concerns.push('Communication style may not be ideal match');
    }
    if (session.formatMatch < 60) {
      concerns.push('Session format preferences may conflict');
    }
    if (demographic.languageCompatibility < 60) {
      concerns.push('Language barriers may affect communication');
    }

    // Generate recommendations
    if (personality.overallCompatibility < 70) {
      recommendations.push(
        'Consider discussing communication preferences in initial session',
      );
    }
    if (session.overallCompatibility < 70) {
      recommendations.push('Flexibility in session format may be beneficial');
    }
    if (demographic.overallCompatibility < 70) {
      recommendations.push(
        'Cultural sensitivity and accommodation may be important',
      );
    }

    return { strengths, concerns, recommendations };
  }

  private parseClientPreferences(preferences: any[]): Record<string, any> {
    const parsed: Record<string, any> = {};

    preferences.forEach((pref) => {
      try {
        if (typeof pref.value === 'string' && pref.value.startsWith('[')) {
          parsed[pref.key] = JSON.parse(pref.value);
        } else {
          parsed[pref.key] = pref.value;
        }
      } catch {
        parsed[pref.key] = pref.value;
      }
    });

    return parsed;
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
      Subthreshold: 2,
      Positive: 4,
      Negative: 0,
      None: 0,
    };

    return severityWeights[severity] || 1;
  }
}
