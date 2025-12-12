import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Simple in-memory rate limiting guard
 * For production, consider using @nestjs/throttler or Redis-based solution
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);

    const now = Date.now();
    const record = this.store[key];

    // Clean up expired entries
    this.cleanup(now);

    if (!record || now > record.resetTime) {
      // Create new window
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    if (record.count >= this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for ${key}`);
      throw new HttpException(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          errors: [
            {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Rate limit exceeded. Maximum ${this.maxRequests} requests per ${this.windowMs / 1000} seconds.`,
            },
          ],
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }

  private getKey(request: Request): string {
    // Use IP address or user ID if authenticated
    const userId = (request as Request & { user?: { id?: string } }).user?.id;
    return userId || request.ip || 'anonymous';
  }

  private cleanup(now: number): void {
    // Clean up expired entries periodically
    if (Math.random() < 0.1) {
      // 10% chance to cleanup
      Object.keys(this.store).forEach((key) => {
        if (now > this.store[key].resetTime) {
          delete this.store[key];
        }
      });
    }
  }
}


