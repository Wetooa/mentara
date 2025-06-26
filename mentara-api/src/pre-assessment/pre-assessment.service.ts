import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  calculateAllScores,
  generateSeverityLevels,
} from './pre-assessment.utils';
import { PreAssessment } from '@prisma/client';
import axios from 'axios';
import { CreatePreAssessmentDto } from '../../schema/pre-assessment';

@Injectable()
export class PreAssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAiEstimate(
    flatAnswers: number[],
  ): Promise<Record<string, boolean> | null> {
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        inputs: flatAnswers,
      });
      return response.data as Record<string, boolean>;
    } catch (error) {
      console.error(
        'AI model prediction error:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }

  private flattenAnswers(answers: number[][]): number[] {
    // Flatten the 2D answers array into a single array of length 201
    return answers.flat();
  }

  async createPreAssessment(
    userId: string,
    data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const client = await this.prisma.client.findUnique({
        where: { userId: userId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      let scores: Record<string, number> = data.scores as Record<
        string,
        number
      >;
      let severityLevels: Record<string, string> =
        data.severityLevels as Record<string, string>;
      if (!data.scores || !data.severityLevels) {
        const calculatedScores = calculateAllScores(
          data.questionnaires as string[],
          data.answers as number[][],
        );
        scores = Object.fromEntries(
          Object.entries(calculatedScores).map(([key, value]) => [
            key,
            value.score,
          ]),
        );
        severityLevels = generateSeverityLevels(calculatedScores);
      }
      const flatAnswers = this.flattenAnswers(data.answers as number[][]);
      const aiEstimate =
        flatAnswers.length === 201
          ? await this.getAiEstimate(flatAnswers)
          : null;
      const preAssessment = await this.prisma.preAssessment.create({
        data: {
          clientId: userId,
          questionnaires: data.questionnaires as string[],
          answers: data.answers as number[][],
          answerMatrix: data.answerMatrix as number[][],
          scores,
          severityLevels,
          aiEstimate: aiEstimate || {},
        },
      });

      return preAssessment;
    } catch (error) {
      console.error(
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
