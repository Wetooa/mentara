import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import helmet from 'helmet';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as net from 'net';
import {
  validateEnvironmentVariables,
  logEnvironmentInfo,
} from './config/env-validation';

const logger = new Logger('Bootstrap');

/**
 * Check if a port is available
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * Find an available port starting from the preferred port
 */
async function findAvailablePort(preferredPort: number): Promise<number> {
  for (let port = preferredPort; port < preferredPort + 10; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports found in range ${preferredPort}-${preferredPort + 9}`);
}

async function bootstrap() {
  logger.log(`Memory before app load: ${JSON.stringify(process.memoryUsage())}`);

  // Validate environment variables before starting the application
  try {
    validateEnvironmentVariables();
    logEnvironmentInfo();
  } catch (error) {
    logger.error(
      'Failed to start application:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
  // Create with raw body parsing for webhooks
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Configure Socket.io adapter for WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable graceful shutdown hooks for WebSocket connections
  app.enableShutdownHooks();

  // Enable CORS FIRST - before Helmet to prevent conflicts
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
          'http://localhost:10001', // Docker compose port
          'http://127.0.0.1:10001',
        ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // In development, be more permissive
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
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'X-Request-Time',
      'x-request-id',
      'x-request-time',
      'svix-id',
      'svix-signature',
      'svix-timestamp',
      'x-clerk-auth-token',
    ],
    exposedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Total-Count',
      'X-Page',
      'X-Per-Page',
    ],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400, // 24 hours
  });

  // Enable security headers with helmet (AFTER CORS)
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
      crossOriginEmbedderPolicy: false, // Disable for API compatibility
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
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

  const preferredPort = parseInt(process.env.PORT ?? '3001', 10);
  let actualPort = preferredPort;
  
  // In development, try to find an available port if the preferred one is busy
  if (process.env.NODE_ENV !== 'production') {
    try {
      actualPort = await findAvailablePort(preferredPort);
      if (actualPort !== preferredPort) {
        logger.warn(`Port ${preferredPort} is busy, using port ${actualPort} instead`);
      }
    } catch (error) {
      logger.error(`Could not find an available port: ${error instanceof Error ? error.message : error}`);
      logger.error(`Try: npx kill-port ${preferredPort} to free up the preferred port`);
      process.exit(1);
    }
  } else {
    // In production, strictly use the configured port
    actualPort = preferredPort;
  }
  
  try {
    await app.listen(actualPort);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log('WebSocket (Socket.io) support enabled');
    logger.log(`WebSocket server listening on port: ${actualPort}`);

    if (actualPort !== preferredPort) {
      logger.log(`Note: Using port ${actualPort} instead of preferred port ${preferredPort}`);
    }
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${actualPort} is already in use. Kill the process: npx kill-port ${actualPort}, or set PORT, or wait for the previous process to terminate`);
      process.exit(1);
    } else {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      logger.log('Application shut down successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}

void bootstrap();
