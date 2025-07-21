import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface ClientRequest {
  count: number;
  resetTime: number;
  successCount: number;
  failedCount: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private clients = new Map<string, ClientRequest>();
  private readonly configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Configure different rate limits for different endpoints
    this.configs.set('auth', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
      message: 'Too many authentication attempts, please try again later',
    });

    this.configs.set('api', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 300, // Increased for better user experience
      message: 'Too many requests, please try again later',
    });

    this.configs.set('community', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 250, // Higher limit for community interactions
      message: 'Too many community requests, please try again in a moment',
    });

    this.configs.set('upload', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      message: 'Too many upload requests, please try again later',
    });

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const clientKey = this.getClientKey(req);
    const configKey = this.getConfigKey(req);
    const config = this.configs.get(configKey) || this.configs.get('api')!;

    const now = Date.now();
    let client = this.clients.get(clientKey);

    if (!client || now > client.resetTime) {
      client = {
        count: 0,
        resetTime: now + config.windowMs,
        successCount: 0,
        failedCount: 0,
      };
      this.clients.set(clientKey, client);
    }

    // Check if request should be counted
    const shouldCount = this.shouldCountRequest(req, config);

    if (shouldCount) {
      client.count++;

      if (client.count > config.maxRequests) {
        // Add rate limit headers
        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(client.resetTime / 1000).toString(),
          'Retry-After': Math.ceil((client.resetTime - now) / 1000).toString(),
        });

        throw new HttpException(
          {
            error: 'Too Many Requests',
            message: config.message,
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // Add rate limit headers for successful requests
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(
        0,
        config.maxRequests - client.count,
      ).toString(),
      'X-RateLimit-Reset': Math.ceil(client.resetTime / 1000).toString(),
    });

    // Track response status for adaptive rate limiting
    const originalSend = res.send;
    res.send = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        client.successCount++;
      } else if (res.statusCode >= 400) {
        client.failedCount++;
      }
      return originalSend.call(this, body);
    };

    next();
  }

  private getClientKey(req: Request): string {
    // Use user ID if authenticated, otherwise fall back to IP
    const userId = req['userId'];
    if (userId) {
      return `user:${userId}`;
    }

    // Get IP address, handling proxy headers
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';

    return `ip:${ip}`;
  }

  private getConfigKey(req: Request): string {
    const path = req.path;

    if (path.startsWith('/auth')) {
      return 'auth';
    }

    if (path.startsWith('/communities') || path.includes('/community')) {
      return 'community';
    }

    if (
      path.includes('/upload') ||
      (req.method === 'POST' &&
        (path.includes('/files') || path.includes('/worksheets')))
    ) {
      return 'upload';
    }

    return 'api';
  }

  private shouldCountRequest(req: Request, config: RateLimitConfig): boolean {
    if (config.skipSuccessfulRequests || config.skipFailedRequests) {
      // This is a simplified check - in practice, you'd need to implement
      // more sophisticated logic based on response status
      return true;
    }
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, client] of this.clients.entries()) {
      if (now > client.resetTime) {
        this.clients.delete(key);
      }
    }
  }

  // Method to adjust rate limits dynamically
  public adjustRateLimit(
    endpoint: string,
    config: Partial<RateLimitConfig>,
  ): void {
    const existing = this.configs.get(endpoint);
    if (existing) {
      this.configs.set(endpoint, { ...existing, ...config });
    }
  }

  // Method to get current stats for monitoring
  public getStats(): { activeClients: number; totalRequests: number } {
    let totalRequests = 0;
    for (const client of this.clients.values()) {
      totalRequests += client.count;
    }

    return {
      activeClients: this.clients.size,
      totalRequests,
    };
  }
}
