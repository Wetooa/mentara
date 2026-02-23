import { Injectable, Logger, NotFoundException, HttpException, BadRequestException, InternalServerErrorException, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../providers/prisma-client.provider';
import { ChatbotMessageRole, Prisma } from '@prisma/client';
import {
  processPreAssessmentAnswers,
  type QuestionnaireScores,
  LIST_OF_QUESTIONNAIRES,
  QUESTIONNAIRE_SCORING,
} from '../pre-assessment.utils';

interface ChatbotSessionData {
  sessionId: string;
  userId: string | null;
  conversationHistory: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  currentQuestionnaire: string | null;
  collectedAnswers: Record<string, number[]>; // questionnaire -> answers
  structuredAnswers: Record<string, number>; // questionId -> answer for tool call questions
  currentQuestionIndex: number;
  startedAt: Date;
  lastActivity: Date;
  isComplete: boolean;
}

@Injectable()
export class PreAssessmentChatbotService {
  private readonly logger = new Logger(PreAssessmentChatbotService.name);
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly flaskUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.flaskUrl = this.configService.get<string>('FLASK_MICROSERVICE_URL') || 'http://localhost:5001';
    // Cleanup expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Initialize a new chatbot session
   */
  async startSession(userId?: string): Promise<{ sessionId: string }> {
    let clientId: string | undefined = undefined;

    if (userId) {
      const client = await this.prisma.client.findUnique({
        where: { userId },
        select: { userId: true },
      });

      if (client) {
        clientId = client.userId;
      }
    }

    const sessionId = userId
      ? `chatbot_${userId}_${Date.now()}`
      : `chatbot_anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const createData: any = {
      sessionId,
      userId: userId || null,
      clientId: clientId || null,
      isComplete: false,
    };

    await (this.prisma.chatbotSession.create as any)({
      data: createData,
    });

    try {
      await firstValueFrom(this.httpService.post(`${this.flaskUrl}/api/session/new`, {
        sessionId,
      }));
    } catch (error) {
      this.logger.error(`Failed to initialize session in Flask for ${sessionId}`, error);
    }

    return { sessionId };
  }

  /**
   * Send a message to the chatbot and get response
   */
  async sendMessage(
    sessionId: string,
    userId: string | undefined,
    userMessage: string,
  ): Promise<{
    response: string;
    isComplete: boolean;
    results?: any;
  }> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    if (userId && session.userId && session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }

    if (session.isComplete) {
      return {
        response: 'The assessment is already complete.',
        isComplete: true,
      };
    }

    try {
      const response = await firstValueFrom<AxiosResponse<{ response: string; state?: { is_complete: boolean }; results?: any }>>(
        this.httpService.post(`${this.flaskUrl}/api/chat`, {
          sessionId,
          message: userMessage,
        })
      );
      const data = response.data;

      const updateData: any = {
        lastActivity: new Date(),
      };

      if (data.state?.is_complete) {
        updateData.isComplete = true;
        updateData.completedAt = new Date();
      }

      await this.prisma.chatbotSession.update({
        where: { id: session.id },
        data: updateData,
      });

      return {
        response: data.response,
        isComplete: data.state?.is_complete || false,
        results: data.results,
      };

    } catch (error) {
      this.logger.error('Error communicating with Flask agent', error);
      throw new InternalServerErrorException('Failed to process message with agent core');
    }
  }

  /**
   * Complete the chatbot session
   */
  async completeSession(
    sessionId: string,
    userId: string | undefined,
  ): Promise<any> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    try {
      const response = await firstValueFrom<AxiosResponse<{ results?: any }>>(
        this.httpService.post(`${this.flaskUrl}/api/session/${sessionId}/end`, {})
      );

      await this.prisma.chatbotSession.update({
        where: { id: session.id },
        data: {
          isComplete: true,
          completedAt: new Date(),
        },
      });

      return response.data.results || { scores: {}, severityLevels: {} };

    } catch (error) {
      this.logger.error(`Error forcing completion for session ${sessionId}`, error);
      throw new InternalServerErrorException('Failed to force complete session via agent core');
    }
  }

  /**
   * Stream a PDF from Flask microservice
   */
  async getPdfStream(
    sessionId: string,
    type: 'summary' | 'history',
    res: Response,
  ): Promise<StreamableFile> {
    const endpoint = type === 'summary' ? 'summary' : 'history';
    const url = `${this.flaskUrl}/api/session/${sessionId}/pdf/${endpoint}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          responseType: 'arraybuffer',
        })
      );

      const filename = `assessment_${type}_${sessionId}.pdf`;
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      });

      return new StreamableFile(Buffer.from(response.data));
    } catch (error) {
      this.logger.error(`Failed to stream ${type} PDF for session ${sessionId}`, error);
      throw new InternalServerErrorException(`Could not retrieve ${type} PDF`);
    }
  }

  /**
   * Link an anonymous session to a user account
   */
  async linkAnonymousSessionToUser(
    sessionId: string,
    userId: string,
  ): Promise<{
    sessionId: string;
    scores: QuestionnaireScores;
    severityLevels: Record<string, string>;
    answers: number[];
    conversationInsights: any;
  }> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    if (session.userId !== null) {
      throw new BadRequestException('Session is already linked to a user');
    }

    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { userId: true },
    });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const collectedAnswers = (session.collectedAnswers as Record<string, number[]>) || {};
    const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
    const answers = this.convertAnswersToArray(collectedAnswers, structuredAnswers);

    const { scores: rawScores, severityLevels } = processPreAssessmentAnswers(answers);

    const scores: QuestionnaireScores = Object.fromEntries(
      Object.entries(rawScores).map(([key, score]) => [
        key,
        {
          score: score,
          severity: severityLevels[key] || 'unknown',
        },
      ]),
    );

    await this.prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        userId,
        clientId: client.userId,
      },
    });

    return {
      sessionId,
      scores,
      severityLevels,
      answers,
      conversationInsights: session.conversationInsights,
    };
  }

  /**
   * Submit a structured answer from a tool call question
   */
  async submitStructuredAnswer(
    sessionId: string,
    userId: string | undefined,
    questionId: string,
    answer: number,
  ): Promise<{
    success: boolean;
    acknowledged: string;
  }> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new NotFoundException('Chatbot session not found');
    }

    if (userId && session.userId && session.userId !== userId) {
      throw new NotFoundException('Session does not belong to user');
    }

    if (session.isComplete) {
      return {
        success: false,
        acknowledged: 'The assessment is already complete.',
      };
    }

    const questionIdParts = questionId.split('_q');
    const topic = questionIdParts[0]
      ? questionIdParts[0]
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      : 'Unknown';

    const collectedAnswers = (session.collectedAnswers as Record<string, number[]>) || {};
    if (!collectedAnswers[topic]) {
      collectedAnswers[topic] = [];
    }
    collectedAnswers[topic].push(answer);

    const structuredAnswers = (session.structuredAnswers as Record<string, number>) || {};
    structuredAnswers[questionId] = answer;

    await this.prisma.chatbotSession.update({
      where: { id: session.id },
      data: {
        collectedAnswers: collectedAnswers,
        structuredAnswers: structuredAnswers,
        lastActivity: new Date(),
      },
    });

    return {
      success: true,
      acknowledged: 'Thank you for your answer.',
    };
  }

  /**
   * Get session state
   */
  async getSession(sessionId: string, userId: string | undefined): Promise<ChatbotSessionData | null> {
    const session = await this.prisma.chatbotSession.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return null;
    }

    if (userId && session.userId && session.userId !== userId) {
      return null;
    }

    return this.convertToSessionData(session);
  }

  /**
   * Resume a session
   */
  async resumeSession(sessionId: string, userId: string | undefined): Promise<ChatbotSessionData | null> {
    return this.getSession(sessionId, userId);
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string | undefined): Promise<any[]> {
    const whereClause: Prisma.ChatbotSessionWhereInput = userId
      ? { userId }
      : { userId: null as any };

    return await this.prisma.chatbotSession.findMany({
      where: whereClause,
      select: {
        sessionId: true,
        startedAt: true,
        completedAt: true,
        isComplete: true,
        completedQuestionnaires: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  private convertToSessionData(session: any): ChatbotSessionData {
    return {
      sessionId: session.sessionId,
      userId: session.userId,
      conversationHistory: [],
      currentQuestionnaire: session.currentQuestionnaire,
      collectedAnswers: (session.collectedAnswers as Record<string, number[]>) || {},
      structuredAnswers: (session.structuredAnswers as Record<string, number>) || {},
      currentQuestionIndex: 0,
      startedAt: session.startedAt,
      lastActivity: session.lastActivity,
      isComplete: session.isComplete,
    };
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const expiryTime = new Date(Date.now() - this.SESSION_TIMEOUT);

    try {
      const result = await this.prisma.chatbotSession.deleteMany({
        where: {
          lastActivity: { lt: expiryTime },
          isComplete: false,
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired chatbot sessions`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
    }
  }

  private mergeStructuredAnswers(
    collectedAnswers: Record<string, number[]>,
    structuredAnswers: Record<string, number>,
  ): Record<string, number[]> {
    const merged = { ...collectedAnswers };

    for (const [questionId, answer] of Object.entries(structuredAnswers)) {
      const questionIdParts = questionId.split('_q');
      const topic = questionIdParts[0]
        ? questionIdParts[0]
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        : 'Unknown';

      if (!merged[topic]) {
        merged[topic] = [];
      }

      if (!merged[topic].includes(answer)) {
        merged[topic].push(answer);
      }
    }

    return merged;
  }

  convertAnswersToArray(
    collectedAnswers: Record<string, number[]>,
    structuredAnswers: Record<string, number> = {},
  ): number[] {
    const mergedAnswers = this.mergeStructuredAnswers(collectedAnswers, structuredAnswers);
    const allAnswers: number[] = [];
    const questionnaires = LIST_OF_QUESTIONNAIRES;

    for (const questionnaire of questionnaires) {
      const answers = mergedAnswers[questionnaire] || [];
      const config = QUESTIONNAIRE_SCORING[questionnaire];
      if (config) {
        const expectedCount = Object.keys(config.severityLevels).length * 5;
        while (answers.length < expectedCount) {
          answers.push(0);
        }
      }
      const normalizedAnswers = answers.map(answer => (answer === -1 ? 0 : answer));
      allAnswers.push(...normalizedAnswers);
    }

    while (allAnswers.length < 201) {
      allAnswers.push(0);
    }

    return allAnswers.slice(0, 201);
  }
}
