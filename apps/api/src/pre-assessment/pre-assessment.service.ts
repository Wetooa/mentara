import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../providers/prisma-client.provider';
import { PreAssessment } from '@prisma/client';
import { CreatePreAssessmentDto } from './types/pre-assessment.dto';

@Injectable()
export class PreAssessmentService {
  private readonly logger = new Logger(PreAssessmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates or updates a pre-assessment for a user.
   * This implementation is lean and directly uses the data from the DTO.
   */
  async createPreAssessment(
    userId: string,
    data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      this.logger.log(`Creating/Updating pre-assessment for user ${userId}`);

      // Validate client exists
      const client = await this.prisma.client.findUnique({
        where: { userId },
        select: { userId: true },
      });

      if (!client) {
        throw new NotFoundException('Client profile not found');
      }

      // Prepare data for Prisma matching the flat schema
      const prismaData = {
        clientId: userId,
        method: data.method,
        data: data.data as any,
        pastTherapyExperiences: data.pastTherapyExperiences,
        medicationHistory: data.medicationHistory,
        accessibilityNeeds: data.accessibilityNeeds,
        soapAnalysisUrl: data.data.documents?.soapAnalysisUrl || null,
        conversationHistoryUrl:
          data.data.documents?.conversationHistoryUrl || null,
      };

      // Check if pre-assessment already exists for this client
      const existingAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
        orderBy: { createdAt: 'desc' },
      });

      if (existingAssessment) {
        this.logger.log(`Updating existing pre-assessment for client ${userId}`);
        return await this.prisma.preAssessment.update({
          where: { id: existingAssessment.id },
          data: prismaData,
        });
      }

      this.logger.log(`Creating new pre-assessment for client ${userId}`);
      return await this.prisma.preAssessment.create({
        data: prismaData,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error in createPreAssessment: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw new InternalServerErrorException('Failed to create pre-assessment');
    }
  }

  /**
   * Retrieves the latest pre-assessment for a client.
   */
  async getPreAssessmentByClientId(clientId: string): Promise<PreAssessment> {
    try {
      const assessment = await this.prisma.preAssessment.findFirst({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
      });

      if (!assessment) {
        throw new NotFoundException('Pre-assessment not found');
      }

      return assessment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error in getPreAssessmentByClientId: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw new InternalServerErrorException('Error retrieving pre-assessment');
    }
  }

  /**
   * Creates an anonymous pre-assessment.
   */
  async createAnonymousPreAssessment(
    data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      this.logger.log('Creating anonymous pre-assessment');

      // Prepare data for Prisma matching the flat schema
      const prismaData = {
        clientId: null,
        sessionId: data.assessmentId,
        method: data.method,
        data: data.data as any,
        pastTherapyExperiences: data.pastTherapyExperiences,
        medicationHistory: data.medicationHistory,
        accessibilityNeeds: data.accessibilityNeeds,
        soapAnalysisUrl: data.data.documents?.soapAnalysisUrl || null,
        conversationHistoryUrl:
          data.data.documents?.conversationHistoryUrl || null,
      };

      this.logger.log('Creating new anonymous pre-assessment');
      return await this.prisma.preAssessment.create({
        data: prismaData,
      });
    } catch (error) {
      this.logger.error(
        `Error in createAnonymousPreAssessment: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw new InternalServerErrorException(
        'Failed to create anonymous pre-assessment',
      );
    }
  }

  /**
   * Links an anonymous pre-assessment to a registered client.
   */
  async linkAnonymousPreAssessment(
    userId: string,
    sessionId: string,
  ): Promise<PreAssessment> {
    try {
      this.logger.log(`Linking pre-assessment ${sessionId} to user ${userId}`);

      // Find the anonymous pre-assessment
      const anonymousAssessment = await this.prisma.preAssessment.findFirst({
        where: { sessionId, clientId: null },
      });

      if (!anonymousAssessment) {
        throw new NotFoundException('Anonymous pre-assessment not found or already linked');
      }

      // Validate client exists
      const client = await this.prisma.client.findUnique({
        where: { userId },
        select: { userId: true },
      });

      if (!client) {
        throw new NotFoundException('Client profile not found');
      }

      // Check if pre-assessment already exists for this client to avoid duplicates, though unlikely on registration
      const existingAssessment = await this.prisma.preAssessment.findFirst({
        where: { clientId: userId },
      });

      if (existingAssessment) {
        // If they somehow already have one, delete the anonymous one to avoid orphans
        await this.prisma.preAssessment.delete({ where: { id: anonymousAssessment.id } });
        return existingAssessment;
      }

      // Update the anonymous pre-assessment with the new clientId
      return await this.prisma.preAssessment.update({
        where: { id: anonymousAssessment.id },
        data: { clientId: userId },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error in linkAnonymousPreAssessment: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw new InternalServerErrorException('Failed to link anonymous pre-assessment');
    }
  }
}
