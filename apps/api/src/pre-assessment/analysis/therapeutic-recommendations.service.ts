import { Injectable, Logger } from '@nestjs/common';
import {
  ClinicalInsight,
  ClinicalProfile,
  TreatmentRecommendation,
} from './clinical-insights.service';

export interface TherapistMatchCriteria {
  expertise: string[];
  illnessSpecializations: string[];
  areasOfExpertise: string[];
}

export interface InterventionRecommendation {
  type:
  | 'therapy'
  | 'psychiatric_eval'
  | 'crisis_intervention'
  | 'support_group'
  | 'self_help';
  priority: number;
  urgency: 'immediate' | 'high' | 'moderate' | 'routine';
  description: string;
  provider: string;
  duration: string;
  frequency: string;
  goals: string[];
}

export interface PersonalizedTreatmentPlan {
  overallStrategy: string;
  phaseBasedPlan: TreatmentPhase[];
  therapistCriteria: TherapistMatchCriteria;
  interventionRecommendations: InterventionRecommendation[];
  selfCareRecommendations: SelfCareRecommendation[];
  monitoringPlan: MonitoringPlan;
  contingencyPlan: ContingencyPlan;
  successMetrics: SuccessMetric[];
}

export interface TreatmentPhase {
  phase: number;
  name: string;
  duration: string;
  goals: string[];
  approaches: string[];
  focus: string[];
  successCriteria: string[];
}

export interface SelfCareRecommendation {
  category: 'lifestyle' | 'mindfulness' | 'social' | 'physical' | 'emotional';
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  frequency: string;
  rationale: string;
}

export interface MonitoringPlan {
  assessmentSchedule: string;
  keyMetrics: string[];
  warningSigns: string[];
  reviewPoints: string[];
}

export interface ContingencyPlan {
  crisisContacts: string[];
  emergencySteps: string[];
  escalationTriggers: string[];
  safetyResources: string[];
}

export interface SuccessMetric {
  metric: string;
  targetImprovement: string;
  timeframe: string;
  measurementMethod: string;
}

@Injectable()
export class TherapeuticRecommendationsService {
  private readonly logger = new Logger(TherapeuticRecommendationsService.name);

  /**
   * Generate comprehensive personalized treatment plan
   */
  async generatePersonalizedTreatmentPlan(
    clinicalProfile: ClinicalProfile,
  ): Promise<PersonalizedTreatmentPlan> {
    this.logger.log('Generating personalized treatment plan');

    try {
      const overallStrategy = this.determineOverallStrategy(clinicalProfile);
      const phaseBasedPlan = this.createPhaseBasedPlan(clinicalProfile);
      const therapistCriteria = this.generateTherapistCriteria(clinicalProfile);
      const interventionRecommendations =
        this.generateInterventionRecommendations(clinicalProfile);
      const selfCareRecommendations =
        this.generateSelfCareRecommendations(clinicalProfile);
      const monitoringPlan = this.createMonitoringPlan(clinicalProfile);
      const contingencyPlan = this.createContingencyPlan(clinicalProfile);
      const successMetrics = this.defineSuccessMetrics(clinicalProfile);

      return {
        overallStrategy,
        phaseBasedPlan,
        therapistCriteria,
        interventionRecommendations,
        selfCareRecommendations,
        monitoringPlan,
        contingencyPlan,
        successMetrics,
      };
    } catch (error) {
      this.logger.error('Error generating treatment plan:', error);
      throw new Error('Failed to generate personalized treatment plan');
    }
  }

  /**
   * Determine overall treatment strategy based on clinical profile
   */
  private determineOverallStrategy(clinicalProfile: ClinicalProfile): string {
    const { primaryConditions, riskFactors, overallRiskLevel } =
      clinicalProfile;

    if (overallRiskLevel === 'critical') {
      return 'Crisis stabilization followed by intensive therapeutic intervention with coordinated care team approach';
    }

    if (overallRiskLevel === 'high') {
      return 'Immediate therapeutic intervention with frequent monitoring and structured treatment approach';
    }

    if (primaryConditions.length > 2) {
      return 'Integrated treatment approach addressing multiple conditions with prioritized intervention sequence';
    }

    if (primaryConditions.length === 1) {
      const condition = primaryConditions[0];
      return `Focused ${condition.condition.toLowerCase()} treatment using evidence-based approaches with gradual skill building`;
    }

    return 'Preventive intervention with skill-building and monitoring approach';
  }

  /**
   * Create phase-based treatment plan
   */
  private createPhaseBasedPlan(
    clinicalProfile: ClinicalProfile,
  ): TreatmentPhase[] {
    const phases: TreatmentPhase[] = [];
    const { primaryConditions, overallRiskLevel, riskFactors } =
      clinicalProfile;

    // Phase 1: Stabilization (if needed)
    if (overallRiskLevel === 'critical' || overallRiskLevel === 'high') {
      phases.push({
        phase: 1,
        name: 'Crisis Stabilization and Safety',
        duration: '2-4 weeks',
        goals: [
          'Ensure immediate safety',
          'Stabilize acute symptoms',
          'Establish therapeutic rapport',
          'Create safety plan',
        ],
        approaches: [
          'Crisis Intervention',
          'Safety Planning',
          'Supportive Therapy',
        ],
        focus: ['Safety', 'Symptom stabilization', 'Crisis management'],
        successCriteria: [
          'No safety concerns',
          'Reduced acute distress',
          'Engagement in treatment',
          'Functioning safety plan',
        ],
      });
    }

    // Phase 2: Core Treatment
    const corePhase = phases.length + 1;
    const primaryCondition = primaryConditions[0];

    phases.push({
      phase: corePhase,
      name: `Core ${primaryCondition?.condition || 'Therapeutic'} Treatment`,
      duration: this.estimateCoreTreatmentDuration(primaryCondition),
      goals: this.getCorePhaseGoals(primaryCondition),
      approaches: this.getCorePhaseApproaches(primaryCondition),
      focus: this.getCorePhaseAreas(primaryCondition),
      successCriteria: this.getCorePhaseSuccessCriteria(primaryCondition),
    });

    // Phase 3: Integration and Maintenance
    phases.push({
      phase: phases.length + 1,
      name: 'Integration and Relapse Prevention',
      duration: '4-8 weeks',
      goals: [
        'Consolidate therapeutic gains',
        'Develop long-term coping strategies',
        'Plan for maintenance and follow-up',
        'Address remaining secondary issues',
      ],
      approaches: [
        'Relapse Prevention',
        'Maintenance Therapy',
        'Skill Consolidation',
      ],
      focus: [
        'Skill integration',
        'Long-term planning',
        'Maintenance strategies',
      ],
      successCriteria: [
        'Sustained symptom improvement',
        'Independent coping skills',
        'Functional improvement maintained',
        'Comprehensive relapse prevention plan',
      ],
    });

    return phases;
  }

  /**
   * Generate specific therapist matching criteria
   */
  private generateTherapistCriteria(
    clinicalProfile: ClinicalProfile,
  ): TherapistMatchCriteria {
    const { primaryConditions } = clinicalProfile;

    const expertise = new Set<string>();
    const illnessSpecializations = new Set<string>();
    const areasOfExpertise = new Set<string>();

    primaryConditions.forEach((condition) => {
      switch (condition.condition) {
        case 'Depression':
          expertise.add('Depression');
          illnessSpecializations.add('Major Depressive Disorder');
          areasOfExpertise.add('Mood Disorders');
          break;
        case 'Anxiety':
          expertise.add('Anxiety');
          illnessSpecializations.add('Generalized Anxiety Disorder');
          areasOfExpertise.add('Anxiety Disorders');
          break;
        case 'Post-traumatic stress disorder (PTSD)':
          expertise.add('Trauma');
          illnessSpecializations.add('PTSD');
          areasOfExpertise.add('Trauma and Stressor-Related Disorders');
          break;
        case 'Bipolar disorder (BD)':
          expertise.add('Bipolar');
          illnessSpecializations.add('Bipolar Disorder');
          areasOfExpertise.add('Mood Disorders');
          break;
        case 'Obsessive compulsive disorder (OCD)':
          expertise.add('OCD');
          illnessSpecializations.add('Obsessive-Compulsive Disorder');
          areasOfExpertise.add('Anxiety Disorders');
          break;
        case 'ADD / ADHD':
          expertise.add('ADHD');
          illnessSpecializations.add('ADHD');
          areasOfExpertise.add('Neurodevelopmental Disorders');
          break;
        default:
          expertise.add('General Therapy');
          areasOfExpertise.add('General Mental Health');
      }
    });

    return {
      expertise: Array.from(expertise),
      illnessSpecializations: Array.from(illnessSpecializations),
      areasOfExpertise: Array.from(areasOfExpertise),
    };
  }





  /**
   * Map risk level to urgency
   */
  private mapRiskToUrgency(
    riskLevel: string,
  ): 'immediate' | 'high' | 'moderate' | 'routine' {
    const mapping = {
      critical: 'immediate' as const,
      high: 'high' as const,
      moderate: 'moderate' as const,
      low: 'routine' as const,
    };
    return mapping[riskLevel] || 'routine';
  }

  /**
   * Determine recommended session frequency
   */
  private determineSessionFrequency(
    riskLevel: string,
    primaryConditions: ClinicalInsight[],
  ): 'multiple_weekly' | 'weekly' | 'biweekly' | 'monthly' {
    if (riskLevel === 'critical') return 'multiple_weekly';
    if (riskLevel === 'high') return 'weekly';
    if (primaryConditions.some((c) => c.clinicalLevel === 'severe'))
      return 'weekly';
    if (primaryConditions.some((c) => c.clinicalLevel === 'moderate'))
      return 'weekly';

    return 'biweekly';
  }

  /**
   * Generate intervention recommendations
   */
  private generateInterventionRecommendations(
    clinicalProfile: ClinicalProfile,
  ): InterventionRecommendation[] {
    const recommendations: InterventionRecommendation[] = [];
    const { primaryConditions, riskFactors, overallRiskLevel } =
      clinicalProfile;

    // Crisis intervention if needed
    if (overallRiskLevel === 'critical') {
      recommendations.push({
        type: 'crisis_intervention',
        priority: 1,
        urgency: 'immediate',
        description: 'Immediate crisis intervention and safety assessment',
        provider: 'Crisis intervention specialist or emergency services',
        duration: 'Immediate',
        frequency: 'As needed',
        goals: ['Ensure safety', 'Stabilize crisis', 'Connect to ongoing care'],
      });
    }

    // Primary therapy recommendation
    const primaryCondition = primaryConditions[0];
    if (primaryCondition) {
      recommendations.push({
        type: 'therapy',
        priority: 2,
        urgency: this.mapRiskToUrgency(primaryCondition.riskLevel),
        description: `Individual therapy for ${primaryCondition.condition.toLowerCase()}`,
        provider: 'Licensed mental health professional',
        duration: this.estimateCoreTreatmentDuration(primaryCondition),
        frequency: this.determineSessionFrequency(
          overallRiskLevel,
          primaryConditions,
        ),
        goals: primaryCondition.therapeuticFocus,
      });
    }

    // Psychiatric evaluation if indicated
    if (
      this.requiresPsychiatricEvaluation(primaryConditions, overallRiskLevel)
    ) {
      recommendations.push({
        type: 'psychiatric_eval',
        priority: 3,
        urgency: overallRiskLevel === 'critical' ? 'immediate' : 'high',
        description: 'Psychiatric evaluation for medication management',
        provider: 'Psychiatrist',
        duration: '1-2 sessions',
        frequency: 'Initial evaluation, then as needed',
        goals: [
          'Medication assessment',
          'Symptom management',
          'Treatment coordination',
        ],
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate self-care recommendations
   */
  private generateSelfCareRecommendations(
    clinicalProfile: ClinicalProfile,
  ): SelfCareRecommendation[] {
    const recommendations: SelfCareRecommendation[] = [];
    const { primaryConditions } = clinicalProfile;

    // Universal recommendations
    recommendations.push(
      {
        category: 'lifestyle',
        priority: 'high',
        recommendation: 'Maintain regular sleep schedule (7-9 hours per night)',
        frequency: 'Daily',
        rationale:
          'Sleep regulation is crucial for mental health and symptom management',
      },
      {
        category: 'physical',
        priority: 'high',
        recommendation:
          'Regular physical exercise (30 minutes, 3-5 times per week)',
        frequency: '3-5 times per week',
        rationale:
          'Exercise has proven benefits for mood regulation and anxiety reduction',
      },
      {
        category: 'mindfulness',
        priority: 'medium',
        recommendation: 'Daily mindfulness or meditation practice',
        frequency: 'Daily (10-20 minutes)',
        rationale:
          'Mindfulness improves emotional regulation and reduces stress',
      },
    );

    // Condition-specific recommendations
    primaryConditions.forEach((condition) => {
      const conditionRecs = this.getConditionSpecificSelfCare(
        condition.condition,
      );
      recommendations.push(...conditionRecs);
    });

    return recommendations;
  }

  /**
   * Get condition-specific self-care recommendations
   */
  private getConditionSpecificSelfCare(
    condition: string,
  ): SelfCareRecommendation[] {
    const recommendations: Record<string, SelfCareRecommendation[]> = {
      Depression: [
        {
          category: 'social',
          priority: 'high',
          recommendation:
            'Maintain social connections and engage in meaningful activities',
          frequency: 'Weekly',
          rationale:
            'Social support and behavioral activation are key for depression recovery',
        },
        {
          category: 'lifestyle',
          priority: 'medium',
          recommendation:
            'Exposure to natural light, especially in the morning',
          frequency: 'Daily',
          rationale: 'Light exposure helps regulate mood and circadian rhythms',
        },
      ],
      Anxiety: [
        {
          category: 'emotional',
          priority: 'high',
          recommendation:
            'Practice deep breathing and progressive muscle relaxation',
          frequency: 'Daily',
          rationale:
            'Relaxation techniques help manage anxiety symptoms and prevent escalation',
        },
        {
          category: 'lifestyle',
          priority: 'medium',
          recommendation: 'Limit caffeine and alcohol intake',
          frequency: 'Daily',
          rationale: 'These substances can exacerbate anxiety symptoms',
        },
      ],
    };

    return recommendations[condition] || [];
  }

  /**
   * Create monitoring plan
   */
  private createMonitoringPlan(
    clinicalProfile: ClinicalProfile,
  ): MonitoringPlan {
    const { primaryConditions, overallRiskLevel } = clinicalProfile;

    const assessmentSchedule =
      overallRiskLevel === 'critical'
        ? 'Weekly for first month, then biweekly'
        : overallRiskLevel === 'high'
          ? 'Biweekly for first 6 weeks, then monthly'
          : 'Monthly for first 3 months, then quarterly';

    const keyMetrics = [
      'Symptom severity scores',
      'Functional improvement measures',
      'Quality of life indicators',
      'Treatment adherence',
      'Safety concerns',
    ];

    const warningSigns = this.getWarningSignsForConditions(primaryConditions);

    const reviewPoints = [
      'After 4 weeks of treatment',
      'At 8-week mark',
      'At 3-month mark',
      'Every 6 months thereafter',
    ];

    return {
      assessmentSchedule,
      keyMetrics,
      warningSigns,
      reviewPoints,
    };
  }

  /**
   * Create contingency plan for crisis situations
   */
  private createContingencyPlan(
    clinicalProfile: ClinicalProfile,
  ): ContingencyPlan {
    const crisisContacts = [
      'Assigned therapist',
      'Crisis hotline: 988 (Suicide & Crisis Lifeline)',
      'Emergency services: 911',
      'Crisis text line: Text HOME to 741741',
    ];

    const emergencySteps = [
      'Recognize warning signs early',
      'Use learned coping strategies',
      'Contact support person or therapist',
      'If immediate danger, call 911 or go to emergency room',
      'Follow up with treatment team within 24 hours',
    ];

    const escalationTriggers = this.getEscalationTriggers(clinicalProfile);

    const safetyResources = [
      'Personal safety plan',
      'Crisis intervention services',
      'Mobile crisis teams',
      'Peer support networks',
      'Online mental health resources',
    ];

    return {
      crisisContacts,
      emergencySteps,
      escalationTriggers,
      safetyResources,
    };
  }

  /**
   * Define success metrics for treatment
   */
  private defineSuccessMetrics(
    clinicalProfile: ClinicalProfile,
  ): SuccessMetric[] {
    const { primaryConditions } = clinicalProfile;
    const metrics: SuccessMetric[] = [];

    // Universal metrics
    metrics.push(
      {
        metric: 'Overall symptom severity reduction',
        targetImprovement: '50% reduction in primary symptoms',
        timeframe: '12 weeks',
        measurementMethod:
          'Standardized assessment tools and clinical interviews',
      },
      {
        metric: 'Functional improvement',
        targetImprovement:
          'Return to baseline functioning in work/school and relationships',
        timeframe: '16 weeks',
        measurementMethod: 'Functional assessment scales and self-report',
      },
    );

    // Condition-specific metrics
    primaryConditions.forEach((condition) => {
      const conditionMetrics = this.getConditionSpecificMetrics(
        condition.condition,
      );
      metrics.push(...conditionMetrics);
    });

    return metrics;
  }

  /**
   * Get condition-specific success metrics
   */
  private getConditionSpecificMetrics(condition: string): SuccessMetric[] {
    const metrics: Record<string, SuccessMetric[]> = {
      Depression: [
        {
          metric: 'PHQ-9 score improvement',
          targetImprovement: 'Score reduction to below 10 (mild range)',
          timeframe: '8-12 weeks',
          measurementMethod: 'PHQ-9 questionnaire administered biweekly',
        },
      ],
      Anxiety: [
        {
          metric: 'GAD-7 score improvement',
          targetImprovement: 'Score reduction to below 8 (mild range)',
          timeframe: '6-10 weeks',
          measurementMethod: 'GAD-7 questionnaire administered biweekly',
        },
      ],
    };

    return metrics[condition] || [];
  }

  // Helper methods
  private estimateCoreTreatmentDuration(
    condition: ClinicalInsight | undefined,
  ): string {
    if (!condition) return '12-16 weeks';

    const durations = {
      extreme: '20-24 weeks',
      severe: '16-20 weeks',
      moderate: '12-16 weeks',
      mild: '8-12 weeks',
      subclinical: '6-8 weeks',
    };

    return durations[condition.clinicalLevel] || '12-16 weeks';
  }

  private getCorePhaseGoals(condition: ClinicalInsight | undefined): string[] {
    if (!condition) return ['Symptom reduction', 'Skill development'];

    return [
      `Reduce ${condition.condition.toLowerCase()} symptoms`,
      'Develop effective coping strategies',
      'Improve daily functioning',
      'Build therapeutic skills',
    ];
  }

  private getCorePhaseApproaches(
    condition: ClinicalInsight | undefined,
  ): string[] {
    if (!condition) return ['Cognitive Behavioral Therapy (CBT)'];
    return condition.therapeuticFocus.slice(0, 3);
  }

  private getCorePhaseAreas(condition: ClinicalInsight | undefined): string[] {
    if (!condition) return ['Symptom management'];

    return [
      'Symptom identification and management',
      'Skill building and practice',
      'Functional improvement',
      'Therapeutic relationship building',
    ];
  }

  private getCorePhaseSuccessCriteria(
    condition: ClinicalInsight | undefined,
  ): string[] {
    if (!condition) return ['Reduced symptoms'];

    return [
      'Significant symptom reduction',
      'Improved coping skills',
      'Enhanced daily functioning',
      'Strong therapeutic alliance',
    ];
  }



  private estimateOverallTreatmentDuration(
    conditions: ClinicalInsight[],
  ): string {
    if (conditions.some((c) => c.clinicalLevel === 'extreme'))
      return '6-12 months';
    if (conditions.some((c) => c.clinicalLevel === 'severe'))
      return '4-8 months';
    if (conditions.some((c) => c.clinicalLevel === 'moderate'))
      return '3-6 months';
    return '2-4 months';
  }

  private requiresPsychiatricEvaluation(
    conditions: ClinicalInsight[],
    riskLevel: string,
  ): boolean {
    if (riskLevel === 'critical' || riskLevel === 'high') return true;

    const medicationIndicatedConditions = [
      'Depression',
      'Bipolar disorder (BD)',
      'Anxiety',
      'Post-traumatic stress disorder (PTSD)',
    ];

    return conditions.some(
      (c) =>
        medicationIndicatedConditions.includes(c.condition) &&
        (c.clinicalLevel === 'severe' || c.clinicalLevel === 'extreme'),
    );
  }

  private getWarningSignsForConditions(
    conditions: ClinicalInsight[],
  ): string[] {
    const warningSignsSet = new Set<string>();

    conditions.forEach((condition) => {
      switch (condition.condition) {
        case 'Depression':
          warningSignsSet.add('Increased hopelessness or suicidal thoughts');
          warningSignsSet.add('Significant mood deterioration');
          warningSignsSet.add('Social withdrawal');
          break;
        case 'Anxiety':
          warningSignsSet.add('Increased panic attacks');
          warningSignsSet.add('Avoidance behaviors increasing');
          break;
        case 'Bipolar disorder (BD)':
          warningSignsSet.add('Mood episode onset');
          warningSignsSet.add('Sleep pattern changes');
          break;
      }
    });

    return Array.from(warningSignsSet);
  }

  private getEscalationTriggers(clinicalProfile: ClinicalProfile): string[] {
    return [
      'Suicidal or self-harm thoughts',
      'Substance use relapse',
      'Severe symptom deterioration',
      'Loss of functioning',
      'Treatment non-adherence',
      'Social support breakdown',
    ];
  }
}
