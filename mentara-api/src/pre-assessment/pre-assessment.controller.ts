import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { PreAssessmentChatbotService } from './services/pre-assessment-chatbot.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/core/decorators/current-user-role.decorator';
import { CreatePreAssessmentDto } from '../../schema/pre-assessment';
import { PreAssessment } from '@prisma/client';

@Controller('pre-assessment')
@UseGuards(JwtAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
    private readonly aiServiceClient: AiServiceClient,
    private readonly chatbotService: PreAssessmentChatbotService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPreAssessment(
    @CurrentUserId() id: string,
    @Body() data: CreatePreAssessmentDto,
  ): Promise<PreAssessment> {
    try {
      return await this.preAssessmentService.createPreAssessment(id, data);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPreAssessment(@CurrentUserId() id: string): Promise<PreAssessment> {
    try {
      return await this.preAssessmentService.getPreAssessmentByUserId(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async updatePreAssessment(
    @CurrentUserId() id: string,
    @Body() data: Partial<CreatePreAssessmentDto>,
  ): Promise<PreAssessment> {
    try {
      return await this.preAssessmentService.updatePreAssessment(id, data);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async deletePreAssessment(@CurrentUserId() id: string): Promise<null> {
    try {
      return await this.preAssessmentService.deletePreAssessment(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get('ai-service/health')
  async checkAiServiceHealth(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ): Promise<{
    status: string;
    healthy: boolean;
    serviceInfo: any;
    timestamp: string;
  }> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} checking AI service health`);

      const healthy = await this.aiServiceClient.healthCheck();
      const serviceInfo = this.aiServiceClient.getServiceInfo();

      return {
        status: healthy ? 'healthy' : 'unhealthy',
        healthy,
        serviceInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('AI service health check failed:', error);
      return {
        status: 'error',
        healthy: false,
        serviceInfo: this.aiServiceClient.getServiceInfo(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('chatbot/start')
  @HttpCode(HttpStatus.CREATED)
  async startChatbotSession(
    @CurrentUserId() userId: string,
  ): Promise<{ sessionId: string }> {
    try {
      return await this.chatbotService.startSession(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Post('chatbot/message')
  @HttpCode(HttpStatus.OK)
  async sendChatbotMessage(
    @CurrentUserId() userId: string,
    @Body() body: { sessionId: string; message: string },
  ): Promise<{
    response: string;
    isComplete: boolean;
    currentQuestionnaire?: string;
  }> {
    try {
      return await this.chatbotService.sendMessage(
        body.sessionId,
        userId,
        body.message,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Post('chatbot/complete')
  @HttpCode(HttpStatus.OK)
  async completeChatbotSession(
    @CurrentUserId() userId: string,
    @Body() body: { sessionId: string },
  ): Promise<{
    scores: Record<string, { score: number; severity: string }>;
    severityLevels: Record<string, string>;
    preAssessment: PreAssessment;
  }> {
    try {
      const result = await this.chatbotService.completeSession(
        body.sessionId,
        userId,
      );

      // Get session to extract answers
      const session = this.chatbotService.getSession(body.sessionId, userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Convert collected answers to flat array format
      const answers = this.chatbotService.convertAnswersToArray(
        session.collectedAnswers,
      );

      // Save results to database
      const preAssessment = await this.preAssessmentService.createPreAssessment(
        userId,
        {
          answers,
          scores: Object.fromEntries(
            Object.entries(result.scores).map(([key, value]) => [
              key,
              value.score,
            ]),
          ),
          severityLevels: result.severityLevels,
        },
      );

      return {
        ...result,
        preAssessment,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get('chatbot/session/:sessionId')
  @HttpCode(HttpStatus.OK)
  async getChatbotSession(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
  ): Promise<{
    sessionId: string;
    currentQuestionnaire: string | null;
    isComplete: boolean;
    startedAt: Date;
  }> {
    try {
      const session = this.chatbotService.getSession(sessionId, userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      return {
        sessionId: session.sessionId,
        currentQuestionnaire: session.currentQuestionnaire,
        isComplete: session.isComplete,
        startedAt: session.startedAt,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

}
