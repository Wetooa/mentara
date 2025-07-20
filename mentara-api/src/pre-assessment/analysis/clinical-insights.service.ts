import { Injectable, Logger } from '@nestjs/common';
import { PreAssessment } from '@prisma/client';
import { QuestionnaireScores } from '../pre-assessment.utils';

export interface ClinicalInsight {
  condition: string;
  severity: string;
  score: number;
  clinicalLevel: 'subclinical' | 'mild' | 'moderate' | 'severe' | 'extreme';
  confidence: number; // 0-100%
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  priority: number; // 1-10, higher = more urgent
  keyIndicators: string[];
  therapeuticFocus: string[];
  recommendations: string[];
}

export interface ClinicalProfile {
  primaryConditions: ClinicalInsight[];
  secondaryConditions: ClinicalInsight[];
  riskFactors: RiskFactor[];
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  therapeuticPriorities: string[];
  treatmentRecommendations: TreatmentRecommendation[];
  summary: string;
}

export interface RiskFactor {
  type:
    | 'suicide'
    | 'self_harm'
    | 'substance_abuse'
    | 'psychosis'
    | 'mania'
    | 'severe_depression';
  level: 'low' | 'moderate' | 'high' | 'critical';
  indicators: string[];
  urgency: 'immediate' | 'within_week' | 'within_month' | 'routine';
}

export interface TreatmentRecommendation {
  priority: number;
  condition: string;
  approach: string[];
  specialization: string[];
  urgency: 'immediate' | 'high' | 'moderate' | 'routine';
  estimatedDuration: string;
  goals: string[];
}

@Injectable()
export class ClinicalInsightsService {
  private readonly logger = new Logger(ClinicalInsightsService.name);

  /**
   * Generate comprehensive clinical insights from pre-assessment data
   * This is the main analysis function that combines traditional scoring with AI predictions
   */
  async generateClinicalProfile(
    preAssessment: PreAssessment,
    questionnaires: string[],
    scores: QuestionnaireScores,
  ): Promise<ClinicalProfile> {
    this.logger.log('Generating comprehensive clinical profile');

    try {
      // Extract and validate core data
      const severityLevels = this.extractSeverityLevels(preAssessment);
      const aiPredictions = this.extractAiPredictions(preAssessment);

      // Generate detailed insights for each condition
      const clinicalInsights = this.generateConditionInsights(
        questionnaires,
        scores,
        severityLevels,
        aiPredictions,
      );

      // Categorize conditions by clinical priority
      const { primaryConditions, secondaryConditions } =
        this.categorizeConditions(clinicalInsights);

      // Assess risk factors for immediate intervention needs
      const riskFactors = this.assessRiskFactors(clinicalInsights, scores);

      // Determine overall risk level and treatment urgency
      const overallRiskLevel = this.calculateOverallRiskLevel(
        riskFactors,
        primaryConditions,
      );

      // Generate therapeutic priorities and treatment plan
      const therapeuticPriorities =
        this.generateTherapeuticPriorities(primaryConditions);
      const treatmentRecommendations = this.generateTreatmentRecommendations(
        primaryConditions,
        secondaryConditions,
        riskFactors,
      );

      // Create clinical summary
      const summary = this.generateClinicalSummary(
        primaryConditions,
        secondaryConditions,
        overallRiskLevel,
      );

      return {
        primaryConditions,
        secondaryConditions,
        riskFactors,
        overallRiskLevel,
        therapeuticPriorities,
        treatmentRecommendations,
        summary,
      };
    } catch (error) {
      this.logger.error('Error generating clinical profile:', error);
      throw new Error('Failed to generate clinical insights');
    }
  }

  /**
   * Extract and validate severity levels from pre-assessment
   */
  private extractSeverityLevels(
    preAssessment: PreAssessment,
  ): Record<string, string> {
    try {
      // Access severityLevels from the answers JSON field
      const answers = preAssessment.answers as any;
      const severityLevels = answers?.severityLevels as Record<
        string,
        string
      >;
      if (!severityLevels || typeof severityLevels !== 'object') {
        this.logger.warn('Invalid severity levels data, using empty object');
        return {};
      }
      return severityLevels;
    } catch (error) {
      this.logger.error('Error extracting severity levels:', error);
      return {};
    }
  }

  /**
   * Extract and validate AI predictions from pre-assessment
   */
  private extractAiPredictions(
    preAssessment: PreAssessment,
  ): Record<string, boolean> {
    try {
      // Access aiEstimate from the answers JSON field
      const answers = preAssessment.answers as any;
      const aiEstimate = answers?.aiEstimate as Record<string, boolean>;
      if (!aiEstimate || typeof aiEstimate !== 'object') {
        this.logger.warn('No valid AI predictions available');
        return {};
      }
      return aiEstimate;
    } catch (error) {
      this.logger.error('Error extracting AI predictions:', error);
      return {};
    }
  }

  /**
   * Generate detailed clinical insights for each assessed condition
   */
  private generateConditionInsights(
    questionnaires: string[],
    scores: QuestionnaireScores,
    severityLevels: Record<string, string>,
    aiPredictions: Record<string, boolean>,
  ): ClinicalInsight[] {
    const insights: ClinicalInsight[] = [];

    for (const questionnaire of questionnaires) {
      const scoreData = scores[questionnaire];
      if (!scoreData) continue;

      const insight = this.createConditionInsight(
        questionnaire,
        scoreData,
        severityLevels[questionnaire],
        aiPredictions,
      );

      if (insight) {
        insights.push(insight);
      }
    }

    return insights.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Create detailed clinical insight for a specific condition
   */
  private createConditionInsight(
    condition: string,
    scoreData: { score: number; severity: string },
    severityLevel: string,
    aiPredictions: Record<string, boolean>,
  ): ClinicalInsight | null {
    try {
      const clinicalLevel = this.mapToClinicalLevel(severityLevel);
      const confidence = this.calculateConfidence(
        scoreData.score,
        condition,
        aiPredictions,
      );
      const riskLevel = this.assessConditionRisk(
        condition,
        clinicalLevel,
        scoreData.score,
      );
      const priority = this.calculatePriority(
        condition,
        clinicalLevel,
        riskLevel,
      );

      const keyIndicators = this.getKeyIndicators(
        condition,
        scoreData.score,
        clinicalLevel,
      );
      const therapeuticFocus = this.getTherapeuticFocus(
        condition,
        clinicalLevel,
      );
      const recommendations = this.getConditionRecommendations(
        condition,
        clinicalLevel,
        riskLevel,
      );

      return {
        condition,
        severity: severityLevel || 'Unknown',
        score: scoreData.score,
        clinicalLevel,
        confidence,
        riskLevel,
        priority,
        keyIndicators,
        therapeuticFocus,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Error creating insight for ${condition}:`, error);
      return null;
    }
  }

  /**
   * Map severity labels to standardized clinical levels
   */
  private mapToClinicalLevel(
    severity: string,
  ): 'subclinical' | 'mild' | 'moderate' | 'severe' | 'extreme' {
    if (!severity) return 'subclinical';

    const lowerSeverity = severity.toLowerCase();

    if (
      lowerSeverity.includes('extreme') ||
      lowerSeverity.includes('very severe')
    ) {
      return 'extreme';
    }
    if (lowerSeverity.includes('severe')) {
      return 'severe';
    }
    if (lowerSeverity.includes('moderate')) {
      return 'moderate';
    }
    if (lowerSeverity.includes('mild')) {
      return 'mild';
    }

    return 'subclinical';
  }

  /**
   * Calculate confidence level based on score consistency and AI validation
   */
  private calculateConfidence(
    score: number,
    condition: string,
    aiPredictions: Record<string, boolean>,
  ): number {
    let confidence = 70; // Base confidence

    // Adjust based on score magnitude (higher scores = higher confidence)
    if (score > 20) confidence += 20;
    else if (score > 10) confidence += 10;
    else if (score < 5) confidence -= 20;

    // Validate against AI predictions if available
    const aiKey = this.mapConditionToAiKey(condition);
    if (aiKey && aiPredictions[aiKey] !== undefined) {
      const aiPositive = aiPredictions[aiKey];
      const scorePositive = score > 10; // Threshold varies by condition

      if (aiPositive === scorePositive) {
        confidence += 15; // AI and traditional scoring agree
      } else {
        confidence -= 10; // Disagreement between methods
      }
    }

    return Math.max(10, Math.min(100, confidence));
  }

  /**
   * Map condition names to AI prediction keys
   */
  private mapConditionToAiKey(condition: string): string | null {
    const mappings: Record<string, string> = {
      Depression: 'Has_Depression',
      Anxiety: 'Has_Anxiety',
      PTSD: 'Has_PTSD',
      'Post-traumatic stress disorder (PTSD)': 'Has_PTSD',
      'Bipolar disorder (BD)': 'Has_Bipolar',
      'Obsessive compulsive disorder (OCD)': 'Has_OCD',
      'ADD / ADHD': 'Has_ADHD',
      'Social anxiety': 'Has_Social_Anxiety',
      Panic: 'Has_Panic_Disorder',
      Phobia: 'Has_Phobias',
      'Substance or Alcohol Use Issues': 'Has_Substance_Use',
      'Binge eating / Eating disorders': 'Has_Eating_Disorder',
    };

    return mappings[condition] || null;
  }

  /**
   * Assess risk level for a specific condition
   */
  private assessConditionRisk(
    condition: string,
    clinicalLevel: string,
    score: number,
  ): 'low' | 'moderate' | 'high' | 'critical' {
    // High-risk conditions that require immediate attention
    const highRiskConditions = [
      'Depression',
      'Bipolar disorder (BD)',
      'Post-traumatic stress disorder (PTSD)',
      'Substance or Alcohol Use Issues',
    ];

    if (clinicalLevel === 'extreme') return 'critical';
    if (clinicalLevel === 'severe') {
      return highRiskConditions.includes(condition) ? 'critical' : 'high';
    }
    if (clinicalLevel === 'moderate') return 'moderate';

    return 'low';
  }

  /**
   * Calculate treatment priority (1-10 scale)
   */
  private calculatePriority(
    condition: string,
    clinicalLevel: string,
    riskLevel: string,
  ): number {
    let priority = 1;

    // Base priority by clinical level
    const levelPriorities = {
      extreme: 10,
      severe: 8,
      moderate: 6,
      mild: 4,
      subclinical: 2,
    };
    priority = levelPriorities[clinicalLevel] || 1;

    // Adjust for condition-specific factors
    const highPriorityConditions = [
      'Depression',
      'Bipolar disorder (BD)',
      'Post-traumatic stress disorder (PTSD)',
      'Substance or Alcohol Use Issues',
    ];

    if (highPriorityConditions.includes(condition)) {
      priority += 1;
    }

    // Risk level adjustments
    if (riskLevel === 'critical') priority = 10;
    else if (riskLevel === 'high') priority = Math.max(priority, 8);

    return Math.max(1, Math.min(10, priority));
  }

  /**
   * Get key clinical indicators for a condition
   */
  private getKeyIndicators(
    condition: string,
    score: number,
    clinicalLevel: string,
  ): string[] {
    const indicators: Record<string, string[]> = {
      Depression: [
        'Persistent low mood and sadness',
        'Loss of interest in previously enjoyed activities',
        'Fatigue and decreased energy',
        'Sleep disturbances',
        'Appetite changes',
        'Feelings of worthlessness or guilt',
        'Difficulty concentrating',
        'Psychomotor agitation or retardation',
      ],
      Anxiety: [
        'Excessive worry and apprehension',
        'Restlessness and feeling on edge',
        'Difficulty concentrating',
        'Irritability',
        'Muscle tension',
        'Sleep difficulties',
        'Fatigue from worry',
      ],
      'Post-traumatic stress disorder (PTSD)': [
        'Re-experiencing traumatic events',
        'Avoidance of trauma-related stimuli',
        'Negative alterations in mood and cognition',
        'Hypervigilance and exaggerated startle response',
        'Sleep disturbances and nightmares',
        'Emotional numbing',
        'Intrusive thoughts and flashbacks',
      ],
      'Bipolar disorder (BD)': [
        'Mood episodes (manic or depressive)',
        'Elevated or irritable mood',
        'Decreased need for sleep during episodes',
        'Racing thoughts and pressured speech',
        'Grandiosity or inflated self-esteem',
        'Distractibility',
        'Increased goal-directed activity',
      ],
    };

    const baseIndicators = indicators[condition] || [
      `Elevated ${condition.toLowerCase()} symptoms`,
      'Functional impairment in daily activities',
      'Distress related to symptoms',
    ];

    // Filter indicators based on severity
    if (clinicalLevel === 'mild') return baseIndicators.slice(0, 3);
    if (clinicalLevel === 'moderate') return baseIndicators.slice(0, 5);
    return baseIndicators;
  }

  /**
   * Get therapeutic focus areas for a condition
   */
  private getTherapeuticFocus(
    condition: string,
    clinicalLevel: string,
  ): string[] {
    const focusAreas: Record<string, string[]> = {
      Depression: [
        'Cognitive restructuring and thought challenging',
        'Behavioral activation and activity scheduling',
        'Mood monitoring and regulation',
        'Social support and interpersonal skills',
      ],
      Anxiety: [
        'Anxiety management techniques',
        'Exposure therapy for specific fears',
        'Relaxation and mindfulness training',
        'Cognitive restructuring for worry',
      ],
      'Post-traumatic stress disorder (PTSD)': [
        'Trauma processing and integration',
        'EMDR or trauma-focused therapy',
        'Coping skills for triggers',
        'Safety and stabilization',
      ],
      'Bipolar disorder (BD)': [
        'Mood stabilization techniques',
        'Medication adherence support',
        'Trigger identification and management',
        'Psychoeducation about bipolar disorder',
      ],
    };

    return (
      focusAreas[condition] || [
        'Symptom management',
        'Coping strategies development',
        'Functional improvement',
      ]
    );
  }

  /**
   * Get specific recommendations for a condition
   */
  private getConditionRecommendations(
    condition: string,
    clinicalLevel: string,
    riskLevel: string,
  ): string[] {
    const recommendations: string[] = [];

    // Urgency-based recommendations
    if (riskLevel === 'critical' || clinicalLevel === 'extreme') {
      recommendations.push('Immediate psychiatric evaluation recommended');
      recommendations.push('Consider crisis intervention services');
    }

    // Condition-specific recommendations
    const conditionRecs: Record<string, string[]> = {
      Depression: [
        'Cognitive Behavioral Therapy (CBT) strongly recommended',
        'Consider medication evaluation with psychiatrist',
        'Regular mood monitoring and safety planning',
      ],
      Anxiety: [
        'CBT or Acceptance and Commitment Therapy (ACT)',
        'Mindfulness and relaxation training',
        'Gradual exposure to anxiety triggers',
      ],
      'Post-traumatic stress disorder (PTSD)': [
        'Trauma-focused therapy (EMDR, CPT, or PE)',
        'Specialized PTSD treatment program',
        'Safety planning and stabilization first',
      ],
    };

    recommendations.push(
      ...(conditionRecs[condition] || [
        'Evidence-based psychotherapy',
        'Regular monitoring of symptoms',
        'Psychoeducation about the condition',
      ]),
    );

    return recommendations;
  }

  /**
   * Categorize conditions into primary and secondary based on severity and risk
   */
  private categorizeConditions(insights: ClinicalInsight[]): {
    primaryConditions: ClinicalInsight[];
    secondaryConditions: ClinicalInsight[];
  } {
    const primaryConditions = insights.filter(
      (insight) =>
        insight.priority >= 7 ||
        insight.riskLevel === 'critical' ||
        insight.riskLevel === 'high',
    );

    const secondaryConditions = insights.filter(
      (insight) =>
        insight.priority < 7 &&
        insight.riskLevel !== 'critical' &&
        insight.riskLevel !== 'high',
    );

    return { primaryConditions, secondaryConditions };
  }

  /**
   * Assess overall risk factors requiring immediate attention
   */
  private assessRiskFactors(
    insights: ClinicalInsight[],
    scores: QuestionnaireScores,
  ): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    // Check for suicide/self-harm risk
    const depressionInsight = insights.find(
      (i) => i.condition === 'Depression',
    );
    if (
      depressionInsight &&
      (depressionInsight.clinicalLevel === 'severe' ||
        depressionInsight.clinicalLevel === 'extreme')
    ) {
      riskFactors.push({
        type: 'suicide',
        level:
          depressionInsight.clinicalLevel === 'extreme' ? 'critical' : 'high',
        indicators: [
          'Severe depression symptoms',
          'High risk for suicidal ideation',
        ],
        urgency:
          depressionInsight.clinicalLevel === 'extreme'
            ? 'immediate'
            : 'within_week',
      });
    }

    // Check for substance abuse risk
    const substanceInsight = insights.find(
      (i) =>
        i.condition.includes('Substance') || i.condition.includes('Alcohol'),
    );
    if (substanceInsight && substanceInsight.clinicalLevel !== 'subclinical') {
      riskFactors.push({
        type: 'substance_abuse',
        level: substanceInsight.riskLevel,
        indicators: [
          'Problematic substance use patterns',
          'Risk for dependence',
        ],
        urgency:
          substanceInsight.riskLevel === 'critical'
            ? 'immediate'
            : 'within_month',
      });
    }

    // Check for mania risk (bipolar)
    const bipolarInsight = insights.find((i) =>
      i.condition.includes('Bipolar'),
    );
    if (
      bipolarInsight &&
      (bipolarInsight.clinicalLevel === 'severe' ||
        bipolarInsight.clinicalLevel === 'extreme')
    ) {
      riskFactors.push({
        type: 'mania',
        level: 'high',
        indicators: ['Manic episode indicators', 'Mood instability'],
        urgency: 'within_week',
      });
    }

    return riskFactors;
  }

  /**
   * Calculate overall risk level based on all factors
   */
  private calculateOverallRiskLevel(
    riskFactors: RiskFactor[],
    primaryConditions: ClinicalInsight[],
  ): 'low' | 'moderate' | 'high' | 'critical' {
    // Check for critical risk factors
    if (
      riskFactors.some((rf) => rf.level === 'critical') ||
      primaryConditions.some((pc) => pc.riskLevel === 'critical')
    ) {
      return 'critical';
    }

    // Check for high risk
    if (
      riskFactors.some((rf) => rf.level === 'high') ||
      primaryConditions.some((pc) => pc.riskLevel === 'high')
    ) {
      return 'high';
    }

    // Check for moderate risk
    if (primaryConditions.some((pc) => pc.riskLevel === 'moderate')) {
      return 'moderate';
    }

    return 'low';
  }

  /**
   * Generate therapeutic priorities based on primary conditions
   */
  private generateTherapeuticPriorities(
    primaryConditions: ClinicalInsight[],
  ): string[] {
    const priorities: string[] = [];

    // Safety first
    if (primaryConditions.some((pc) => pc.riskLevel === 'critical')) {
      priorities.push('Crisis intervention and safety planning');
    }

    // Primary symptoms
    primaryConditions
      .sort((a, b) => b.priority - a.priority)
      .forEach((condition) => {
        priorities.push(`${condition.condition} management and treatment`);
      });

    // Functional improvement
    priorities.push('Functional capacity and quality of life improvement');
    priorities.push('Long-term relapse prevention');

    return priorities.slice(0, 5); // Top 5 priorities
  }

  /**
   * Generate comprehensive treatment recommendations
   */
  private generateTreatmentRecommendations(
    primaryConditions: ClinicalInsight[],
    secondaryConditions: ClinicalInsight[],
    riskFactors: RiskFactor[],
  ): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];

    // Primary conditions recommendations
    primaryConditions.forEach((condition, index) => {
      recommendations.push({
        priority: index + 1,
        condition: condition.condition,
        approach: this.getRecommendedApproaches(
          condition.condition,
          condition.clinicalLevel,
        ),
        specialization: [condition.condition, 'Clinical Psychology'],
        urgency: this.mapRiskToUrgency(condition.riskLevel),
        estimatedDuration: this.estimateTreatmentDuration(
          condition.clinicalLevel,
        ),
        goals: this.getTherapeuticGoals(
          condition.condition,
          condition.clinicalLevel,
        ),
      });
    });

    // Risk-based emergency recommendations
    riskFactors.forEach((risk) => {
      if (risk.urgency === 'immediate') {
        recommendations.unshift({
          priority: 0, // Highest priority
          condition: risk.type.replace('_', ' '),
          approach: ['Crisis Intervention', 'Safety Planning'],
          specialization: ['Crisis Intervention', 'Emergency Psychology'],
          urgency: 'immediate',
          estimatedDuration: 'Immediate assessment',
          goals: ['Ensure safety', 'Stabilize acute symptoms'],
        });
      }
    });

    return recommendations;
  }

  /**
   * Get recommended therapeutic approaches for a condition
   */
  private getRecommendedApproaches(
    condition: string,
    clinicalLevel: string,
  ): string[] {
    const approaches: Record<string, string[]> = {
      Depression: [
        'Cognitive Behavioral Therapy (CBT)',
        'Interpersonal Therapy (IPT)',
        'Mindfulness-Based Cognitive Therapy',
      ],
      Anxiety: [
        'Cognitive Behavioral Therapy (CBT)',
        'Acceptance and Commitment Therapy (ACT)',
        'Exposure Therapy',
      ],
      'Post-traumatic stress disorder (PTSD)': [
        'EMDR',
        'Cognitive Processing Therapy',
        'Prolonged Exposure Therapy',
      ],
      'Bipolar disorder (BD)': [
        'Dialectical Behavior Therapy (DBT)',
        'Cognitive Behavioral Therapy (CBT)',
        'Psychoeducation',
      ],
    };

    return (
      approaches[condition] || [
        'Cognitive Behavioral Therapy (CBT)',
        'Psychodynamic Therapy',
      ]
    );
  }

  /**
   * Map risk level to treatment urgency
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
   * Estimate treatment duration based on severity
   */
  private estimateTreatmentDuration(clinicalLevel: string): string {
    const durations = {
      extreme: '12-18 months intensive therapy',
      severe: '6-12 months regular therapy',
      moderate: '3-6 months therapy',
      mild: '2-4 months therapy',
      subclinical: '1-2 months brief intervention',
    };
    return durations[clinicalLevel] || '3-6 months therapy';
  }

  /**
   * Get therapeutic goals for a condition
   */
  private getTherapeuticGoals(
    condition: string,
    clinicalLevel: string,
  ): string[] {
    const goals: Record<string, string[]> = {
      Depression: [
        'Reduce depressive symptoms',
        'Improve mood regulation',
        'Increase behavioral activation',
        'Enhance coping strategies',
      ],
      Anxiety: [
        'Reduce anxiety symptoms',
        'Develop relaxation skills',
        'Increase tolerance for uncertainty',
        'Improve daily functioning',
      ],
    };

    return (
      goals[condition] || [
        'Reduce symptom severity',
        'Improve functional capacity',
        'Develop coping strategies',
        'Prevent relapse',
      ]
    );
  }

  /**
   * Generate clinical summary
   */
  private generateClinicalSummary(
    primaryConditions: ClinicalInsight[],
    secondaryConditions: ClinicalInsight[],
    overallRiskLevel: string,
  ): string {
    const primaryCount = primaryConditions.length;
    const secondaryCount = secondaryConditions.length;

    let summary = `Clinical assessment reveals `;

    if (primaryCount > 0) {
      const primaryNames = primaryConditions.map((c) => c.condition).join(', ');
      summary += `${primaryCount} primary condition(s) requiring immediate attention: ${primaryNames}. `;
    }

    if (secondaryCount > 0) {
      summary += `${secondaryCount} secondary condition(s) identified for ongoing monitoring. `;
    }

    summary += `Overall risk level: ${overallRiskLevel}. `;

    if (overallRiskLevel === 'critical' || overallRiskLevel === 'high') {
      summary += 'Immediate professional intervention recommended.';
    } else if (overallRiskLevel === 'moderate') {
      summary += 'Regular therapeutic support recommended.';
    } else {
      summary += 'Preventive intervention and monitoring recommended.';
    }

    return summary;
  }
}
