import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiClientService } from './gemini-client.service';
import { OllamaClientService } from './ollama-client.service';
import { SambaNovaClientService } from './sambanova-client.service';

/**
 * Supported AI providers
 */
export type AiProvider = 'gemini' | 'ollama' | 'sambanova';

/**
 * Common interface for AI chat messages
 */
export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Common interface for chat completion options
 */
export interface AiChatCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Interface that all AI clients must implement
 */
export interface IAiClient {
  chatCompletion(
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): Promise<string>;
  healthCheck(): Promise<boolean>;
  getServiceInfo(): Record<string, any>;
}

/**
 * AI Provider Factory Service
 *
 * This factory provides a unified interface for AI services and allows
 * switching between different providers via the AI_PROVIDER environment variable.
 *
 * Supported providers:
 * - ollama: Local Ollama server with OpenAI-compatible API (default)
 * - gemini: Google Gemini API
 * - sambanova: SambaNova Cloud API
 *
 * Usage:
 * ```typescript
 * constructor(private readonly aiProvider: AiProviderFactory) {}
 *
 * async someMethod() {
 *   const response = await this.aiProvider.chatCompletion(messages, options);
 * }
 * ```
 */
@Injectable()
export class AiProviderFactory implements OnModuleInit, IAiClient {
  private readonly logger = new Logger(AiProviderFactory.name);
  private readonly provider: AiProvider;
  private activeClient: IAiClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly geminiClient: GeminiClientService,
    private readonly ollamaClient: OllamaClientService,
    private readonly sambaNovaClient: SambaNovaClientService,
  ) {
    // Get provider from environment variable (default to ollama)
    const providerConfig = this.configService.get<string>('AI_PROVIDER')?.toLowerCase() || 'ollama';
    
    // Validate provider
    if (!['gemini', 'ollama', 'sambanova'].includes(providerConfig)) {
      this.logger.warn(
        `⚠️ Invalid AI_PROVIDER "${providerConfig}", defaulting to "ollama"`,
      );
      this.provider = 'ollama';
    } else {
      this.provider = providerConfig as AiProvider;
    }

    // Set active client based on provider
    switch (this.provider) {
      case 'gemini':
        this.activeClient = this.geminiClient;
        break;
      case 'sambanova':
        this.activeClient = this.sambaNovaClient;
        break;
      case 'ollama':
      default:
        this.activeClient = this.ollamaClient;
        break;
    }

    this.logger.log(`✅ AI Provider initialized: ${this.provider}`);
  }

  async onModuleInit() {
    // Log service info on startup
    const info = this.getServiceInfo();
    this.logger.log(`AI Provider: ${this.provider}`);
    this.logger.log(`Service Info: ${JSON.stringify(info, null, 2)}`);

    // Optional: perform health check on startup
    try {
      const isHealthy = await this.healthCheck();
      if (isHealthy) {
        this.logger.log(`✅ AI Provider "${this.provider}" is healthy`);
      } else {
        this.logger.warn(`⚠️ AI Provider "${this.provider}" health check failed`);
      }
    } catch (error) {
      this.logger.warn(
        `⚠️ AI Provider "${this.provider}" health check error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get the current AI provider name
   */
  getProvider(): AiProvider {
    return this.provider;
  }

  /**
   * Get the active AI client instance
   */
  getActiveClient(): IAiClient {
    return this.activeClient;
  }

  /**
   * Send a chat completion request to the active AI provider
   */
  async chatCompletion(
    messages: AiChatMessage[],
    options?: AiChatCompletionOptions,
  ): Promise<string> {
    this.logger.debug(`Using ${this.provider} for chat completion`);
    return this.activeClient.chatCompletion(messages, options);
  }

  /**
   * Health check for the active AI provider
   */
  async healthCheck(): Promise<boolean> {
    return this.activeClient.healthCheck();
  }

  /**
   * Get service info for the active AI provider
   */
  getServiceInfo(): Record<string, any> {
    return {
      provider: this.provider,
      ...this.activeClient.getServiceInfo(),
    };
  }

  /**
   * Get service info for all providers
   */
  getAllProvidersInfo(): Record<AiProvider, Record<string, any>> {
    return {
      gemini: this.geminiClient.getServiceInfo(),
      ollama: this.ollamaClient.getServiceInfo(),
      sambanova: this.sambaNovaClient.getServiceInfo(),
    };
  }

  /**
   * Check health of all providers
   */
  async checkAllProvidersHealth(): Promise<Record<AiProvider, boolean>> {
    const [geminiHealth, ollamaHealth, sambaNovaHealth] = await Promise.allSettled([
      this.geminiClient.healthCheck(),
      this.ollamaClient.healthCheck(),
      this.sambaNovaClient.healthCheck(),
    ]);

    return {
      gemini: geminiHealth.status === 'fulfilled' && geminiHealth.value,
      ollama: ollamaHealth.status === 'fulfilled' && ollamaHealth.value,
      sambanova: sambaNovaHealth.status === 'fulfilled' && sambaNovaHealth.value,
    };
  }
}

