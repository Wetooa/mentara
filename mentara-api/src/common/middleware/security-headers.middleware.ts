import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Content Security Policy
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const cspPolicy = [
      "default-src 'self'",
      `connect-src 'self' ${frontendUrl} https://*.clerk.accounts.dev https://*.supabase.co wss://`,
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; ');

    // Security Headers
    res.setHeader('Content-Security-Policy', cspPolicy);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );

    // HSTS (HTTP Strict Transport Security)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    // Cache Control for sensitive endpoints
    if (this.isSensitiveEndpoint(req.path)) {
      res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private',
      );
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // CORS headers are handled by NestJS enableCors() in main.ts
    // Don't set CORS headers here to avoid conflicts
    // Only ensure headers are preserved if already set

    next();
  }

  private isSensitiveEndpoint(path: string): boolean {
    const sensitivePatterns = [
      '/auth',
      '/admin',
      '/billing',
      '/files',
      '/pre-assessment',
      '/sessions',
      '/messaging',
    ];

    return sensitivePatterns.some((pattern) => path.startsWith(pattern));
  }
}
