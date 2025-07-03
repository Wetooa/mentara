import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import {
  validateEnvironmentVariables,
  logEnvironmentInfo,
} from './config/env-validation';

async function bootstrap() {
  // Validate environment variables before starting the application
  try {
    validateEnvironmentVariables();
    logEnvironmentInfo();
  } catch (error) {
    console.error(
      '❌ Failed to start application:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
  // Create with raw body parsing for webhooks
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
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
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for API compatibility
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Parse JSON payloads
  // app.use(
  //   bodyParser.json({
  //     verify: (req: any, res, buf) => {
  //       req.rawBody = buf;
  //     },
  //   }),
  // );

  // Enable CORS with secure configuration
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL?.split(',') || ['https://mentara.app']
        : ['http://localhost:3000', 'http://localhost:3001'], // Only allow local dev in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'svix-id',
      'svix-signature',
      'svix-timestamp',
      'x-clerk-auth-token',
    ],
    optionsSuccessStatus: 200,
  });

  // Ensure uploads directory exists
  const uploadsDir = join(__dirname, '..', 'uploads');
  const worksheetsDir = join(uploadsDir, 'worksheets');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(worksheetsDir)) {
    fs.mkdirSync(worksheetsDir);
  }

  // Static file serving removed for security - files now served through protected endpoints

  // Global prefix for all API routes
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
