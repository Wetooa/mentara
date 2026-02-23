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
  BadRequestException,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PreAssessmentService } from './pre-assessment.service';
import { AiServiceClient } from './services/ai-service.client';
import { GeminiClientService } from './services/gemini-client.service';
import { PreAssessmentChatbotService } from './services/pre-assessment-chatbot.service';
import { QuestionnaireSelectorService } from './services/questionnaire-selector.service';
import { JwtAuthGuard } from '../auth/core/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/core/decorators/current-user-id.decorator';
import { CurrentUserRole } from '../auth/core/decorators/current-user-role.decorator';
import { Public } from '../auth/core/decorators/public.decorator';
import { CreatePreAssessmentDto } from './types/pre-assessment.dto';
import { PreAssessment } from '@prisma/client';

@Controller('pre-assessment')
@UseGuards(JwtAuthGuard)
export class PreAssessmentController {
  private readonly logger = new Logger(PreAssessmentController.name);

  constructor(
    private readonly preAssessmentService: PreAssessmentService,
    private readonly aiServiceClient: AiServiceClient,
    private readonly geminiClient: GeminiClientService,
    private readonly chatbotService: PreAssessmentChatbotService,
    private readonly questionnaireSelector: QuestionnaireSelectorService,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPreAssessment(
    @CurrentUserId() id: string,
    @Body() data: CreatePreAssessmentDto,
  ): Promise<{ id: string; message: string }> {
    try {
      const response = await this.preAssessmentService.createPreAssessment(id, data);
      return { id: response.id, message: 'Pre-assessment created successfully' };
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
      // If it's already a NotFoundException, re-throw it (don't convert to 500)
      if (error instanceof NotFoundException) {
        throw error;
      }
      // For other errors, convert to InternalServerErrorException
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

  @Get('gemini/health')
  async checkGeminiHealth(
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
      this.logger.log(`Admin ${currentUserId} checking Gemini API health`);

      const healthy = await this.geminiClient.healthCheck();
      const serviceInfo = this.geminiClient.getServiceInfo();

      return {
        status: healthy ? 'healthy' : 'unhealthy',
        healthy,
        serviceInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Gemini health check failed:', error);
      return {
        status: 'error',
        healthy: false,
        serviceInfo: this.geminiClient.getServiceInfo(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('gemini/metrics')
  async getGeminiMetrics(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
  ): Promise<{
    metrics: any;
    serviceInfo: any;
    timestamp: string;
  }> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} checking Gemini API metrics`);

      const metrics = this.geminiClient.getMetrics();
      const serviceInfo = this.geminiClient.getServiceInfo();

      return {
        metrics,
        serviceInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get Gemini metrics:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to get metrics',
      );
    }
  }

  @Post('gemini/test')
  @HttpCode(HttpStatus.OK)
  async testGemini(
    @CurrentUserId() currentUserId: string,
    @CurrentUserRole() role: string,
    @Body() body?: { message?: string },
  ): Promise<{
    success: boolean;
    request: any;
    response?: string;
    error?: string;
    timestamp: string;
  }> {
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    try {
      this.logger.log(`Admin ${currentUserId} testing Gemini API directly`);

      const testMessage = body?.message || 'Hello, this is a test message. Please respond with a unique greeting.';
      const testMessages = [
        { role: 'user' as const, content: testMessage },
      ];

      const serviceInfo = this.geminiClient.getServiceInfo();

      this.logger.log('Making test request to Gemini...');
      const response = await this.geminiClient.chatCompletion(testMessages, {
        temperature: 0.7,
        max_tokens: 100,
      });

      return {
        success: true,
        request: {
          messages: testMessages,
          serviceInfo,
        },
        response,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Gemini test failed:', error);
      return {
        success: false,
        request: {
          messages: body?.message ? [{ role: 'user', content: body.message }] : [],
          serviceInfo: this.geminiClient.getServiceInfo(),
        },
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ========== AUTHENTICATED ROUTES ==========

  @Public()
  @Post('chatbot/start')
  @HttpCode(HttpStatus.CREATED)
  async startChatbotSession(
    @CurrentUserId() userId?: string,
  ): Promise<{ sessionId: string }> {
    try {
      // Works for both authenticated and anonymous users
      // If userId is provided (from token), creates authenticated session
      // If userId is undefined, creates anonymous session
      return await this.chatbotService.startSession(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Public()
  @Post('chatbot/message')
  @HttpCode(HttpStatus.OK)
  async sendChatbotMessage(
    @Body() body: { sessionId: string; message: string },
    @CurrentUserId() userId?: string,
  ): Promise<{
    response: string;
    isComplete: boolean;
    currentQuestionnaire?: string;
    shouldShowQuestionnaire?: boolean;
    questionnaireData?: any;
    toolCall?: {
      tool: string;
      questionId: string;
      topic?: string;
      question: string;
      options: Array<{ value: number; label: string }>;
    };
  }> {
    try {
      this.logger.log(`[Chatbot Controller] Received message request ${userId ? `from user ${userId}` : 'anonymously'} for session ${body.sessionId}`);
      this.logger.log(`[Chatbot Controller] Message content: ${body.message?.substring(0, 100)}...`);

      const result = await this.chatbotService.sendMessage(
        body.sessionId,
        userId,
        body.message,
      );

      this.logger.log(`[Chatbot Controller] Successfully processed message, response length: ${result.response?.length || 0}`);
      return result;
    } catch (error) {
      this.logger.error('[Chatbot Controller] Error sending chatbot message:', error);
      this.logger.error('[Chatbot Controller] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        sessionId: body.sessionId,
      });

      // Re-throw NotFoundException and other HTTP exceptions as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to process chatbot message',
      );
    }
  }

  @Public()
  @Post('chatbot/answer')
  @HttpCode(HttpStatus.OK)
  async submitStructuredAnswer(
    @Body() body: {
      sessionId: string;
      questionId: string;
      answer: number;
    },
    @CurrentUserId() userId?: string,
  ): Promise<{
    success: boolean;
    acknowledged: string;
  }> {
    try {
      this.logger.log(`[Chatbot Controller] Received structured answer ${userId ? `from user ${userId}` : 'anonymously'}`);
      this.logger.log(`[Chatbot Controller] QuestionId: ${body.questionId}, Answer: ${body.answer}`);

      const result = await this.chatbotService.submitStructuredAnswer(
        body.sessionId,
        userId,
        body.questionId,
        body.answer,
      );

      this.logger.log(`[Chatbot Controller] Successfully stored structured answer`);
      return result;
    } catch (error) {
      this.logger.error('[Chatbot Controller] Error submitting structured answer:', error);
      this.logger.error('[Chatbot Controller] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        sessionId: body.sessionId,
        questionId: body.questionId,
      });

      // Re-throw NotFoundException and other HTTP exceptions as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to submit structured answer',
      );
    }
  }

  @Public()
  @Post('chatbot/submit-questionnaire')
  @HttpCode(HttpStatus.OK)
  async submitQuestionnaireForm(
    @Body() body: {
      sessionId: string;
      topic: string;
      responses: Record<number, number>;
    },
    @CurrentUserId() userId?: string,
  ): Promise<{
    success: boolean;
    questionnaireSaved: boolean;
    message: string;
  }> {
    try {
      this.logger.log(`[Chatbot Controller] Submitting questionnaire form ${userId ? `for user ${userId}` : 'anonymously'}`);
      this.logger.log(`[Chatbot Controller] Topic: ${body.topic}, Session: ${body.sessionId}`);

      // Get the questionnaire form generator to validate and map responses
      const formGenerator = new (await import('./services/questionnaire-form-generator.service')).QuestionnaireFormGeneratorService();

      // Validate responses
      const validation = formGenerator.validateResponses(body.topic, body.responses);
      if (!validation.isValid) {
        throw new BadRequestException(`Invalid questionnaire responses: ${validation.errors.join(', ')}`);
      }

      // Get session
      const session = await this.chatbotService.getSession(body.sessionId, userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Map responses to global answer array indices
      const mappedAnswers = formGenerator.mapResponsesToAnswerArray(body.topic, body.responses);

      // Get current collected answers
      const prisma = this.chatbotService['prisma'];
      const dbSession = await prisma.chatbotSession.findUnique({
        where: { sessionId: body.sessionId },
        select: { id: true, collectedAnswers: true, completedQuestionnaires: true },
      });

      if (!dbSession) {
        throw new NotFoundException('Session not found in database');
      }

      // Merge responses into collected answers
      const collectedAnswers = (dbSession.collectedAnswers as Record<string, number[]>) || {};
      if (!collectedAnswers[body.topic]) {
        collectedAnswers[body.topic] = [];
      }

      // Add the mapped answers
      for (const { globalIndex, value } of mappedAnswers) {
        collectedAnswers[body.topic].push(value);
      }

      // Mark questionnaire as completed
      const completedQuestionnaires = [...dbSession.completedQuestionnaires];
      if (!completedQuestionnaires.includes(body.topic)) {
        completedQuestionnaires.push(body.topic);
      }

      // Update session
      await prisma.chatbotSession.update({
        where: { id: dbSession.id },
        data: {
          collectedAnswers,
          completedQuestionnaires,
          lastActivity: new Date(),
        },
      });

      this.logger.log(`[Chatbot Controller] Successfully saved questionnaire responses for ${body.topic}`);

      return {
        success: true,
        questionnaireSaved: true,
        message: `Questionnaire ${body.topic} responses saved successfully`,
      };
    } catch (error) {
      this.logger.error('[Chatbot Controller] Error submitting questionnaire:', error);

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to submit questionnaire',
      );
    }
  }

  @Public()
  @Post('chatbot/complete')
  @HttpCode(HttpStatus.OK)
  async completeChatbotSession(
    @Body() body: { sessionId: string },
    @CurrentUserId() userId?: string,
  ): Promise<{
    success: boolean;
    sessionId?: string;
  }> {
    try {
      const result = await this.chatbotService.completeSession(
        body.sessionId,
        userId,
      );

      // Get session to extract answers
      const session = await this.chatbotService.getSession(body.sessionId, userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Get session from database to access full data  
      const prisma = this.chatbotService['prisma'];
      const dbSession = await prisma.chatbotSession.findUnique({
        where: { sessionId: body.sessionId },
        select: { id: true, conversationInsights: true, structuredAnswers: true },
      });

      if (!dbSession) {
        throw new NotFoundException('Session not found in database');
      }

      // Only create PreAssessment for authenticated users with Client profiles
      let preAssessment: PreAssessment | undefined;
      if (userId) {
        // Verify user has Client profile before creating PreAssessment
        const client = await prisma.client.findUnique({
          where: { userId },
          select: { userId: true },
        });

        if (client) {
          // User has client profile - safe to create PreAssessment
          // Convert collected answers to flat array format
          const structuredAnswers = (dbSession.structuredAnswers as Record<string, number>) || {};
          const answers = this.chatbotService.convertAnswersToArray(
            session.collectedAnswers,
            structuredAnswers,
          );

          // Save results to database with chatbot session link
          preAssessment = await this.preAssessmentService.createPreAssessment(
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
              assessmentMethod: 'CHATBOT',
            },
          );
        } else {
          this.logger.warn(
            `User ${userId} has no client profile, skipping PreAssessment creation. Session ${body.sessionId} will be linked later during registration.`,
          );
        }
      }

      // Convert answers to flat array format for anonymous sessions (needed for registration)
      // This is needed even if we don't create PreAssessment yet (for anonymous users)
      const structuredAnswers = (dbSession.structuredAnswers as Record<string, number>) || {};
      const answers = this.chatbotService.convertAnswersToArray(
        session.collectedAnswers,
        structuredAnswers,
      );

      return {
        success: true,
        ...(userId ? {} : { sessionId: body.sessionId }),
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
    @Param('sessionId') sessionId: string,
    @CurrentUserId() userId: string,
  ): Promise<{
    sessionId: string;
    currentQuestionnaire: string | null;
    isComplete: boolean;
    startedAt: Date;
  }> {
    try {
      const session = await this.chatbotService.getSession(sessionId, userId);
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

  @Get('chatbot/sessions')
  @HttpCode(HttpStatus.OK)
  async getUserSessions(
    @CurrentUserId() userId: string,
  ): Promise<Array<{
    sessionId: string;
    startedAt: Date;
    completedAt: Date | null;
    isComplete: boolean;
    completedQuestionnaires: string[];
  }>> {
    try {
      return await this.chatbotService.getUserSessions(userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Get('chatbot/sessions/:sessionId/insights')
  @HttpCode(HttpStatus.OK)
  async getChatbotSessionInsights(
    @Param('sessionId') sessionId: string,
    @CurrentUserId() userId: string,
  ): Promise<any> {
    try {
      const session = await this.chatbotService.getSession(sessionId, userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Get session from database to access insights
      const prisma = this.chatbotService['prisma'];
      const dbSession = await prisma.chatbotSession.findUnique({
        where: { sessionId },
        select: { conversationInsights: true },
      });

      return {
        insights: dbSession?.conversationInsights || null,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Post('chatbot/sessions/:sessionId/resume')
  @HttpCode(HttpStatus.OK)
  async resumeChatbotSession(
    @Param('sessionId') sessionId: string,
    @CurrentUserId() userId: string,
  ): Promise<{
    sessionId: string;
    currentQuestionnaire: string | null;
    isComplete: boolean;
    startedAt: Date;
  }> {
    try {
      const session = await this.chatbotService.resumeSession(sessionId, userId);
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

  @Post('chatbot/suggest-questionnaires')
  @HttpCode(HttpStatus.OK)
  async suggestQuestionnaires(
    @Body() body: { sessionId: string },
    @CurrentUserId() userId: string,
  ): Promise<any> {
    try {
      const session = await this.chatbotService.getSession(body.sessionId, userId);
      if (!session) {
        throw new NotFoundException('Session not found');
      }

      const selection = await this.questionnaireSelector.suggestQuestionnaires(
        session.conversationHistory,
      );

      return selection;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Post('chatbot/link-session')
  @HttpCode(HttpStatus.OK)
  async linkAnonymousSession(
    @Body() body: { sessionId: string },
    @CurrentUserId() userId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Link the anonymous session to the user
      const sessionData = await this.chatbotService.linkAnonymousSessionToUser(
        body.sessionId,
        userId,
      );

      // Get session from database to access chatbot session ID
      const prisma = this.chatbotService['prisma'];
      const dbSession = await prisma.chatbotSession.findUnique({
        where: { sessionId: body.sessionId },
        select: { id: true },
      });

      if (!dbSession) {
        throw new NotFoundException('Session not found in database');
      }

      // Create PreAssessment from linked session
      const preAssessment = await this.preAssessmentService.createPreAssessment(
        userId,
        {
          answers: sessionData.answers,
          scores: Object.fromEntries(
            Object.entries(sessionData.scores).map(([key, value]) => [
              key,
              value.score,
            ]),
          ),
          severityLevels: sessionData.severityLevels,
          assessmentMethod: 'CHATBOT',
        } as any,
      );

      return {
        success: true,
        message: 'Session linked successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  // ========== ANONYMOUS ROUTES ==========

  @Public()
  @Post('anonymous')
  @HttpCode(HttpStatus.CREATED)
  async createAnonymousPreAssessment(
    @Body() body: { sessionId: string; data: CreatePreAssessmentDto },
  ): Promise<{ sessionId: string }> {
    try {
      this.logger.log(`Creating anonymous pre-assessment for session ${body.sessionId}`);
      await this.preAssessmentService.createAnonymousPreAssessment(
        body.sessionId,
        body.data,
      );
      return { sessionId: body.sessionId };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Post('link')
  @HttpCode(HttpStatus.OK)
  async linkAnonymousPreAssessment(
    @CurrentUserId() userId: string,
    @Body() body: { sessionId: string },
  ): Promise<PreAssessment> {
    try {
      this.logger.log(`Linking anonymous pre-assessment session ${body.sessionId} to user ${userId}`);
      return await this.preAssessmentService.linkAnonymousPreAssessment(
        body.sessionId,
        userId,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  // ========== CHATBOT ANONYMOUS ROUTES ==========

  @Public()
  @Post('chatbot/anonymous/start')
  @HttpCode(HttpStatus.CREATED)
  async startAnonymousChatbotSession(): Promise<{ sessionId: string }> {
    try {
      return await this.chatbotService.startSession(undefined);
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Public()
  @Post('chatbot/anonymous/message')
  @HttpCode(HttpStatus.OK)
  async sendAnonymousChatbotMessage(
    @Body() body: { sessionId: string; message: string },
  ): Promise<{
    response: string;
    isComplete: boolean;
    currentQuestionnaire?: string;
    shouldShowQuestionnaire?: boolean;
    questionnaireData?: any;
    toolCall?: {
      tool: string;
      questionId: string;
      topic?: string;
      question: string;
      options: Array<{ value: number; label: string }>;
    };
  }> {
    try {
      this.logger.log(`[Chatbot Controller] Received anonymous message request for session ${body.sessionId}`);
      this.logger.log(`[Chatbot Controller] Message content: ${body.message?.substring(0, 100)}...`);

      const result = await this.chatbotService.sendMessage(
        body.sessionId,
        undefined,
        body.message,
      );

      this.logger.log(`[Chatbot Controller] Successfully processed anonymous message, response length: ${result.response?.length || 0}`);
      return result;
    } catch (error) {
      this.logger.error('[Chatbot Controller] Error sending anonymous chatbot message:', error);
      this.logger.error('[Chatbot Controller] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        sessionId: body.sessionId,
      });

      // Re-throw NotFoundException and other HTTP exceptions as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to process chatbot message',
      );
    }
  }

  @Public()
  @Post('chatbot/anonymous/answer')
  @HttpCode(HttpStatus.OK)
  async submitAnonymousStructuredAnswer(
    @Body() body: {
      sessionId: string;
      questionId: string;
      answer: number;
    },
  ): Promise<{
    success: boolean;
    acknowledged: string;
  }> {
    try {
      this.logger.log(`[Chatbot Controller] Received anonymous structured answer`);
      this.logger.log(`[Chatbot Controller] QuestionId: ${body.questionId}, Answer: ${body.answer}`);

      const result = await this.chatbotService.submitStructuredAnswer(
        body.sessionId,
        undefined,
        body.questionId,
        body.answer,
      );

      this.logger.log(`[Chatbot Controller] Successfully stored anonymous structured answer`);
      return result;
    } catch (error) {
      this.logger.error('[Chatbot Controller] Error submitting anonymous structured answer:', error);
      this.logger.error('[Chatbot Controller] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        sessionId: body.sessionId,
        questionId: body.questionId,
      });

      // Re-throw NotFoundException and other HTTP exceptions as-is
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Failed to submit structured answer',
      );
    }
  }

  @Public()
  @Post('chatbot/anonymous/complete')
  @HttpCode(HttpStatus.OK)
  async completeAnonymousChatbotSession(
    @Body() body: { sessionId: string },
  ): Promise<{
    scores: Record<string, { score: number; severity: string }>;
    severityLevels: Record<string, string>;
    sessionId: string;
    message: string;
  }> {
    try {
      const result = await this.chatbotService.completeSession(
        body.sessionId,
        undefined,
      );

      return {
        scores: result.scores,
        severityLevels: result.severityLevels,
        sessionId: body.sessionId,
        message: 'Assessment completed. Register to save your results permanently.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : error,
      );
    }
  }

  @Public()
  @Get('chatbot/anonymous/session/:sessionId')
  @HttpCode(HttpStatus.OK)
  async getAnonymousChatbotSession(
    @Param('sessionId') sessionId: string,
  ): Promise<{
    sessionId: string;
    currentQuestionnaire: string | null;
    isComplete: boolean;
    startedAt: Date;
  }> {
    try {
      const session = await this.chatbotService.getSession(sessionId, undefined);
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

  @Public()
  @Post('chatbot/anonymous/sessions/:sessionId/resume')
  @HttpCode(HttpStatus.OK)
  async resumeAnonymousChatbotSession(
    @Param('sessionId') sessionId: string,
  ): Promise<{
    sessionId: string;
    currentQuestionnaire: string | null;
    isComplete: boolean;
    startedAt: Date;
  }> {
    try {
      const session = await this.chatbotService.resumeSession(sessionId, undefined);
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
