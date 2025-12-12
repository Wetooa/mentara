import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  processPreAssessmentAnswers,
  LIST_OF_QUESTIONNAIRES,
} from './pre-assessment.utils';
import { PreAssessment } from '@prisma/client';
import { CreatePreAssessmentDto } from '../../schema/pre-assessment';
import { AiServiceClient } from './services/ai-service.client';
import { ClinicalInsightsService } from './analysis/clinical-insights.service';
import { TherapeuticRecommendationsService } from './analysis/therapeutic-recommendations.service';
import { QuestionnaireScores } from './pre-assessment.utils';

@Injectable()
export class PreAssessmentService {
  private readonly logger = new Logger(PreAssessmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiServiceClient: AiServiceClient,
    private readonly clinicalInsightsService: ClinicalInsightsService,
    private readonly therapeuticRecommendationsService: TherapeuticRecommendationsService,
  ) {}

  /**
   * Generate realistic mock AI evaluation based on user's assessment scores
   * Produces data structure matching: {confidence, risk_factors, recommendations, estimated_severity}
   */
  private generateMockAiEstimate(
    scores: Record<string, number>,
    severityLevels: Record<string, string>,
  ): any {
    // Convert severity levels to numeric weights for calculations
    const severityWeights: Record<string, number> = {
      'Minimal': 0.1,
      'Mild': 0.25,
      'Moderate': 0.5,
      'Moderately Severe': 0.7,
      'Severe': 0.85,
      'Very Severe': 0.95,
      'Extreme': 1.0,
      'Low': 0.2,
      'High': 0.8,
      'Substantial': 0.75,
      'Subclinical': 0.15,
      'Clinical': 0.8,
      'None': 0.0,
      'Subthreshold': 0.3,
      'Positive': 0.7,
      'Negative': 0.0,
    };

    // Calculate overall confidence based on assessment completion and severity distribution
    const severityValues = Object.values(severityLevels).map(level => severityWeights[level] || 0.5);
    const avgSeverity = severityValues.reduce((sum, val) => sum + val, 0) / severityValues.length;
    
    // Higher severity = higher confidence (more clear patterns)
    const baseConfidence = 0.6 + (avgSeverity * 0.3);
    const confidence = Math.round((baseConfidence + Math.random() * 0.15) * 1000) / 1000;

    // Identify risk factors from high-severity conditions
    const riskFactors: string[] = [];
    const riskFactorMap: Record<string, string[]> = {
      'Stress': ['chronic_stress', 'work_burnout'],
      'Anxiety': ['generalized_anxiety', 'social_isolation'],
      'Depression': ['major_depression', 'social_withdrawal'],
      'Drug Abuse': ['substance_dependency', 'addiction_risk'],
      'Insomnia': ['sleep_disorders', 'chronic_fatigue'],
      'Panic': ['panic_attacks', 'agoraphobia'],
      'Bipolar disorder (BD)': ['mood_instability', 'manic_episodes'],
      'Obsessive compulsive disorder (OCD)': ['compulsive_behaviors', 'intrusive_thoughts'],
      'Post-traumatic stress disorder (PTSD)': ['trauma_response', 'hypervigilance'],
      'Social anxiety': ['social_isolation', 'avoidance_behaviors'],
      'Phobia': ['specific_phobias', 'avoidance_behaviors'],
      'Burnout': ['work_burnout', 'chronic_stress'],
      'Binge eating / Eating disorders': ['eating_disorders', 'body_image_issues'],
      'ADD / ADHD': ['attention_deficits', 'impulse_control'],
      'Substance or Alcohol Use Issues': ['substance_dependency', 'addiction_risk'],
    };

    Object.entries(severityLevels).forEach(([condition, severity]) => {
      const weight = severityWeights[severity] || 0;
      if (weight >= 0.5 && riskFactorMap[condition]) { // Moderate+ severity
        const factors = riskFactorMap[condition];
        const selectedFactor = factors[Math.floor(Math.random() * factors.length)];
        if (!riskFactors.includes(selectedFactor)) {
          riskFactors.push(selectedFactor);
        }
      }
    });

    // Generate recommendations based on identified risk factors and severity
    const allRecommendations = [
      'medication_evaluation',
      'lifestyle_changes',
      'support_group',
      'therapy_sessions',
      'stress_management',
      'sleep_hygiene',
      'exercise_program',
      'mindfulness_practice',
      'social_support',
      'professional_counseling',
      'crisis_intervention',
      'family_therapy',
    ];

    const recommendations: string[] = [];
    
    // Always include basic recommendations
    recommendations.push('therapy_sessions');
    
    // Add specific recommendations based on severity
    if (avgSeverity >= 0.7) {
      recommendations.push('medication_evaluation', 'professional_counseling');
    }
    if (avgSeverity >= 0.5) {
      recommendations.push('lifestyle_changes', 'stress_management');
    }
    if (riskFactors.includes('social_isolation')) {
      recommendations.push('support_group', 'social_support');
    }
    if (riskFactors.includes('chronic_stress') || riskFactors.includes('work_burnout')) {
      recommendations.push('stress_management', 'mindfulness_practice');
    }

    // Add 1-2 random additional recommendations for variety
    const additionalRecs = allRecommendations.filter(rec => !recommendations.includes(rec));
    const numAdditional = Math.min(2, Math.floor(Math.random() * 3));
    for (let i = 0; i < numAdditional; i++) {
      const randomRec = additionalRecs[Math.floor(Math.random() * additionalRecs.length)];
      if (randomRec && !recommendations.includes(randomRec)) {
        recommendations.push(randomRec);
      }
    }

    // Generate estimated severity for key conditions
    const estimatedSeverity: any = {};
    
    // Include the top 3-4 most relevant conditions
    const keyConditions = ['Stress', 'Anxiety', 'Depression'];
    keyConditions.forEach(condition => {
      if (scores[condition] !== undefined) {
        // Convert score to 0-1 scale with some randomization
        const normalizedScore = Math.min(1.0, scores[condition] / 100);
        const adjustedScore = Math.round((normalizedScore + Math.random() * 0.1) * 100) / 100;
        estimatedSeverity[condition.toLowerCase()] = Math.max(0.0, Math.min(1.0, adjustedScore));
      }
    });

    // Add overall severity assessment
    const overallSeverityLevels = ['low', 'moderate', 'high', 'severe'];
    let overallLevel: string;
    if (avgSeverity < 0.3) overallLevel = 'low';
    else if (avgSeverity < 0.6) overallLevel = 'moderate'; 
    else if (avgSeverity < 0.8) overallLevel = 'high';
    else overallLevel = 'severe';
    
    estimatedSeverity.overall = overallLevel;

    return {
      confidence,
      risk_factors: riskFactors.slice(0, 5), // Limit to top 5 risk factors
      recommendations: recommendations.slice(0, 6), // Limit to top 6 recommendations
      estimated_severity: estimatedSeverity,
    };
  }

  private async getAiEstimate(
    answers: number[],
    scores: Record<string, number>,
    severityLevels: Record<string, string>,
  ): Promise<any | null> {
    try {
      this.logger.debug(
        `Generating AI evaluation for ${answers.length} assessment responses`,
      );

      // Generate mock AI evaluation based on actual assessment data
      const aiEstimate = this.generateMockAiEstimate(scores, severityLevels);

      this.logger.log(
        `AI evaluation generated: confidence ${aiEstimate.confidence}, ${aiEstimate.risk_factors.length} risk factors identified`,
      );
      
      return aiEstimate;
    } catch (error) {
      this.logger.error(
        'AI evaluation generation error:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  private validateFlatAnswers(answers: number[]): void {
    if (!Array.isArray(answers)) {
      throw new BadRequestException('Answers must be an array');
    }

    if (answers.length !== 201) {
      throw new BadRequestException(
        `Expected exactly 201 answer values, got ${answers.length}`,
      );
    }

    // Validate all values are numbers in reasonable range (0-10 for most scales)
    for (let i = 0; i < answers.length; i++) {
      const value = answers[i];

      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new BadRequestException(
          `Invalid answer value at index ${i}: ${value}. Must be a finite number.`,
        );
      }

      if (value < 0 || value > 10) {
        throw new BadRequestException(
          `Answer value out of range (0-10) at index ${i}: ${value}`,
        );
      }
    }

    this.logger.debug('Flat answers array validation passed');
  }

  async createPreAssessment(
    userId: string,
    data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      this.logger.log(`Creating pre-assessment for user ${userId}`);

      // Validate user exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: { id: true, isActive: true },
      });
      if (!user) {
        throw new NotFoundException('User not found or inactive');
      }

      // Validate client exists
      const client = await this.prisma.client.findUnique({
        where: { userId: userId },
        select: { userId: true },
      });
      if (!client) {
        throw new NotFoundException('Client profile not found');
      }

      // Allow multiple assessments - no uniqueness check needed

      // Validate flat answers array
      this.validateFlatAnswers(data.answers);

      let scores: Record<string, number> = data.scores as Record<
        string,
        number
      >;
      let severityLevels: Record<string, string> =
        data.severityLevels as Record<string, string>;

      // Calculate scores if not provided
      if (!data.scores || !data.severityLevels) {
        this.logger.debug(
          'Calculating scores and severity levels from flat answers',
        );
        const result = processPreAssessmentAnswers(data.answers);
        scores = result.scores;
        severityLevels = result.severityLevels;
      }

      // Generate AI evaluation with mock data based on assessment results
      let aiEstimate: any = {};
      try {
        this.logger.debug('Generating AI evaluation based on assessment scores');
        const aiResult = await this.getAiEstimate(data.answers, scores, severityLevels);
        if (aiResult) {
          aiEstimate = aiResult;
          this.logger.log('AI evaluation generated successfully');
        } else {
          this.logger.warn(
            'AI evaluation generation failed, continuing without AI estimate',
          );
        }
      } catch (aiError) {
        this.logger.error(
          'AI evaluation generation error, continuing without AI estimate:',
          aiError,
        );
        // Continue without AI estimate - don't fail the entire assessment
      }

      // Create pre-assessment with validated data
      const createData: any = {
        clientId: userId,
        answers: data.answers, // Flat array of 201 numeric responses
        scores, // Assessment scale scores
        severityLevels, // Severity classifications
        aiEstimate, // AI analysis results
        isProcessed: true, // Mark as processed
        processedAt: new Date(), // Set processing timestamp
        ...(data.assessmentMethod && { assessmentMethod: data.assessmentMethod }),
        ...(data.chatbotSessionId && { chatbotSessionId: data.chatbotSessionId }),
        ...(data.conversationInsights && { conversationInsights: data.conversationInsights }),
      };
      
      const preAssessment = await this.prisma.preAssessment.create({
        data: createData,
      });

      this.logger.log(`Pre-assessment completed for user ${userId}`);

      // Generate comprehensive clinical analysis in background
      // This provides detailed insights for therapist matching and treatment planning
      try {
        // Convert scores to QuestionnaireScores format for analysis
        const questionnaireScores: QuestionnaireScores = {};
        const severityLevelsForAnalysis = severityLevels;

        // Get all questionnaire names from the calculated scores
        const questionnaires = Object.keys(scores);
        questionnaires.forEach((questionnaire) => {
          if (scores[questionnaire] !== undefined) {
            questionnaireScores[questionnaire] = {
              score: scores[questionnaire],
              severity: severityLevelsForAnalysis[questionnaire] || 'Unknown',
            };
          }
        });

        const analysis = await this.generateClinicalAnalysis(
          preAssessment,
          questionnaires,
          questionnaireScores,
        );

        this.logger.log(
          `Clinical analysis generated: ${analysis.clinicalProfile.primaryConditions.length} primary conditions, ` +
            `risk level: ${analysis.clinicalProfile.overallRiskLevel}`,
        );
      } catch (analysisError) {
        this.logger.warn(
          'Advanced clinical analysis failed but core assessment succeeded:',
          analysisError instanceof Error
            ? analysisError.message
            : analysisError,
        );
        // Don't fail the entire process - basic scoring is still available
      }

      return preAssessment;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        'Error creating pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to create pre-assessment');
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof NotFoundException) {
      throw error;
    }
    if (error instanceof Error) {
      this.logger.error(message, error.stack);
      throw new InternalServerErrorException(error.message);
    }
    this.logger.error(message, String(error));
    throw new InternalServerErrorException(message);
  }

  async getPreAssessmentByUserId(userId: string): Promise<PreAssessment> {
    try {
      // Get the latest assessment for the user
      const preAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }

      return preAssessment;
    } catch (error: unknown) {
      this.handleError(error, 'Error retrieving pre-assessment');
    }
  }

  async getAllPreAssessmentsByUserId(userId: string): Promise<PreAssessment[]> {
    try {
      const assessments = await this.prisma.preAssessment.findMany({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      return assessments;
    } catch (error: unknown) {
      this.handleError(error, 'Error retrieving pre-assessment history');
      return [];
    }
  }

  async getLatestPreAssessmentByUserId(userId: string): Promise<PreAssessment | null> {
    try {
      const preAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      return preAssessment;
    } catch (error: unknown) {
      this.logger.error('Error retrieving latest pre-assessment:', error);
      return null;
    }
  }

  async getPreAssessmentByClientId(clientId: string): Promise<PreAssessment> {
    try {
      // Get the latest assessment for the client
      const preAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: clientId },
        include: { client: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }

      return preAssessment;
    } catch (error: unknown) {
      this.handleError(error, 'Error retrieving pre-assessment');
    }
  }

  private isValidScores(scores: unknown): scores is Record<string, number> {
    if (typeof scores !== 'object' || scores === null) return false;
    return Object.entries(scores).every(
      ([key, value]) => typeof key === 'string' && typeof value === 'number',
    );
  }

  private isValidSeverityLevels(
    levels: unknown,
  ): levels is Record<string, string> {
    if (typeof levels !== 'object' || levels === null) return false;
    return Object.entries(levels).every(
      ([key, value]) => typeof key === 'string' && typeof value === 'string',
    );
  }

  async updatePreAssessment(
    userId: string,
    data: Partial<CreatePreAssessmentDto>,
  ): Promise<PreAssessment> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId: userId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }

      // Get latest existing pre-assessment to preserve current data
      const existingAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!existingAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }

      // Extract current data from existing assessment
      const currentScores =
        (existingAssessment.scores as Record<string, number>) || {};
      const currentSeverityLevels =
        (existingAssessment.severityLevels as Record<string, string>) || {};
      const currentAiEstimate =
        (existingAssessment.aiEstimate as Record<string, boolean>) || {};

      let scores: Record<string, number>;
      let severityLevels: Record<string, string>;
      let aiEstimate: Record<string, boolean> = currentAiEstimate;

      if (data.scores && this.isValidScores(data.scores)) {
        scores = data.scores;
      } else {
        scores = currentScores;
      }

      if (
        data.severityLevels &&
        this.isValidSeverityLevels(data.severityLevels)
      ) {
        severityLevels = data.severityLevels;
      } else {
        severityLevels = currentSeverityLevels;
      }

      // Recalculate scores if new answers provided
      if (data.answers && (!data.scores || !data.severityLevels)) {
        this.validateFlatAnswers(data.answers);

        const result = processPreAssessmentAnswers(data.answers);
        scores = result.scores;
        severityLevels = result.severityLevels;

        // Attempt to get new AI estimate if answers changed
        try {
          const aiResult = await this.getAiEstimate(data.answers, scores, severityLevels);
          if (aiResult) {
            aiEstimate = aiResult;
          }
        } catch (aiError) {
          this.logger.warn('AI evaluation generation failed during update:', aiError);
        }
      }

      // Update the latest pre-assessment with new data
      const preAssessment = await this.prisma.preAssessment.update({
        where: { id: existingAssessment.id },
        data: {
          answers: data.answers || (existingAssessment.answers as number[]),
          scores,
          severityLevels,
          aiEstimate,
        },
      });

      return preAssessment;
    } catch (error: unknown) {
      this.handleError(error, 'Error updating pre-assessment');
    }
  }

  async deletePreAssessment(userId: string): Promise<null> {
    try {
      // Delete all pre-assessments for the user (or just the latest one if we want to keep history)
      // For now, delete all to match the old behavior
      await this.prisma.preAssessment.deleteMany({
        where: { clientId: userId },
      });
      return null;
    } catch (error: unknown) {
      this.handleError(error, 'Error deleting pre-assessment');
    }
  }

  /**
   * Generate comprehensive clinical analysis from pre-assessment data
   * This method orchestrates the clinical insights and therapeutic recommendations
   */
  async generateClinicalAnalysis(
    preAssessment: PreAssessment,
    questionnaires: string[],
    scores: QuestionnaireScores,
  ) {
    try {
      this.logger.log('Generating comprehensive clinical analysis');

      // Generate clinical profile with insights
      const clinicalProfile =
        await this.clinicalInsightsService.generateClinicalProfile(
          preAssessment,
          questionnaires,
          scores,
        );

      // Generate personalized treatment plan
      const treatmentPlan =
        await this.therapeuticRecommendationsService.generatePersonalizedTreatmentPlan(
          clinicalProfile,
        );

      // Extract risk assessment
      const riskAssessment = {
        overallRisk: clinicalProfile.overallRiskLevel,
        riskFactors: clinicalProfile.riskFactors,
        immediateInterventionNeeded:
          clinicalProfile.overallRiskLevel === 'critical',
        crisisRisk: clinicalProfile.riskFactors.some(
          (rf) => rf.type === 'suicide' && rf.level === 'critical',
        ),
      };

      return {
        clinicalProfile,
        treatmentPlan,
        riskAssessment,
        analysisTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error generating clinical analysis:', error);
      throw new InternalServerErrorException(
        'Failed to generate clinical analysis',
      );
    }
  }

  /**
   * Get comprehensive clinical analysis for a user
   * Returns cached analysis if available, otherwise generates new one
   */
  async getComprehensiveClinicalAnalysis(userId: string) {
    try {
      // Get user's pre-assessment
      const preAssessment = await this.getPreAssessmentByUserId(userId);

      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found for user');
      }

      // Extract data from the separate database fields (correct approach)
      const flatAnswers = preAssessment.answers as number[];
      const scores = preAssessment.scores as Record<string, number>;
      const severityLevels = preAssessment.severityLevels as Record<string, string>;
      
      // Use the questionnaire list from utils
      const questionnaires = [...LIST_OF_QUESTIONNAIRES] as string[];

      if (!flatAnswers || !scores || !severityLevels) {
        throw new BadRequestException('Invalid pre-assessment data structure');
      }

      // Convert scores to QuestionnaireScores format
      const questionnaireScores: QuestionnaireScores = {};
      
      questionnaires.forEach((questionnaire) => {
        if (scores[questionnaire] !== undefined) {
          questionnaireScores[questionnaire] = {
            score: scores[questionnaire],
            severity: severityLevels[questionnaire] || 'Unknown',
          };
        }
      });

      // Generate comprehensive analysis
      return await this.generateClinicalAnalysis(
        preAssessment,
        questionnaires,
        questionnaireScores,
      );
    } catch (error) {
      this.logger.error(
        `Error getting clinical analysis for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get crisis assessment for a user
   * Returns immediate risk factors and intervention needs
   */
  async getCrisisAssessment(userId: string) {
    try {
      const analysis = await this.getComprehensiveClinicalAnalysis(userId);

      return {
        overallRisk: analysis.riskAssessment.overallRisk,
        immediateInterventionNeeded:
          analysis.riskAssessment.immediateInterventionNeeded,
        crisisRisk: analysis.riskAssessment.crisisRisk,
        riskFactors: analysis.riskAssessment.riskFactors,
        primaryConcerns: analysis.clinicalProfile.primaryConditions.map(
          (pc) => ({
            condition: pc.condition,
            riskLevel: pc.riskLevel,
            priority: pc.priority,
          }),
        ),
        emergencyContacts:
          analysis.treatmentPlan.contingencyPlan.crisisContacts,
        safetyPlan: analysis.treatmentPlan.contingencyPlan.emergencySteps,
      };
    } catch (error) {
      this.logger.error(
        `Error getting crisis assessment for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
