import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OllamaChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OllamaChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
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
export class OllamaClientService {
  private readonly logger = new Logger(OllamaClientService.name);
  private readonly baseUrl: string;
  private readonly axiosInstance: AxiosInstance;
  private readonly defaultModel: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;
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
    this.baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      'http://localhost:11434';
    this.defaultModel =
      this.configService.get<string>('OLLAMA_MODEL') ||
      'deepseek-r1:1.5b';

    this.logger.log(`✅ Ollama Base URL: ${this.baseUrl}`);
    this.logger.log(`✅ Ollama Model: ${this.defaultModel}`);

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 120 seconds - local models can be slower
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Ollama API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        this.logger.error('Ollama API Request Error:', error);
        return Promise.reject(error);
      },
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`Ollama API Response: ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        this.logger.error('Ollama API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Send a chat completion request to Ollama API (OpenAI-compatible endpoint)
   */
  async chatCompletion(
    messages: OllamaChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<string> {
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
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        this.logger.error(`⚠️ Message at index ${i} has invalid role: ${msg.role}`);
        throw new HttpException(
          `Message at index ${i} has invalid role: ${msg.role}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const request: OllamaChatRequest = {
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2000,
      stream: false,
    };

    this.logger.log('=== Ollama Chat Completion Request ===');
    this.logger.log(`Endpoint: ${this.baseUrl}/v1/chat/completions`);
    this.logger.log(`Model: ${request.model}`);
    this.logger.log(`Messages count: ${messages.length}`);
    this.logger.log(`Message roles: ${messages.map(m => m.role).join(', ')}`);

    this.metrics.totalRequests++;
    const startTime = Date.now();

    try {
      const response = await this.retryRequest<OllamaChatResponse>(() =>
        this.axiosInstance.post('/v1/chat/completions', request),
      );

      const responseTime = Date.now() - startTime;
      this.metrics.successfulRequests++;
      this.responseTimes.push(responseTime);
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift();
      }
      this.metrics.averageResponseTime =
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

      if (response.data.usage) {
        this.metrics.totalTokensUsed += response.data.usage.total_tokens;
      }

      this.logger.log('=== Ollama Chat Completion Response ===');
      this.logger.log(`Response ID: ${response.data?.id || 'unknown'}`);
      this.logger.log(`Choices count: ${response.data?.choices?.length || 0}`);
      this.logger.log(`Response time: ${responseTime}ms`);

      // Validate response structure
      const validation = this.validateOllamaResponse(response);
      if (!validation.isValid) {
        this.logger.error(
          `Ollama API response validation failed: ${validation.error}`,
        );
        throw new HttpException(
          `Invalid response from Ollama API: ${validation.error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let content = validation.content!;
      this.logger.log(
        `Ollama API response received (tokens: ${response.data.usage?.total_tokens || 'unknown'})`,
      );

      // Parse and clean the response to remove DeepSeek reasoning tags
      try {
        content = this.parseAndCleanResponse(content);
      } catch (parseError) {
        this.logger.error(
          `Error parsing/cleaning response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        );
        content = validation.content!;
      }

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
      this.metrics.failedRequests++;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      this.metrics.lastErrorTime = new Date();

      this.logger.error('=== Ollama API Chat Completion Error ===');
      this.logger.error('Error type:', error?.constructor?.name);
      this.logger.error(
        'Error message:',
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(`Request time before error: ${Date.now() - startTime}ms`);

      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const errorData = error.response?.data as any;
        const errorMessage = typeof errorData === 'string'
          ? errorData
          : errorData?.error?.message || errorData?.error || error.message || 'Unknown error';

        const errorType = `${status}_${error.response?.statusText || 'UNKNOWN'}`;
        this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;

        if (error.code === 'ECONNREFUSED') {
          this.logger.error('⚠️ Ollama server is not running');
          this.logger.error('⚠️ Please start Ollama with: ollama serve');
          throw new HttpException(
            'Ollama server is not running. Please start it with: ollama serve',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        if (status === 404) {
          this.logger.error(`⚠️ Model "${request.model}" not found`);
          this.logger.error('⚠️ Please pull the model with: ollama pull ' + request.model);
          throw new HttpException(
            `Ollama model "${request.model}" not found. Please pull it with: ollama pull ${request.model}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (status === 500) {
          throw new HttpException(
            `Ollama service error: ${errorMessage}. Please check Ollama logs.`,
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        throw new HttpException(
          `Ollama API error: ${errorMessage}`,
          status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to get response from Ollama service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for Ollama API
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if Ollama server is running
      const response = await this.axiosInstance.get('/api/tags', {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      this.logger.warn('Ollama health check failed:', error);
      return false;
    }
  }

  /**
   * Validates Ollama API response structure
   */
  private validateOllamaResponse(
    response: { data: OllamaChatResponse },
  ): { isValid: boolean; content?: string; error?: string } {
    try {
      if (!response || !response.data) {
        return { isValid: false, error: 'Response data is missing' };
      }

      const data = response.data;

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        return { isValid: false, error: 'Response choices array is missing or empty' };
      }

      const firstChoice = data.choices[0];
      if (!firstChoice) {
        return { isValid: false, error: 'First choice in response is missing' };
      }

      if (!firstChoice.message) {
        return { isValid: false, error: 'Message in response choice is missing' };
      }

      if (firstChoice.message.content === undefined || firstChoice.message.content === null) {
        return { isValid: false, error: 'Content in response message is missing or null' };
      }

      if (typeof firstChoice.message.content !== 'string') {
        return {
          isValid: false,
          error: `Content in response message is not a string (type: ${typeof firstChoice.message.content})`,
        };
      }

      return { isValid: true, content: firstChoice.message.content };
    } catch (error) {
      return {
        isValid: false,
        error: `Error validating response: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Parses and cleans the response to remove DeepSeek reasoning tags.
   * DeepSeek-R1 models output reasoning in <think>...</think> tags.
   */
  private parseAndCleanResponse(rawContent: string | null | undefined): string {
    if (rawContent === null || rawContent === undefined) {
      this.logger.warn('parseAndCleanResponse received null or undefined content');
      return '';
    }

    if (typeof rawContent !== 'string') {
      this.logger.warn(
        `parseAndCleanResponse received non-string content (type: ${typeof rawContent})`,
      );
      return String(rawContent || '');
    }

    if (!rawContent.trim()) {
      this.logger.debug('parseAndCleanResponse received empty or whitespace-only content');
      return '';
    }

    let cleaned = rawContent;

    // Remove DeepSeek reasoning tags (various formats)
    const reasoningTagPatterns = [
      /<think>[\s\S]*?<\/think>/gi,
      /<thinking>[\s\S]*?<\/thinking>/gi,
      /<reasoning>[\s\S]*?<\/reasoning>/gi,
      /<internal_reasoning>[\s\S]*?<\/internal_reasoning>/gi,
      /<scratchpad>[\s\S]*?<\/scratchpad>/gi,
      /<reflection>[\s\S]*?<\/reflection>/gi,
    ];

    for (const pattern of reasoningTagPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Clean up extra whitespace
    cleaned = cleaned
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // If after cleaning we have no content, return the original
    if (!cleaned || cleaned.length < 10) {
      this.logger.warn(
        'Parsed response is empty or too short, returning original content',
      );
      return rawContent.trim();
    }

    return cleaned;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<{ data: T }>,
    retries = this.maxRetries,
  ): Promise<{ data: T }> {
    try {
      return await requestFn();
    } catch (error) {
      if (!this.isRetryableError(error)) {
        throw error;
      }

      if (retries > 0) {
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

  private isRetryableError(error: any): boolean {
    if (!error.response) {
      // Network errors except connection refused (Ollama not running)
      if (error.code === 'ECONNREFUSED') {
        return false;
      }
      return true;
    }

    const status = error.response.status;

    // Retry on rate limits and server errors
    if (status === 429 || (status >= 500 && status < 600)) {
      return true;
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get service info
   */
  getServiceInfo(): {
    baseUrl: string;
    model: string;
  } {
    return {
      baseUrl: this.baseUrl,
      model: this.defaultModel,
    };
  }

  /**
   * Get API metrics for monitoring
   */
  getMetrics(): ApiMetrics {
    return {
      ...this.metrics,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics.totalRequests = 0;
    this.metrics.successfulRequests = 0;
    this.metrics.failedRequests = 0;
    this.metrics.totalTokensUsed = 0;
    this.metrics.averageResponseTime = 0;
    this.metrics.lastError = null;
    this.metrics.lastErrorTime = null;
    this.metrics.errorsByType = {};
    this.responseTimes = [];
    this.logger.log('Metrics reset');
  }
}

