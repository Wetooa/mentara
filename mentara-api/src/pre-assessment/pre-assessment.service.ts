import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  calculateAllScoresFromFlatArray,
  generateSeverityLevels,
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

  private async getAiEstimate(
    answers: number[],
  ): Promise<Record<string, boolean> | null> {
    try {
      this.logger.debug(
        `Requesting AI prediction for ${answers.length} values`,
      );

      const result = await this.aiServiceClient.predict(answers);

      if (!result.success) {
        this.logger.warn(`AI prediction failed: ${result.error}`);
        return null;
      }

      this.logger.log(
        `AI prediction completed successfully in ${result.responseTime}ms`,
      );
      return result.predictions || null;
    } catch (error) {
      this.logger.error(
        'AI model prediction error:',
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

      // Check for existing pre-assessment
      const existingAssessment = await this.prisma.preAssessment.findUnique({
        where: { clientId: userId },
      });
      if (existingAssessment) {
        throw new BadRequestException(
          'Pre-assessment already exists for this user',
        );
      }

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
        const calculatedScores = calculateAllScoresFromFlatArray(data.answers);
        scores = Object.fromEntries(
          Object.entries(calculatedScores).map(([key, value]) => [
            key,
            value.score,
          ]),
        );
        severityLevels = generateSeverityLevels(calculatedScores);
      }

      // Attempt AI prediction with flat answers
      let aiEstimate: Record<string, boolean> = {};
      try {
        this.logger.debug('Attempting AI prediction with validated input');
        const aiResult = await this.getAiEstimate(data.answers);
        if (aiResult) {
          aiEstimate = aiResult;
          this.logger.log('AI prediction successful');
        } else {
          this.logger.warn(
            'AI prediction failed, continuing without AI estimate',
          );
        }
      } catch (aiError) {
        this.logger.error(
          'AI prediction error, continuing without AI estimate:',
          aiError,
        );
        // Continue without AI estimate - don't fail the entire assessment
      }

      // Create pre-assessment with validated data
      const preAssessment = await this.prisma.preAssessment.create({
        data: {
          clientId: userId,
          answers: data.answers, // Flat array of 201 numeric responses
          scores, // Assessment scale scores
          severityLevels, // Severity classifications
          aiEstimate, // AI analysis results
          isProcessed: true, // Mark as processed
          processedAt: new Date(), // Set processing timestamp
        },
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
      console.error(message, error.message);
      throw new InternalServerErrorException(error.message);
    }
    console.error(message, error);
    throw new InternalServerErrorException(message);
  }

  async getPreAssessmentByUserId(userId: string): Promise<PreAssessment> {
    try {
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { clientId: userId },
      });

      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }

      return preAssessment;
    } catch (error: unknown) {
      this.handleError(error, 'Error retrieving pre-assessment');
    }
  }

  async getPreAssessmentByClientId(clientId: string): Promise<PreAssessment> {
    try {
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { clientId: clientId },
        include: { client: { include: { user: true } } },
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

      // Get existing pre-assessment to preserve current data
      const existingAssessment = await this.prisma.preAssessment.findUnique({
        where: { clientId: userId },
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

        const calculatedScores = calculateAllScoresFromFlatArray(data.answers);
        scores = Object.fromEntries(
          Object.entries(calculatedScores).map(([key, value]) => [
            key,
            value.score,
          ]),
        );
        severityLevels = generateSeverityLevels(calculatedScores);

        // Attempt to get new AI estimate if answers changed
        try {
          const aiResult = await this.getAiEstimate(data.answers);
          if (aiResult) {
            aiEstimate = aiResult;
          }
        } catch (aiError) {
          this.logger.warn('AI prediction failed during update:', aiError);
        }
      }

      // Update pre-assessment with new data
      const preAssessment = await this.prisma.preAssessment.update({
        where: { clientId: userId },
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
      await this.prisma.preAssessment.delete({
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
      const questionnaires = LIST_OF_QUESTIONNAIRES;

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
