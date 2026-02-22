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
export class SambaNovaClientService {
  private readonly logger = new Logger(SambaNovaClientService.name);
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
    this.apiKey = this.configService.get<string>('SAMBANOVA_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('SAMBANOVA_BASE_URL') ||
      'https://api.sambanova.ai/v1';
    // Allow model to be configured via environment variable, with fallback
    // Supported models for SambaNova Cloud:
    // - Meta-Llama-3.1-8B-Instruct (recommended for chat/instruction following)
    // - Meta-Llama-3.1-70B-Instruct (larger, more capable)
    // - Meta-Llama-3.2-1B-Instruct (smaller, faster)
    // - Meta-Llama-3.2-3B-Instruct (balanced)
    // Note: Model names may vary by API key access level
    this.defaultModel =
      this.configService.get<string>('SAMBANOVA_MODEL') ||
      'Meta-Llama-3.1-8B-Instruct';

    // Log model configuration
    if (this.configService.get<string>('SAMBANOVA_MODEL')) {
      this.logger.log(
        `✅ SambaNova Model: ${this.defaultModel} (from SAMBANOVA_MODEL env var)`,
      );
      
      // Check if model is a known problematic one
      if (this.defaultModel.toLowerCase().includes('allam')) {
        this.logger.warn(
          `⚠️ Warning: "${this.defaultModel}" is an Arabic language model and may not work well for English conversations.`,
        );
        this.logger.warn(
          `⚠️ Recommended models: Meta-Llama-3.1-8B-Instruct, Meta-Llama-3.1-70B-Instruct, Meta-Llama-3.2-1B-Instruct`,
        );
      }
    } else {
      this.logger.log(`✅ SambaNova Model: ${this.defaultModel} (default)`);
      this.logger.warn(
        `⚠️ Using default model. Set SAMBANOVA_MODEL env var to use a different model.`,
      );
    }

    // Validate API key presence and format
    if (!this.apiKey) {
      this.logger.warn(
        '⚠️ SAMBANOVA_API_KEY not found in environment variables',
      );
      this.logger.warn(
        '⚠️ Chatbot functionality will be unavailable without a valid API key',
      );
    } else {
      // Basic format validation - API keys are typically at least 20 characters
      if (this.apiKey.length < 10) {
        this.logger.warn(
          `⚠️ SAMBANOVA_API_KEY appears to be too short (${this.apiKey.length} chars). This may be invalid.`,
        );
      } else {
        this.logger.log(
          `✅ SambaNova API key configured (length: ${this.apiKey.length})`,
        );
      }

      // Mask API key for logging (show first 4 and last 4 chars)
      const maskedKey =
        this.apiKey.length > 8
          ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}`
          : '***';
      this.logger.debug(`SambaNova API Key: ${maskedKey}`);
    }

    // Validate base URL format
    if (this.baseUrl && !this.baseUrl.startsWith('http')) {
      this.logger.warn(
        `⚠️ SAMBANOVA_BASE_URL may be invalid (does not start with http): ${this.baseUrl}`,
      );
    } else {
      this.logger.log(`✅ SambaNova Base URL: ${this.baseUrl}`);
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `SambaNova API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        // Log request payload for POST requests
        if (config.method?.toUpperCase() === 'POST' && config.data) {
          this.logger.log(
            `SambaNova Request Payload: ${JSON.stringify(config.data, null, 2)}`,
          );
        }
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
        // Log full response for debugging
        if (response.data) {
          this.logger.log(
            `SambaNova Response Data: ${JSON.stringify(response.data, null, 2)}`,
          );
        }
        return response;
      },
      (error: AxiosError) => {
        this.logger.error('SambaNova API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
          },
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

    // Validate messages array
    if (!messages || messages.length === 0) {
      throw new HttpException(
        'Messages array cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate first message is system message
    if (messages[0].role !== 'system') {
      this.logger.warn('⚠️ First message is not a system message, this may cause API errors');
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

    const request: SambaNovaChatRequest = {
      model: options?.model || this.defaultModel,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 1000,
      stream: false,
    };

    // Log full request details
    this.logger.log('=== SambaNova Chat Completion Request ===');
    this.logger.log(`Endpoint: ${this.baseUrl}/chat/completions`);
    this.logger.log(`Model: ${request.model}`);
    this.logger.log(`Messages count: ${messages.length}`);
    this.logger.log(`Message roles: ${messages.map(m => m.role).join(', ')}`);
    this.logger.log(`Full request: ${JSON.stringify(request, null, 2)}`);

    // Track metrics
    this.metrics.totalRequests++;
    const startTime = Date.now();

    try {
      const response = await this.retryRequest<SambaNovaChatResponse>(() =>
        this.axiosInstance.post('/chat/completions', request),
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
      if (response.data.usage) {
        this.metrics.totalTokensUsed += response.data.usage.total_tokens;
      }

      // Log full response
      this.logger.log('=== SambaNova Chat Completion Response ===');
      this.logger.log(`Response ID: ${response.data?.id || 'unknown'}`);
      this.logger.log(`Choices count: ${response.data?.choices?.length || 0}`);
      this.logger.log(`Response time: ${Date.now() - startTime}ms`);
      this.logger.log(
        `Full response: ${JSON.stringify(response.data, null, 2)}`,
      );

      // Validate response structure
      const validation = this.validateSambaNovaResponse(response);
      if (!validation.isValid) {
        this.logger.error(
          `SambaNova API response validation failed: ${validation.error}`,
        );
        this.logger.error(
          `Response structure: ${JSON.stringify(response.data, null, 2)}`,
        );
        throw new HttpException(
          `Invalid response from SambaNova API: ${validation.error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Extract content with validation
      let content = validation.content!;
      this.logger.log(
        `SambaNova API response received (tokens: ${response.data.usage?.total_tokens || 'unknown'})`,
      );
      this.logger.debug(
        `Raw content length: ${content.length}, preview: ${content.substring(0, 100)}...`,
      );

      // Parse and clean the response to remove reasoning tags
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
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      this.metrics.lastErrorTime = new Date();

      // Enhanced error logging
      this.logger.error('=== SambaNova API Chat Completion Error ===');
      this.logger.error('Error type:', error?.constructor?.name);
      this.logger.error(
        'Error message:',
        error instanceof Error ? error.message : String(error),
      );
      this.logger.error(`Request time before error: ${Date.now() - startTime}ms`);

      // Check if it's an AxiosError with response
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        const errorData = axiosError.response?.data as any;
        const status = axiosError.response?.status;

        // Extract error message
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : (errorData && typeof errorData === 'object' && ('error' in errorData || 'message' in errorData))
            ? (errorData as any).error || (errorData as any).message || 'Unknown error'
            : 'Unknown error';

        // Track error by type
        const errorType = `${status}_${axiosError.response?.statusText || 'UNKNOWN'}`;
        this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;

        this.logger.error('Axios error details:', {
          status,
          statusText: axiosError.response?.statusText,
          data: errorData,
          errorMessage,
        });

        // Check for specific error messages
        if (status === 404) {
          const errorMessage = typeof errorData === 'string'
            ? errorData
            : (errorData && typeof errorData === 'object' && ('error' in errorData || 'message' in errorData))
              ? (errorData as any).error || (errorData as any).message || 'Resource not found'
              : 'Resource not found';
          if (
            errorMessage.includes('Model not found') ||
            errorMessage.includes('model')
          ) {
            this.logger.error(
              `⚠️ Model "${request.model}" not found in SambaNova API`,
            );
            this.logger.error('⚠️ Please check:');
            this.logger.error(
              '   1. The model name is correct for your SambaNova account',
            );
            this.logger.error('   2. You have access to this model');
            this.logger.error(
              `   3. Set SAMBANOVA_MODEL environment variable to a valid model name`,
            );
            this.logger.error(
              `   4. Current model being used: "${request.model}"`,
            );
            throw new HttpException(
              `SambaNova model "${request.model}" not found. Please check your model configuration or set SAMBANOVA_MODEL environment variable.`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }

        // Check for authentication errors
        if (status === 401 || status === 403) {
          this.logger.error('⚠️ SambaNova API authentication failed');
          this.logger.error('⚠️ Please check your SAMBANOVA_API_KEY');
          throw new HttpException(
            'SambaNova API authentication failed. Please check your API key.',
            HttpStatus.UNAUTHORIZED,
          );
        }

        // Check for 500 errors - provide detailed analysis
        if (status === 500) {
          const errorMessage = typeof errorData === 'string' 
            ? errorData 
            : (errorData && typeof errorData === 'object' && ('error' in errorData || 'message' in errorData))
              ? (errorData as any).error || (errorData as any).message || 'Unknown error'
              : 'Unknown error';
          
          this.logger.error('=== SambaNova API 500 Error Analysis ===');
          this.logger.error(`Error message: ${errorMessage}`);
          this.logger.error('Possible causes:');
          this.logger.error('  1. SambaNova API service is experiencing issues');
          this.logger.error('  2. Model configuration issue (check SAMBANOVA_MODEL env var)');
          this.logger.error('  3. Request format issue (check request payload)');
          this.logger.error('  4. API quota/rate limit exceeded');
          this.logger.error(`Current model: ${request.model}`);
          this.logger.error(`Request had ${request.messages.length} messages`);
          this.logger.error('This error is NOT being retried to avoid wasting tokens.');
          
          // Provide user-friendly error message
          throw new HttpException(
            `SambaNova AI service is currently experiencing issues: ${errorMessage}. Please try again later or contact support.`,
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }

      if (error instanceof HttpException) {
        this.logger.error('SambaNova API HttpException:', {
          status: error.getStatus(),
          message: error.message,
          response: error.getResponse(),
        });
        throw error;
      }

      if (error instanceof Error && error.stack) {
        this.logger.error('Error stack:', error.stack);
      }
      this.logger.error(
        'Full error object:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );

      // Provide user-friendly error message
      let userMessage = 'Failed to get response from SambaNova AI service';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const errorData = axiosError.response?.data as any;
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : (errorData && typeof errorData === 'object' && ('error' in errorData || 'message' in errorData))
            ? errorData.error || errorData.message || 'Unknown error'
            : 'Unknown error';
        
        if (status === 500) {
          userMessage = 'SambaNova AI service is currently experiencing issues. Please try again later or contact support.';
        } else if (status === 429) {
          userMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (status === 401 || status === 403) {
          userMessage = 'Authentication failed. Please check your API configuration.';
        } else if (errorMessage) {
          userMessage = `SambaNova API error: ${errorMessage}`;
        }
      }

      throw new HttpException(
        userMessage,
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
   * Validates SambaNova API response structure
   * @param response - The response object from SambaNova API
   * @returns Object with validation result and extracted content, or null if invalid
   */
  private validateSambaNovaResponse(
    response: { data: SambaNovaChatResponse },
  ): { isValid: boolean; content?: string; error?: string } {
    try {
      // Check if response.data exists
      if (!response || !response.data) {
        return {
          isValid: false,
          error: 'Response data is missing',
        };
      }

      const data = response.data;

      // Check if choices array exists and has items
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        return {
          isValid: false,
          error: 'Response choices array is missing or empty',
        };
      }

      // Check if first choice exists
      const firstChoice = data.choices[0];
      if (!firstChoice) {
        return {
          isValid: false,
          error: 'First choice in response is missing',
        };
      }

      // Check if message exists
      if (!firstChoice.message) {
        return {
          isValid: false,
          error: 'Message in response choice is missing',
        };
      }

      // Check if content exists
      if (firstChoice.message.content === undefined || firstChoice.message.content === null) {
        return {
          isValid: false,
          error: 'Content in response message is missing or null',
        };
      }

      // Validate content is a string
      if (typeof firstChoice.message.content !== 'string') {
        return {
          isValid: false,
          error: `Content in response message is not a string (type: ${typeof firstChoice.message.content})`,
        };
      }

      return {
        isValid: true,
        content: firstChoice.message.content,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Error validating response: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Parses and cleans the SambaNova response to remove reasoning tags.
   * Removes tags like <think>, <think>, <reasoning>, etc.
   * Returns only the actual assistant response content.
   */
  private parseAndCleanResponse(rawContent: string | null | undefined): string {
    // Validate input
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

    // Remove reasoning tags (case-insensitive, handles various formats)
    // Pattern matches: <tag>...</tag>
    const reasoningTagPatterns = [
      /<think>[\s\S]*?<\/redacted_reasoning>/gi,
      /<think>[\s\S]*?<\/think>/gi,
      /<reasoning>[\s\S]*?<\/reasoning>/gi,
      /<internal_reasoning>[\s\S]*?<\/internal_reasoning>/gi,
      /<scratchpad>[\s\S]*?<\/scratchpad>/gi,
    ];

    for (const pattern of reasoningTagPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Remove any remaining XML/HTML-like tags that might be reasoning tags
    // This catches any <tag>content</tag> patterns that might be missed
    cleaned = cleaned.replace(/<[^>]+>[\s\S]*?<\/[^>]+>/gi, (match) => {
      // Only remove if it looks like a reasoning tag (not a standard HTML tag)
      const tagMatch = /<([^>\s]+)/.exec(match);
      const tagName = tagMatch?.[1]?.toLowerCase();
      if (
        tagName &&
        ['reasoning', 'think', 'scratchpad', 'internal', 'redacted'].some(
          (keyword) => tagName.includes(keyword),
        )
      ) {
        return '';
      }
      return match; // Keep other tags
    });

    // Clean up extra whitespace (multiple newlines, spaces)
    cleaned = cleaned
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .trim();

    // If after cleaning we have no content, return the original (fallback)
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
      // Check if error is retryable
      const isRetryable = this.isRetryableError(error);
      
      if (!isRetryable) {
        // Log why we're not retrying
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;
          const errorData = axiosError.response?.data as any;
          const errorMessage = typeof errorData === 'string' 
            ? errorData 
            : (errorData && typeof errorData === 'object' && ('error' in errorData || 'message' in errorData))
              ? errorData.error || errorData.message || 'Unknown error'
              : 'Unknown error';
          
          this.logger.error(
            `Not retrying request due to non-retryable error (${status}): ${errorMessage}`,
          );
          this.logger.error(
            'This appears to be a persistent API issue. Please check your SambaNova API configuration or contact support.',
          );
        }
        throw error;
      }

      // For 5xx errors, only retry once to avoid wasting tokens
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        
        if (status && status >= 500 && retries < this.maxRetries - 1) {
          // Already retried once for 5xx error, don't retry again
          this.logger.error(
            `5xx error persisted after retry. Not retrying again to avoid wasting tokens. Status: ${status}`,
          );
          throw error;
        }
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

  /**
   * Check if error is retryable
   * Only retries on transient network errors and rate limits, NOT on API errors (500)
   */
  private isRetryableError(error: any): boolean {
    // Network errors (no response) are retryable - these are transient
    if (!error.response) {
      this.logger.debug('Network error detected, will retry');
      return true;
    }

    const status = error.response.status;
    const errorData = error.response.data;

    // Check for rate limiting (429) - these are retryable
    if (status === 429) {
      this.logger.debug('Rate limit error detected, will retry');
      return true;
    }

    // For 500 errors, check if it's a persistent API error
    if (status >= 500) {
      // Check error message to determine if it's a persistent API issue
      const errorData = error.response?.data as any;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : (errorData && typeof errorData === 'object' && ('error' in errorData || 'message' in errorData))
          ? errorData.error || errorData.message || ''
          : '';
      
      // If error message indicates a persistent API issue, don't retry
      if (
        errorMessage.includes('Unknown error when running prediction service') ||
        errorMessage.includes('Something went wrong') ||
        errorMessage.includes('prediction service')
      ) {
        this.logger.error(
          `Persistent API error detected (${status}): ${errorMessage}. Not retrying to avoid wasting tokens.`,
        );
        return false;
      }

      // For other 5xx errors, only retry once (not multiple times)
      // This handles transient server issues but avoids wasting tokens on persistent errors
      this.logger.warn(
        `Server error ${status} detected. Will retry once, but if it persists, it's likely an API issue.`,
      );
      // Only retry 5xx errors once (when retries > 1, meaning first retry attempt)
      // This is handled by checking retries in retryRequest
      return true;
    }

    // Don't retry on 4xx errors (client errors) - these won't be fixed by retrying
    if (status >= 400 && status < 500) {
      this.logger.debug(`Client error ${status} detected, not retrying`);
      return false;
    }

    // Default: don't retry unknown errors
    return false;
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

  /**
   * Get API metrics for monitoring
   */
  getMetrics(): ApiMetrics {
    return {
      ...this.metrics,
      // Calculate success rate
      successRate: this.metrics.totalRequests > 0 
        ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
        : 0,
    } as ApiMetrics & { successRate: number };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
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
