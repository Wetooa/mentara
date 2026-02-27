import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import * as net from 'net';
import { setupSwagger } from './core/setup/swagger.setup';
import { setupSecurity } from './core/setup/security.setup';
import { setupShutdown } from './core/setup/shutdown.setup';

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

/**
 * Ensure necessary directories exist
 */
function ensureDirectories() {
  const uploadsDir = join(__dirname, '..', 'uploads');
  const worksheetsDir = join(uploadsDir, 'worksheets');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(worksheetsDir)) {
    fs.mkdirSync(worksheetsDir);
  }
}

async function bootstrap() {
  logger.log(`Memory before app load: ${JSON.stringify(process.memoryUsage())}`);

  // Create NestJS application
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Setup Infrastructure
  setupSecurity(app);
  setupSwagger(app);
  setupShutdown(app);
  
  ensureDirectories();

  // Global Configuration
  app.setGlobalPrefix('api');

  // Port configuration
  const preferredPort = parseInt(process.env.PORT ?? '3001', 10);
  let actualPort = preferredPort;
  
  if (process.env.NODE_ENV !== 'production') {
    try {
      actualPort = await findAvailablePort(preferredPort);
      if (actualPort !== preferredPort) {
        logger.warn(`Port ${preferredPort} is busy, using port ${actualPort} instead`);
      }
    } catch (error) {
      logger.error(`Could not find an available port: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  }

  try {
    await app.listen(actualPort);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${actualPort} is already in use.`);
      process.exit(1);
    } else {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

void bootstrap();
