import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface ModerationResult {
  classification: 'safe' | 'toxic' | 'spam' | 'crisis';
  confidence: number;
  mentalHealthContext: boolean;
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  immediateEscalation?: boolean;
  flags: string[];
  processingTime: number;
}

export interface ModerationContext {
  context: string;
  userId?: string;
  userRole?: string;
  conversationId?: string;
  communityId?: string;
  timestamp?: Date;
}

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly moderationApiUrl: string;
  private readonly enabled: boolean;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.moderationApiUrl = this.configService.get<string>(
      'MODERATION_API_URL',
      'http://localhost:5001',
    );
    this.enabled = this.configService.get<boolean>('MODERATION_ENABLED', true);
    this.timeout = this.configService.get<number>('MODERATION_TIMEOUT', 5000);
  }

  /**
   * Classify content using the AI moderation service
   */
  async classifyContent(
    text: string,
    context: ModerationContext,
  ): Promise<ModerationResult> {
    if (!this.enabled) {
      return this.createSafeResult(text);
    }

    try {
      const startTime = Date.now();

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.moderationApiUrl}/api/v1/classify`,
          {
            text,
            context: context.context,
            user_id: context.userId,
            user_role: context.userRole,
            conversation_id: context.conversationId,
            community_id: context.communityId,
            timestamp: context.timestamp?.toISOString(),
          },
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const processingTime = Date.now() - startTime;
      const result: ModerationResult = {
        ...response.data,
        processingTime,
      };

      // Log crisis detection for immediate escalation
      if (result.crisisLevel === 'critical' || result.immediateEscalation) {
        this.logger.warn(
          `CRISIS DETECTED: User ${context.userId} in ${context.context}`,
          {
            text: text.substring(0, 100),
            crisisLevel: result.crisisLevel,
            confidence: result.confidence,
            flags: result.flags,
          },
        );
      }

      // Log toxic content detection
      if (result.classification === 'toxic') {
        this.logger.warn(
          `TOXIC CONTENT DETECTED: User ${context.userId} in ${context.context}`,
          {
            text: text.substring(0, 100),
            confidence: result.confidence,
            flags: result.flags,
          },
        );
      }

      return result;
    } catch (error) {
      this.logger.error('Moderation service error:', error);

      // Fallback to safe classification if service is unavailable
      return this.createSafeResult(text, {
        flags: ['service_unavailable'],
        processingTime: Date.now() - Date.now(),
      });
    }
  }

  /**
   * Check if content requires crisis intervention
   */
  async checkCrisisContent(
    text: string,
    context: ModerationContext,
  ): Promise<boolean> {
    const result = await this.classifyContent(text, context);
    return (
      result.crisisLevel === 'critical' || (result.immediateEscalation ?? false)
    );
  }

  /**
   * Batch classification for multiple content items
   */
  async batchClassify(
    items: Array<{ text: string; context: ModerationContext }>,
  ): Promise<ModerationResult[]> {
    if (!this.enabled) {
      return items.map((item) => this.createSafeResult(item.text));
    }

    try {
      const startTime = Date.now();

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.moderationApiUrl}/api/v1/classify/batch`,
          {
            items: items.map((item) => ({
              text: item.text,
              context: item.context.context,
              user_id: item.context.userId,
              user_role: item.context.userRole,
              conversation_id: item.context.conversationId,
              community_id: item.context.communityId,
              timestamp: item.context.timestamp?.toISOString(),
            })),
          },
          {
            timeout: this.timeout * 2, // Longer timeout for batch processing
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const processingTime = Date.now() - startTime;
      return response.data.map((result: any) => ({
        ...result,
        processingTime: processingTime / items.length, // Average per item
      }));
    } catch (error) {
      this.logger.error('Batch moderation service error:', error);
      return items.map((item) => this.createSafeResult(item.text));
    }
  }

  /**
   * Health check for the moderation service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'disabled';
    responseTime?: number;
    error?: string;
  }> {
    if (!this.enabled) {
      return { status: 'disabled' };
    }

    try {
      const startTime = Date.now();

      await firstValueFrom(
        this.httpService.get(`${this.moderationApiUrl}/health`, {
          timeout: this.timeout,
        }),
      );

      const responseTime = Date.now() - startTime;
      return { status: 'healthy', responseTime };
    } catch (error) {
      this.logger.error('Moderation service health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get moderation service statistics
   */
  async getStats(): Promise<{
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
    crisisDetections: number;
  }> {
    if (!this.enabled) {
      return {
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 0,
        crisisDetections: 0,
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.moderationApiUrl}/api/v1/stats`, {
          timeout: this.timeout,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get moderation stats:', error);
      return {
        requestCount: 0,
        averageResponseTime: 0,
        errorRate: 100,
        crisisDetections: 0,
      };
    }
  }

  /**
   * Create a safe result for fallback scenarios
   */
  private createSafeResult(
    text: string,
    overrides?: Partial<ModerationResult>,
  ): ModerationResult {
    return {
      classification: 'safe',
      confidence: 0.5,
      mentalHealthContext: false,
      flags: [],
      processingTime: 0,
      ...overrides,
    };
  }

  /**
   * Create moderation context for posts
   */
  createPostContext(
    userId: string,
    userRole: string,
    communityId?: string,
  ): ModerationContext {
    return {
      context: 'post',
      userId,
      userRole,
      communityId,
      timestamp: new Date(),
    };
  }

  /**
   * Create moderation context for comments
   */
  createCommentContext(
    userId: string,
    userRole: string,
    communityId?: string,
  ): ModerationContext {
    return {
      context: 'comment',
      userId,
      userRole,
      communityId,
      timestamp: new Date(),
    };
  }

  /**
   * Create moderation context for messages
   */
  createMessageContext(
    userId: string,
    userRole: string,
    conversationId: string,
  ): ModerationContext {
    return {
      context: 'message',
      userId,
      userRole,
      conversationId,
      timestamp: new Date(),
    };
  }

  /**
   * Create moderation context for therapy sessions
   */
  createTherapyContext(
    userId: string,
    userRole: string,
    sessionId: string,
  ): ModerationContext {
    return {
      context: 'therapy',
      userId,
      userRole,
      conversationId: sessionId,
      timestamp: new Date(),
    };
  }
}
