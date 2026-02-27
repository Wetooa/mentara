import { INestApplication, Logger } from '@nestjs/common';

/**
 * Configure graceful shutdown handlers for the application
 */
export function setupShutdown(app: INestApplication): void {
  const logger = new Logger('Shutdown');

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

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
}
