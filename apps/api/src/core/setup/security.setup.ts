import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';

/**
 * Configure Security (CORS and Helmet) for the application
 */
export function setupSecurity(app: NestExpressApplication): void {
  const logger = new Logger('Security');
  
  // Enable CORS
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL?.split(',')
          .map((url) => url.trim())
          .filter((url) => url.length > 0) || ['https://mentara.app']
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://localhost:10001',
          'http://127.0.0.1:10001',
        ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          logger.warn(`CORS: Allowing origin ${origin} in development mode`);
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type', 'Accept', 'Authorization', 'X-Requested-With',
      'X-Request-ID', 'X-Request-Time', 'x-request-id', 'x-request-time',
      'svix-id', 'svix-signature', 'svix-timestamp', 'x-clerk-auth-token',
    ],
    exposedHeaders: [
      'Content-Type', 'Authorization', 'X-Total-Count', 'X-Page', 'X-Per-Page',
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400,
  });

  // Enable security headers with helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:3001', 'ws://localhost:3001', 'wss://'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
}
