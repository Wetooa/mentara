import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { PreAssessment } from '@prisma/client';
import { CreatePreAssessmentDto } from './types/pre-assessment.dto';
import { ClinicalInsightsService } from './analysis/clinical-insights.service';
import { TherapeuticRecommendationsService } from './analysis/therapeutic-recommendations.service';

@Injectable()
export class PreAssessmentService {
  private readonly logger = new Logger(PreAssessmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clinicalInsightsService: ClinicalInsightsService,
    private readonly therapeuticRecommendationsService: TherapeuticRecommendationsService,
  ) { }

  /**
   * Format pre-assessment result to match the requested output structure
   */
  public formatPreAssessmentResults(assessment: PreAssessment): any {
    const data = (assessment as any).data || {};
    const context = (assessment as any).context || {};

    const results: any = {
      assessmentId: assessment.id,
      method: (assessment as any).method,
      completedAt: assessment.createdAt,
      data: {
        questionnaireScores: data.questionnaireScores || {},
      },
    };

    if ((assessment as any).method === 'CHATBOT') {
      results.data.documents = {
        soapAnalysisUrl: (assessment as any).soapAnalysisUrl || null,
        conversationHistoryUrl:
          (assessment as any).conversationHistoryUrl || null,
      };
      results.context = {
        pastTherapyExperiences: context.pastTherapyExperiences || [],
        medicationHistory: context.medicationHistory || [],
        accessibilityNeeds: context.accessibilityNeeds || [],
      };
    }

    return { results };
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
        this.logger.debug(
          'Generating AI evaluation based on assessment scores',
        );
        const aiResult = await this.getAiEstimate(
          data.answers,
          scores,
          severityLevels,
        );
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

      // Check if pre-assessment already exists for this client
      // If it exists, update it; otherwise create a new one
      const existingAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      const createData: any = {
        clientId: userId,
        answers: data.answers, // Flat array of 201 numeric responses
        method: data.assessmentMethod || 'CHECKLIST',
        data: {
          questionnaireScores: Object.fromEntries(
            Object.entries(scores).map(([key, value]) => [
              key,
              {
                score: value,
                severity: severityLevels[key] || 'Unknown',
              },
            ]),
          ),
        },
        soapAnalysisUrl: data.soapAnalysisUrl || null,
        conversationHistoryUrl: data.conversationHistoryUrl || null,
        context: {
          pastTherapyExperiences: data.pastTherapyExperiences || [],
          medicationHistory: data.medicationHistory || [],
          accessibilityNeeds: data.accessibilityNeeds || [],
        },
      };

      let preAssessment: PreAssessment;
      if (existingAssessment) {
        // Update existing pre-assessment
        this.logger.log(`Updating existing pre-assessment for user ${userId}`);
        preAssessment = await this.prisma.preAssessment.update({
          where: { id: existingAssessment.id },
          data: createData,
        });
      } else {
        // Create new pre-assessment
        preAssessment = await this.prisma.preAssessment.create({
          data: createData,
        });
      }

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

  async createAnonymousPreAssessment(
    sessionId: string,
    data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      this.logger.log(
        `Creating anonymous pre-assessment for session ${sessionId}`,
      );

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

      const createData: any = {
        sessionId,
        answers: data.answers, // Flat array of 201 numeric responses
        method: data.assessmentMethod || 'CHECKLIST',
        data: {
          questionnaireScores: Object.fromEntries(
            Object.entries(scores).map(([key, value]) => [
              key,
              {
                score: value,
                severity: severityLevels[key] || 'Unknown',
              },
            ]),
          ),
        },
        soapAnalysisUrl: data.soapAnalysisUrl || null,
        conversationHistoryUrl: data.conversationHistoryUrl || null,
        context: {
          pastTherapyExperiences: data.pastTherapyExperiences || [],
          medicationHistory: data.medicationHistory || [],
          accessibilityNeeds: data.accessibilityNeeds || [],
        },
      };

      // Check if session already exists
      const existingAssessment = await this.prisma.preAssessment.findUnique({
        where: { sessionId },
      });

      let preAssessment: PreAssessment;
      if (existingAssessment) {
        this.logger.log(
          `Updating existing anonymous pre-assessment for session ${sessionId}`,
        );
        preAssessment = await this.prisma.preAssessment.update({
          where: { sessionId },
          data: createData,
        });
      } else {
        preAssessment = await this.prisma.preAssessment.create({
          data: createData,
        });
      }

      // Generate comprehensive clinical analysis in background
      try {
        const questionnaireScores: QuestionnaireScores = {};
        const severityLevelsForAnalysis = severityLevels;

        const questionnaires = Object.keys(scores);
        questionnaires.forEach((questionnaire) => {
          if (scores[questionnaire] !== undefined) {
            questionnaireScores[questionnaire] = {
              score: scores[questionnaire],
              severity: severityLevelsForAnalysis[questionnaire] || 'Unknown',
            };
          }
        });

        await this.generateClinicalAnalysis(
          preAssessment,
          questionnaires,
          questionnaireScores,
        );
      } catch (analysisError) {
        this.logger.warn(
          'Advanced clinical analysis failed but core assessment succeeded:',
          analysisError instanceof Error
            ? analysisError.message
            : analysisError,
        );
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
        'Error creating anonymous pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to create anonymous pre-assessment',
      );
    }
  }

  async linkAnonymousPreAssessment(
    sessionId: string,
    userId: string,
  ): Promise<PreAssessment> {
    try {
      this.logger.log(
        `Linking anonymous pre-assessment ${sessionId} to user ${userId}`,
      );

      // Validate patient profile
      const client = await this.prisma.client.findUnique({
        where: { userId },
        select: { userId: true },
      });
      if (!client) {
        throw new NotFoundException('Client profile not found');
      }

      const existingAssessment = await this.prisma.preAssessment.findUnique({
        where: { sessionId },
      });

      if (!existingAssessment) {
        throw new NotFoundException(
          'Anonymous pre-assessment session not found',
        );
      }

      // Update assessment to link to client
      const preAssessment = await this.prisma.preAssessment.update({
        where: { id: existingAssessment.id },
        data: {
          clientId: userId,
        },
      });

      return preAssessment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        'Error linking anonymous pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to link anonymous pre-assessment',
      );
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

      return this.formatPreAssessmentResults(preAssessment);
    } catch (error: unknown) {
      this.handleError(error, 'Error retrieving pre-assessment');
    }
  }
}
