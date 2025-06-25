import { Injectable } from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  CreatePreAssessmentDto,
  PreAssessmentResponse,
  ApiResponse,
} from '../types';
import {
  calculateAllScores,
  generateSeverityLevels,
} from './pre-assessment.utils';

@Injectable()
export class PreAssessmentService {
  constructor(private prisma: PrismaService) {}

  async createPreAssessment(
    clerkId: string,
    data: CreatePreAssessmentDto,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    try {
      // Find user by clerkId
      const user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Calculate scores and severity levels if not provided
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

      // Create pre-assessment record
      const preAssessment = await this.prisma.preAssessment.create({
        data: {
          userId: user.id,
          clerkId,
          questionnaires: data.questionnaires,
          answers: data.answers,
          answerMatrix: data.answerMatrix,
          scores,
          severityLevels,
        },
      });

      return {
        success: true,
        message: 'Pre-assessment created successfully',
        data: preAssessment as PreAssessmentResponse,
      };
    } catch (error) {
      console.error(
        'Error creating pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to create pre-assessment',
      };
    }
  }

  async getPreAssessmentByClerkId(
    clerkId: string,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    try {
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { clerkId },
      });

      if (!preAssessment) {
        return {
          success: false,
          message: 'Pre-assessment not found',
        };
      }

      return {
        success: true,
        message: 'Pre-assessment retrieved successfully',
        data: preAssessment as PreAssessmentResponse,
      };
    } catch (error) {
      console.error(
        'Error retrieving pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve pre-assessment',
      };
    }
  }

  async getPreAssessmentByUserId(
    userId: string,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    try {
      const preAssessment = await this.prisma.preAssessment.findUnique({
        where: { userId },
      });

      if (!preAssessment) {
        return {
          success: false,
          message: 'Pre-assessment not found',
        };
      }

      return {
        success: true,
        message: 'Pre-assessment retrieved successfully',
        data: preAssessment as PreAssessmentResponse,
      };
    } catch (error) {
      console.error(
        'Error retrieving pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to retrieve pre-assessment',
      };
    }
  }

  async updatePreAssessment(
    clerkId: string,
    data: Partial<CreatePreAssessmentDto>,
  ): Promise<ApiResponse<PreAssessmentResponse>> {
    try {
      // Calculate scores and severity levels if questionnaires and answers are provided
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
        where: { clerkId },
        data: {
          questionnaires: data.questionnaires,
          answers: data.answers,
          answerMatrix: data.answerMatrix,
          scores,
          severityLevels,
        },
      });

      return {
        success: true,
        message: 'Pre-assessment updated successfully',
        data: preAssessment as PreAssessmentResponse,
      };
    } catch (error) {
      console.error(
        'Error updating pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to update pre-assessment',
      };
    }
  }

  async deletePreAssessment(clerkId: string): Promise<ApiResponse<null>> {
    try {
      await this.prisma.preAssessment.delete({
        where: { clerkId },
      });

      return {
        success: true,
        message: 'Pre-assessment deleted successfully',
      };
    } catch (error) {
      console.error(
        'Error deleting pre-assessment:',
        error instanceof Error ? error.message : error,
      );
      return {
        success: false,
        message: 'Failed to delete pre-assessment',
      };
    }
  }
}
