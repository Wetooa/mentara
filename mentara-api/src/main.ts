import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  validateEnvironmentVariables,
  logEnvironmentInfo,
} from './config/env-validation';

async function bootstrap() {
  console.log('Memory before app load:', process.memoryUsage());

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
        ? process.env.FRONTEND_URL?.split(',')
            .map((url) => url.trim())
            .filter((url) => url.length > 0) || ['https://mentara.app']
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

  // Swagger API Documentation setup
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mentara API')
      .setDescription(
        'Mental health platform API providing comprehensive services for therapist-client connections, therapy sessions, community support, and mental health assessments',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      )
      .addTag(
        'auth',
        'Authentication endpoints for users, therapists, moderators, and admins',
      )
      .addTag('users', 'User management and profile operations')
      .addTag('therapists', 'Therapist profiles, applications, and management')
      .addTag('clients', 'Client-specific functionality and therapist matching')
      .addTag('sessions', 'Therapy session management and scheduling')
      .addTag('booking', 'Appointment booking and availability management')
      .addTag('communities', 'Support communities and group management')
      .addTag('posts', 'Community posts and content management')
      .addTag('comments', 'Comment system for community engagement')
      .addTag('messaging', 'Real-time messaging between users')
      .addTag('meetings', 'Video call and meeting management')
      .addTag('worksheets', 'Therapy assignments and worksheet management')
      .addTag('reviews', 'Therapist reviews and ratings')
      .addTag('pre-assessment', 'Mental health assessments and questionnaires')
      .addTag(
        'notifications',
        'User notifications and push notification management',
      )
      .addTag('files', 'File upload and management')
      .addTag('billing', 'Payment processing and billing management')
      .addTag('analytics', 'Usage analytics and reporting')
      .addTag('search', 'Search functionality across the platform')
      .addTag('admin', 'Administrative operations and user management')
      .addTag('moderator', 'Content moderation and community management')
      .addTag('audit-logs', 'System audit logging and tracking')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customfavIcon: '/favicon.ico',
      customSiteTitle: 'Mentara API Documentation',
    });

  }

  await app.listen(process.env.PORT ?? 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `📚 API Documentation available at: ${await app.getUrl()}/api/docs`,
    );
  }
}

void bootstrap();
