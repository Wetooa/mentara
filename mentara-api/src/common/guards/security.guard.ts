import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly suspiciousPatterns = [
    // SQL Injection patterns
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+.*set/i,
    /script\s*>/i,
    
    // XSS patterns
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    
    // Command injection patterns
    /\|\s*cat\s+/,
    /;\s*rm\s+-rf/,
    /&&\s*curl/,
    /`.*`/,
    
    // Path traversal patterns
    /\.\.\//,
    /\.\.\\\\\\\\\\\\\\\\w+/,
    /\.\.\%2f/i,
    /\.\.\%5c/i,
  ];

  private readonly maxRequestSize = 10 * 1024 * 1024; // 10MB
  private readonly maxHeaderLength = 8192; // 8KB
  private readonly maxUrlLength = 2048; // 2KB

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Check request size
    if (this.getRequestSize(request) > this.maxRequestSize) {
      throw new ForbiddenException('Request too large');
    }

    // Check URL length
    if (request.url.length > this.maxUrlLength) {
      throw new ForbiddenException('URL too long');
    }

    // Check headers
    this.validateHeaders(request);

    // Check for suspicious patterns in URL
    this.validateInput(request.url, 'URL');

    // Check query parameters
    Object.entries(request.query || {}).forEach(([key, value]) => {
      this.validateInput(key, 'Query parameter key');
      this.validateInput(String(value), 'Query parameter value');
    });

    // Check body if it exists
    if (request.body) {
      this.validateRequestBody(request.body);
    }

    return true;
  }

  private getRequestSize(request: Request): number {
    const contentLength = request.headers['content-length'];
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  private validateHeaders(request: Request): void {
    Object.entries(request.headers).forEach(([name, value]) => {
      const headerValue = Array.isArray(value) ? value.join('') : String(value || '');
      
      if (headerValue.length > this.maxHeaderLength) {
        throw new ForbiddenException(`Header ${name} too long`);
      }
      
      this.validateInput(headerValue, `Header ${name}`);
    });
  }

  private validateInput(input: string, context: string): void {
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        throw new ForbiddenException(`Suspicious content detected in ${context}`);
      }
    }
  }

  private validateRequestBody(body: any, depth = 0): void {
    // Prevent deep nesting attacks
    if (depth > 10) {
      throw new ForbiddenException('Request body too deeply nested');
    }

    if (typeof body === 'string') {
      this.validateInput(body, 'Request body');
    } else if (Array.isArray(body)) {
      if (body.length > 1000) {
        throw new ForbiddenException('Array too large');
      }
      body.forEach(item => this.validateRequestBody(item, depth + 1));
    } else if (typeof body === 'object' && body !== null) {
      const keys = Object.keys(body);
      if (keys.length > 100) {
        throw new ForbiddenException('Too many object properties');
      }
      
      keys.forEach(key => {
        this.validateInput(key, 'Object key');
        this.validateRequestBody(body[key], depth + 1);
      });
    }
  }
}