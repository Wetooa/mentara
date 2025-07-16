import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  calculateAllScores,
  generateSeverityLevels,
} from './pre-assessment.utils';
import { PreAssessment } from '@prisma/client';
import { CreatePreAssessmentDto } from '../../schema/pre-assessment';
import { AiServiceClient } from './services/ai-service.client';

@Injectable()
export class PreAssessmentService {
  private readonly logger = new Logger(PreAssessmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiServiceClient: AiServiceClient,
  ) {}

  private async getAiEstimate(
    flatAnswers: number[],
  ): Promise<Record<string, boolean> | null> {
    try {
      this.logger.debug(
        `Requesting AI prediction for ${flatAnswers.length} values`,
      );

      const result = await this.aiServiceClient.predict(flatAnswers);

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

  private flattenAnswers(answers: number[][]): number[] {
    // Input validation
    if (!Array.isArray(answers)) {
      throw new BadRequestException('Answers must be a 2D array');
    }

    // Flatten the 2D answers array
    const flattened = answers.flat();

    // Validate flattened array
    if (!Array.isArray(flattened) || flattened.length === 0) {
      throw new BadRequestException('Flattened answers array cannot be empty');
    }

    // Validate all values are numbers
    if (
      !flattened.every(
        (value) => typeof value === 'number' && Number.isFinite(value),
      )
    ) {
      throw new BadRequestException('All answer values must be finite numbers');
    }

    // Validate expected length for AI model
    if (flattened.length !== 201) {
      this.logger.warn(
        `Expected 201 values for AI prediction, got ${flattened.length}`,
      );
    }

    this.logger.debug(
      `Flattened ${answers.length} questionnaire arrays into ${flattened.length} values`,
    );
    return flattened;
  }

  private validateAnswersStructure(answers: number[][]): void {
    if (!Array.isArray(answers)) {
      throw new BadRequestException('Answers must be an array of arrays');
    }

    if (answers.length === 0) {
      throw new BadRequestException('Answers array cannot be empty');
    }

    // Validate each questionnaire's answers
    for (let i = 0; i < answers.length; i++) {
      const questionnaire = answers[i];

      if (!Array.isArray(questionnaire)) {
        throw new BadRequestException(
          `Questionnaire ${i} answers must be an array`,
        );
      }

      if (questionnaire.length === 0) {
        throw new BadRequestException(
          `Questionnaire ${i} cannot have empty answers`,
        );
      }

      // Validate answer values are in reasonable range (0-10 for most scales)
      for (let j = 0; j < questionnaire.length; j++) {
        const value = questionnaire[j];

        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new BadRequestException(
            `Invalid answer value at questionnaire ${i}, question ${j}: ${value}`,
          );
        }

        if (value < 0 || value > 10) {
          throw new BadRequestException(
            `Answer value out of range (0-10) at questionnaire ${i}, question ${j}: ${value}`,
          );
        }
      }
    }
  }

  private validateQuestionnaires(questionnaires: string[]): void {
    if (!Array.isArray(questionnaires)) {
      throw new BadRequestException('Questionnaires must be an array');
    }

    if (questionnaires.length === 0) {
      throw new BadRequestException('At least one questionnaire is required');
    }

    // Define valid questionnaire types
    const validQuestionnaires = [
      'Stress',
      'Anxiety',
      'Depression',
      'Insomnia',
      'Panic Disorder',
      'Bipolar Disorder',
      'OCD',
      'PTSD',
      'Social Anxiety',
      'Phobia',
      'Burnout',
      'Binge Eating',
      'ADHD',
      'Alcohol Use',
    ];

    for (const questionnaire of questionnaires) {
      if (
        typeof questionnaire !== 'string' ||
        questionnaire.trim().length === 0
      ) {
        throw new BadRequestException(
          'All questionnaire names must be non-empty strings',
        );
      }

      if (!validQuestionnaires.includes(questionnaire)) {
        this.logger.warn(`Unknown questionnaire type: ${questionnaire}`);
      }
    }
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

      // Comprehensive input validation
      this.validateQuestionnaires(data.questionnaires);
      this.validateAnswersStructure(data.answers);

      // Validate questionnaires and answers alignment
      if (data.questionnaires.length !== data.answers.length) {
        throw new BadRequestException(
          'Number of questionnaires must match number of answer arrays',
        );
      }

      let scores: Record<string, number> = data.scores as Record<
        string,
        number
      >;
      let severityLevels: Record<string, string> =
        data.severityLevels as Record<string, string>;

      // Calculate scores if not provided
      if (!data.scores || !data.severityLevels) {
        this.logger.debug('Calculating scores and severity levels');
        const calculatedScores = calculateAllScores(
          data.questionnaires,
          data.answers,
        );
        scores = Object.fromEntries(
          Object.entries(calculatedScores).map(([key, value]) => [
            key,
            value.score,
          ]),
        );
        severityLevels = generateSeverityLevels(calculatedScores);
      }

      // Safely flatten answers and attempt AI prediction
      let aiEstimate: Record<string, boolean> = {};
      try {
        const flatAnswers = this.flattenAnswers(data.answers);

        if (flatAnswers.length === 201) {
          this.logger.debug('Attempting AI prediction with validated input');
          const aiResult = await this.getAiEstimate(flatAnswers);
          if (aiResult) {
            aiEstimate = aiResult;
            this.logger.log('AI prediction successful');
          } else {
            this.logger.warn(
              'AI prediction failed, continuing without AI estimate',
            );
          }
        } else {
          this.logger.warn(
            `Cannot perform AI prediction: expected 201 values, got ${flatAnswers.length}`,
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
          questionnaires: data.questionnaires,
          answers: data.answers,
          answerMatrix: data.answerMatrix as number[][],
          scores,
          severityLevels,
          aiEstimate,
        },
      });

      this.logger.log(`Pre-assessment created successfully for user ${userId}`);
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

      let scores: Record<string, number>;
      let severityLevels: Record<string, string>;

      if (data.scores && this.isValidScores(data.scores)) {
        scores = data.scores;
      } else {
        scores = {};
      }

      if (
        data.severityLevels &&
        this.isValidSeverityLevels(data.severityLevels)
      ) {
        severityLevels = data.severityLevels;
      } else {
        severityLevels = {};
      }

      if (
        data.questionnaires &&
        data.answers &&
        (!data.scores || !data.severityLevels)
      ) {
        const calculatedScores = calculateAllScores(
          data.questionnaires,
          data.answers,
        );
        scores = Object.fromEntries(
          Object.entries(calculatedScores).map(([key, value]) => [
            key,
            value.score,
          ]),
        );
        severityLevels = generateSeverityLevels(calculatedScores);
      }

      const preAssessment = await this.prisma.preAssessment.update({
        where: { clientId: userId },
        data: {
          questionnaires: data.questionnaires as string[],
          answers: data.answers as number[][],
          answerMatrix: data.answerMatrix as number[][],
          scores,
          severityLevels,
        },
      });

      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }

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
}
