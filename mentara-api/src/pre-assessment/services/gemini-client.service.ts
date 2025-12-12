import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

interface GeminiChatMessage {
  role: 'system' | 'user' | 'assistant' | 'model';
  content: string;
}

interface GeminiGenerateContentRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
}

interface GeminiGenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    index: number;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  lastError: string | null;
  lastErrorTime: Date | null;
  errorsByType: Record<string, number>;
}

@Injectable()
export class GeminiClientService {
  private readonly logger = new Logger(GeminiClientService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultModel: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second
  private readonly metrics: ApiMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
    lastError: null,
    lastErrorTime: null,
    errorsByType: {},
  };
  private responseTimes: number[] = [];

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.defaultModel =
      this.configService.get<string>('GEMINI_MODEL') ||
      'gemini-2.0-flash-exp';

    // Log model configuration
    if (this.configService.get<string>('GEMINI_MODEL')) {
      this.logger.log(
        `✅ Gemini Model: ${this.defaultModel} (from GEMINI_MODEL env var)`,
      );
    } else {
      this.logger.log(`✅ Gemini Model: ${this.defaultModel} (default)`);
      this.logger.warn(
        `⚠️ Using default model. Set GEMINI_MODEL env var to use a different model.`,
      );
    }

    // Validate API key
    if (!this.apiKey) {
      this.logger.error(
        '⚠️ GEMINI_API_KEY not found in environment variables',
      );
    } else {
      if (this.apiKey.length < 20) {
        this.logger.warn(
          `⚠️ GEMINI_API_KEY appears to be too short (${this.apiKey.length} chars). This may be invalid.`,
        );
      } else {
        this.logger.log(
          `✅ Gemini API key configured (length: ${this.apiKey.length})`,
        );
      }
    }

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (config.url) {
          this.logger.debug(
            `Gemini API Request: ${config.method?.toUpperCase()} ${config.url}`,
          );
          if (config.data) {
            this.logger.debug(
              `Gemini Request Payload: ${JSON.stringify(config.data, null, 2)}`,
            );
          }
        }
        return config;
      },
      (error) => {
        this.logger.error('Gemini API Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Gemini API Response: ${response.status}`);
        if (response.data) {
          this.logger.debug(
            `Gemini Response Data: ${JSON.stringify(response.data, null, 2)}`,
          );
        }
        return response;
      },
      (error) => {
        this.logger.error('Gemini API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Send a chat completion request to Gemini API
   */
  async chatCompletion(
    messages: GeminiChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException(
        'Gemini API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Validate messages array
    if (!messages || messages.length === 0) {
      throw new HttpException(
        'Messages array cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate all messages have content
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg.content || typeof msg.content !== 'string' || msg.content.trim().length === 0) {
        this.logger.error(`⚠️ Message at index ${i} has empty or invalid content`);
        throw new HttpException(
          `Message at index ${i} has empty or invalid content`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Convert messages to Gemini format
    // Gemini uses systemInstruction for system messages and contents for conversation
    const systemMessages: string[] = [];
    const conversationMessages: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemMessages.push(msg.content);
      } else {
        // Convert 'assistant' to 'model' for Gemini
        const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
        conversationMessages.push({
          role: geminiRole,
          parts: [{ text: msg.content }],
        });
      }
    }

    // Combine system messages into one
    const systemInstruction = systemMessages.length > 0
      ? { parts: [{ text: systemMessages.join('\n\n') }] }
      : undefined;

    const request: GeminiGenerateContentRequest = {
      contents: conversationMessages,
      ...(systemInstruction && { systemInstruction }),
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.max_tokens ?? 1000,
      },
    };

    const model = options?.model || this.defaultModel;
    const endpoint = `/models/${model}:generateContent?key=${this.apiKey}`;

    // Log full request details
    this.logger.log('=== Gemini Chat Completion Request ===');
    this.logger.log(`Endpoint: ${this.baseUrl}${endpoint}`);
    this.logger.log(`Model: ${model}`);
    this.logger.log(`Messages count: ${messages.length}`);
    this.logger.log(`Message roles: ${messages.map(m => m.role).join(', ')}`);
    this.logger.log(`Full request: ${JSON.stringify(request, null, 2)}`);

    // Track metrics
    this.metrics.totalRequests++;
    const startTime = Date.now();

    try {
      const response = await this.retryRequest<GeminiGenerateContentResponse>(() =>
        this.axiosInstance.post(endpoint, request),
      );

      // Track successful request
      const responseTime = Date.now() - startTime;
      this.metrics.successfulRequests++;
      this.responseTimes.push(responseTime);
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift(); // Keep only last 100
      }
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

      // Track token usage
      if (response.data.usageMetadata) {
        this.metrics.totalTokensUsed += response.data.usageMetadata.totalTokenCount;
      }

      // Log full response
      this.logger.log('=== Gemini Chat Completion Response ===');
      this.logger.log(`Candidates count: ${response.data?.candidates?.length || 0}`);
      this.logger.log(`Response time: ${Date.now() - startTime}ms`);
      this.logger.log(
        `Full response: ${JSON.stringify(response.data, null, 2)}`,
      );

      // Validate response structure
      const validation = this.validateGeminiResponse(response);
      if (!validation.isValid) {
        this.logger.error(
          `Gemini API response validation failed: ${validation.error}`,
        );
        this.logger.error(
          `Response structure: ${JSON.stringify(response.data, null, 2)}`,
        );
        throw new HttpException(
          `Invalid response from Gemini API: ${validation.error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Extract content
      let content = validation.content!;
      this.logger.log(
        `Gemini API response received (tokens: ${response.data.usageMetadata?.totalTokenCount || 'unknown'})`,
      );
      this.logger.debug(
        `Raw content length: ${content.length}, preview: ${content.substring(0, 100)}...`,
      );

      // Parse and clean the response to remove reasoning tags if any
      try {
        content = this.parseAndCleanResponse(content);
      } catch (parseError) {
        this.logger.error(
          `Error parsing/cleaning response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
        // Continue with original content if parsing fails
        content = validation.content!;
      }

      // Validate cleaned content
      if (!content || content.trim().length === 0) {
        this.logger.warn(
          'Parsed content is empty after cleaning, using original content',
        );
        content = validation.content!;
      }

      this.logger.log(
        `Extracted content (first 200 chars): ${content.substring(0, Math.min(200, content.length))}...`,
      );

      return content;
    } catch (error) {
      // Track failed request
      this.metrics.failedRequests++;
      const responseTime = Date.now() - startTime;
      this.metrics.lastErrorTime = new Date();

      if (error instanceof AxiosError) {
        const status = error.response?.status || 0;
        const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
        this.metrics.lastError = errorMessage;
        this.metrics.errorsByType[`http_${status}`] = (this.metrics.errorsByType[`http_${status}`] || 0) + 1;

        this.logger.error('=== Gemini API Chat Completion Error ===');
        this.logger.error(`Error type: ${error.name}`);
        this.logger.error(`Error message: ${errorMessage}`);
        this.logger.error(`Request time before error: ${responseTime}ms`);
        this.logger.error(`Axios error details: ${JSON.stringify(error.response?.data, null, 2)}`);

        if (status === 400) {
          this.logger.error('⚠️ Bad Request Error - Check request format');
          throw new HttpException(
            `Gemini API bad request: ${errorMessage}`,
            HttpStatus.BAD_REQUEST,
          );
        } else if (status === 401 || status === 403) {
          this.logger.error('⚠️ Gemini API authentication failed');
          this.logger.error('⚠️ Please check your GEMINI_API_KEY');
          throw new HttpException(
            'Gemini API authentication failed. Please check your API key.',
            HttpStatus.UNAUTHORIZED,
          );
        } else if (status === 429) {
          this.logger.error('⚠️ Rate Limit Error - Too many requests');
          throw new HttpException(
            'Rate limit exceeded. Please wait a moment and try again.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        } else if (status === 500 || status === 503) {
          this.logger.error('⚠️ Server Error - Gemini service issue');
          throw new HttpException(
            `Gemini AI service is currently experiencing issues: ${errorMessage}. Please try again later or contact support.`,
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        } else {
          throw new HttpException(
            `Gemini API error: ${errorMessage}`,
            status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.metrics.lastError = errorMessage;
        this.metrics.errorsByType['unknown'] = (this.metrics.errorsByType['unknown'] || 0) + 1;
        throw new HttpException(
          `Failed to get response from Gemini AI service: ${errorMessage}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  /**
   * Health check for Gemini API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testMessages: GeminiChatMessage[] = [
        { role: 'user', content: 'Say "OK" if you can read this.' },
      ];
      const response = await this.chatCompletion(testMessages, {
        temperature: 0.1,
        max_tokens: 10,
      });
      return response.toLowerCase().includes('ok');
    } catch (error) {
      this.logger.warn('Gemini health check failed:', error);
      return false;
    }
  }

  /**
   * Validates Gemini API response structure
   */
  private validateGeminiResponse(
    response: { data: GeminiGenerateContentResponse },
  ): { isValid: boolean; error?: string; content?: string } {
    if (!response.data) {
      return { isValid: false, error: 'Response data is missing' };
    }

    if (!response.data.candidates || response.data.candidates.length === 0) {
      return { isValid: false, error: 'No candidates in response' };
    }

    const candidate = response.data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      return { isValid: false, error: 'No content parts in candidate' };
    }

    const textPart = candidate.content.parts.find(part => part.text);
    if (!textPart || !textPart.text) {
      return { isValid: false, error: 'No text content in candidate parts' };
    }

    return { isValid: true, content: textPart.text };
  }

  /**
   * Parses and cleans the Gemini response to remove reasoning tags if any.
   */
  private parseAndCleanResponse(content: string): string {
    // Gemini doesn't typically include reasoning tags, but we'll clean any potential artifacts
    let cleaned = content.trim();

    // Remove any potential reasoning tags (if Gemini adds them in the future)
    cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

    return cleaned.trim();
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<{ data: T }>,
    retriesLeft: number = this.maxRetries,
  ): Promise<{ data: T }> {
    try {
      return await requestFn();
    } catch (error) {
      if (retriesLeft <= 0) {
        throw error;
      }

      // Check if it's a rate limit error
      if (error instanceof AxiosError && error.response?.status === 429) {
        this.logger.debug('Rate limit error detected, will retry');
        const delay = this.retryDelay * (this.maxRetries - retriesLeft + 1);
        this.logger.warn(`Retrying request after ${delay}ms (${retriesLeft} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retriesLeft - 1);
      }

      // For other errors, don't retry
      throw error;
    }
  }

  /**
   * Get service info
   */
  getServiceInfo(): {
    model: string;
    baseUrl: string;
    apiKeyConfigured: boolean;
  } {
    return {
      model: this.defaultModel,
      baseUrl: this.baseUrl,
      apiKeyConfigured: !!this.apiKey,
    };
  }

  /**
   * Get metrics
   */
  getMetrics(): ApiMetrics {
    return { ...this.metrics };
  }
}

