import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  IsArray, 
  IsNumber, 
  validateSync, 
  Min, 
  Max, 
  ArrayMinSize, 
  ArrayMaxSize 
} from 'class-validator';

// DTO for AI service input validation
class AiPredictionInputDto {
  @IsArray()
  @ArrayMinSize(201, { message: 'Input array must contain exactly 201 values' })
  @ArrayMaxSize(201, { message: 'Input array must contain exactly 201 values' })
  @IsNumber({}, { each: true, message: 'All values must be numbers' })
  @Min(0, { each: true, message: 'All values must be non-negative' })
  @Max(10, { each: true, message: 'All values must be 10 or less' })
  inputs!: number[];
}

export interface AiPredictionResult {
  success: boolean;
  predictions?: Record<string, boolean>;
  error?: string;
  responseTime?: number;
}

@Injectable()
export class AiServiceClient {
  private readonly logger = new Logger(AiServiceClient.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly maxRetries: number = 3;
  private readonly timeoutMs: number = 30000; // 30 seconds
  private readonly baseURL: string;
  private requestCount = 0;
  private readonly maxRequestsPerMinute = 60; // Rate limiting
  private lastResetTime = Date.now();

  constructor(private readonly configService: ConfigService) {
    // Get AI service URL from environment with fallback
    this.baseURL = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:5000';
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mentara-API/1.0',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making AI service request to ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('AI service request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.debug(`AI service response received: ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error('AI service response error:', error?.response?.status || error.message);
        return Promise.reject(error);
      }
    );
  }

  private validateInput(flatAnswers: number[]): boolean {
    const inputDto = new AiPredictionInputDto();
    inputDto.inputs = flatAnswers;

    const errors = validateSync(inputDto);
    
    if (errors.length > 0) {
      this.logger.warn('AI service input validation failed:', errors.map(e => e.toString()));
      return false;
    }
    
    return true;
  }

  private isRateLimited(): boolean {
    const now = Date.now();
    
    // Reset counter every minute
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    
    if (this.requestCount >= this.maxRequestsPerMinute) {
      this.logger.warn('AI service rate limit exceeded');
      return true;
    }
    
    this.requestCount++;
    return false;
  }

  private sanitizeInput(flatAnswers: number[]): number[] {
    // Sanitize input values to prevent injection attacks
    return flatAnswers.map(value => {
      // Ensure value is a finite number
      if (!Number.isFinite(value)) {
        this.logger.warn(`Invalid value detected: ${value}, replacing with 0`);
        return 0;
      }
      
      // Clamp values to expected range
      return Math.max(0, Math.min(10, Math.round(value * 100) / 100)); // Round to 2 decimal places
    });
  }

  async predict(flatAnswers: number[]): Promise<AiPredictionResult> {
    const startTime = Date.now();
    
    try {
      // Rate limiting check
      if (this.isRateLimited()) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }

      // Input validation
      if (!this.validateInput(flatAnswers)) {
        return {
          success: false,
          error: 'Invalid input data for AI prediction',
        };
      }

      // Sanitize input
      const sanitizedInput = this.sanitizeInput(flatAnswers);

      // Make the prediction with retry logic
      const result = await this.makeRequestWithRetry(sanitizedInput);
      
      const responseTime = Date.now() - startTime;
      this.logger.log(`AI prediction completed in ${responseTime}ms`);

      return {
        success: true,
        predictions: result,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`AI prediction failed after ${responseTime}ms:`, error);
      
      return {
        success: false,
        error: this.getErrorMessage(error),
        responseTime,
      };
    }
  }

  private async makeRequestWithRetry(
    sanitizedInput: number[], 
    attempt: number = 1
  ): Promise<Record<string, boolean>> {
    try {
      const response = await this.axiosInstance.post('/predict', {
        inputs: sanitizedInput,
      });

      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from AI service');
      }

      return response.data as Record<string, boolean>;

    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error)) {
        this.logger.warn(`AI service request failed (attempt ${attempt}/${this.maxRetries}), retrying...`);
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.makeRequestWithRetry(sanitizedInput, attempt + 1);
      }
      
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      // Retry on network errors, timeouts, and 5xx server errors
      return !error.response || 
             error.response.status >= 500 || 
             error.code === 'ECONNRESET' ||
             error.code === 'ETIMEDOUT';
    }
    return false;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNREFUSED') {
        return 'AI service is currently unavailable';
      }
      if (error.code === 'ETIMEDOUT') {
        return 'AI service request timed out';
      }
      if (error.response?.status === 400) {
        return 'Invalid request to AI service';
      }
      if (error.response?.status === 429) {
        return 'AI service rate limit exceeded';
      }
      if (error.response?.status && error.response.status >= 500) {
        return 'AI service internal error';
      }
    }
    
    return 'Unknown error occurred while contacting AI service';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      this.logger.warn('AI service health check failed:', error);
      return false;
    }
  }

  getServiceInfo(): { baseURL: string; timeout: number; maxRetries: number } {
    return {
      baseURL: this.baseURL,
      timeout: this.timeoutMs,
      maxRetries: this.maxRetries,
    };
  }
}