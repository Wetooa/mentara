import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

interface SambaNovaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SambaNovaChatRequest {
  model: string;
  messages: SambaNovaChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface SambaNovaChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: SambaNovaChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class SambaNovaClientService {
  private readonly logger = new Logger(SambaNovaClientService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultModel: string = 'meta-llama/Meta-Llama-3.1-8B-Instruct';
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('SAMBANOVA_API_KEY') || '';
    this.baseUrl = this.configService.get<string>('SAMBANOVA_BASE_URL') || 'https://api.sambanova.ai/v1';

    if (!this.apiKey) {
      this.logger.warn('SAMBANOVA_API_KEY not found in environment variables');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`SambaNova API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('SambaNova API Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`SambaNova API Response: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        this.logger.error('SambaNova API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Send a chat completion request to SambaNova API
   */
  async chatCompletion(
    messages: SambaNovaChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException(
        'SambaNova API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const request: SambaNovaChatRequest = {
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1000,
      stream: false,
    };

    try {
      const response = await this.retryRequest<SambaNovaChatResponse>(
        () => this.axiosInstance.post('/chat/completions', request),
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new HttpException(
          'No response from SambaNova API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const content = response.data.choices[0].message.content;
      this.logger.log(
        `SambaNova API response received (tokens: ${response.data.usage.total_tokens})`,
      );

      return content;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error('SambaNova API chat completion failed:', error);
      throw new HttpException(
        'Failed to get response from AI service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for SambaNova API
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      // Simple test request with minimal tokens
      const testMessages: SambaNovaChatMessage[] = [
        { role: 'user', content: 'Hello' },
      ];

      await this.chatCompletion(testMessages, {
        max_tokens: 10,
        temperature: 0.1,
      });

      return true;
    } catch (error) {
      this.logger.warn('SambaNova health check failed:', error);
      return false;
    }
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<{ data: T }>,
    retries = this.maxRetries,
  ): Promise<{ data: T }> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        const delay = this.retryDelay * (this.maxRetries - retries + 1);
        this.logger.warn(
          `Retrying request after ${delay}ms (${retries} retries left)`,
        );
        await this.sleep(delay);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error.response) {
      // Network errors are retryable
      return true;
    }

    const status = error.response.status;
    // Retry on 5xx errors and rate limits
    return status >= 500 || status === 429;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get service info
   */
  getServiceInfo(): {
    baseUrl: string;
    model: string;
    hasApiKey: boolean;
  } {
    return {
      baseUrl: this.baseUrl,
      model: this.defaultModel,
      hasApiKey: !!this.apiKey,
    };
  }
}

