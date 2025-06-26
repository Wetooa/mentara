import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { CreatePreAssessmentDto, PreAssessmentResponse } from '../types';
import {
  calculateAllScores,
  generateSeverityLevels,
} from './pre-assessment.utils';
import { Prisma } from '@prisma/client';
import axios from 'axios';

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

  private mapToResponse(
    preAssessment: Prisma.PreAssessmentGetPayload<{
      include: { client: { include: { user: true } } };
    }>,
    aiEstimate?: Record<string, boolean> | null,
  ): PreAssessmentResponse {
    return {
      id: preAssessment.id,
      userId: preAssessment.client.user.id,
      questionnaires: (preAssessment.questionnaires as string[]) || [],
      answers: (preAssessment.answers as number[][]) || [],
      answerMatrix: (preAssessment.answerMatrix as number[]) || [],
      scores: (preAssessment.scores as Record<string, number>) || {},
      severityLevels:
        (preAssessment.severityLevels as Record<string, string>) || {},
      createdAt: preAssessment.createdAt,
      updatedAt: preAssessment.updatedAt,
    };
  }

  async createPreAssessment(
    userId: string,
    data: CreatePreAssessmentDto,
  ): Promise<PreAssessmentResponse> {
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
      let scores: Record<string, number> = data.scores || {};
      let severityLevels: Record<string, string> = data.severityLevels || {};
      if (!data.scores || !data.severityLevels) {
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
      const preAssessment = await this.prisma.preAssessment.create({
        data: {
          clientId: client.userId,
          questionnaires: data.questionnaires,
          answers: data.answers,
          answerMatrix: data.answerMatrix,
          scores,
          severityLevels,
        },
        include: { client: { include: { user: true } } },
      });
      // AI estimate integration
      const flatAnswers = this.flattenAnswers(data.answers);
      const aiEstimate =
        flatAnswers.length === 201
          ? await this.getAiEstimate(flatAnswers)
          : null;
      return this.mapToResponse(preAssessment, aiEstimate);
    } catch (error) {
      console.error(
        'Error creating pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to create pre-assessment');
    }
  }

  async getPreAssessmentByUserId(
    userId: string,
  ): Promise<PreAssessmentResponse> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId: userId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { clientId: client.userId },
        include: { client: { include: { user: true } } },
      });
      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }
      // AI estimate integration
      const flatAnswers = this.flattenAnswers(
        (preAssessment.answers as number[][]) || [],
      );
      const aiEstimate =
        flatAnswers.length === 201
          ? await this.getAiEstimate(flatAnswers)
          : null;
      return this.mapToResponse(preAssessment, aiEstimate);
    } catch (error) {
      console.error(
        'Error retrieving pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve pre-assessment',
      );
    }
  }

  async getPreAssessmentByClientId(
    clientId: string,
  ): Promise<PreAssessmentResponse> {
    try {
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { clientId: clientId },
        include: { client: { include: { user: true } } },
      });
      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }
      // AI estimate integration
      const flatAnswers = this.flattenAnswers(
        (preAssessment.answers as number[][]) || [],
      );
      const aiEstimate =
        flatAnswers.length === 201
          ? await this.getAiEstimate(flatAnswers)
          : null;
      return this.mapToResponse(preAssessment, aiEstimate);
    } catch (error) {
      console.error(
        'Error retrieving pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve pre-assessment',
      );
    }
  }

  async updatePreAssessment(
    userId: string,
    data: Partial<CreatePreAssessmentDto>,
  ): Promise<PreAssessmentResponse> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId: userId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      let scores: Record<string, number> = data.scores || {};
      let severityLevels: Record<string, string> = data.severityLevels || {};
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
        where: { clientId: client.userId },
        data: {
          questionnaires: data.questionnaires,
          answers: data.answers,
          answerMatrix: data.answerMatrix,
          scores,
          severityLevels,
        },
        include: { client: { include: { user: true } } },
      });
      if (!preAssessment) {
        throw new NotFoundException('Pre-assessment not found');
      }
      // AI estimate integration
      const flatAnswers = this.flattenAnswers(
        (preAssessment.answers as number[][]) || [],
      );
      const aiEstimate =
        flatAnswers.length === 201
          ? await this.getAiEstimate(flatAnswers)
          : null;
      return this.mapToResponse(preAssessment, aiEstimate);
    } catch (error) {
      console.error(
        'Error updating pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to update pre-assessment');
    }
  }

  async deletePreAssessment(userId: string): Promise<null> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { userId: userId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      await this.prisma.preAssessment.delete({
        where: { clientId: client.userId },
      });
      return null;
    } catch (error) {
      console.error(
        'Error deleting pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException('Failed to delete pre-assessment');
    }
  }
}
