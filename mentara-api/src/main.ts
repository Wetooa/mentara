import { NestFactory } from '@nestjs/core';
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

  // Configure Socket.io adapter for WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

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

  // Enable CORS with secure configuration for both HTTP API and WebSocket connections
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

  const preferredPort = parseInt(process.env.PORT ?? '3001', 10);
  let actualPort = preferredPort;
  
  // In development, try to find an available port if the preferred one is busy
  if (process.env.NODE_ENV !== 'production') {
    try {
      actualPort = await findAvailablePort(preferredPort);
      if (actualPort !== preferredPort) {
        console.log(`⚠️  Port ${preferredPort} is busy, using port ${actualPort} instead`);
      }
    } catch (error) {
      console.error(`❌ Could not find an available port: ${error.message}`);
      console.error(`💡 Try: npx kill-port ${preferredPort} to free up the preferred port`);
      process.exit(1);
    }
  } else {
    // In production, strictly use the configured port
    actualPort = preferredPort;
  }
  
  try {
    await app.listen(actualPort);
    console.log(`✅ Application is running on: ${await app.getUrl()}`);
    console.log('🔌 WebSocket (Socket.io) support enabled');
    console.log(`📡 WebSocket server listening on port: ${actualPort}`);
    
    if (actualPort !== preferredPort) {
      console.log(`🔄 Note: Using port ${actualPort} instead of preferred port ${preferredPort}`);
    }
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${actualPort} is already in use. Please:
1. Kill the process using the port: npx kill-port ${actualPort}
2. Or use a different port by setting PORT environment variable
3. Or wait for the previous process to terminate`);
      process.exit(1);
    } else {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    try {
      await app.close();
      console.log('✅ Application shut down successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    shutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}

void bootstrap();
