import { Logger } from '@nestjs/common';

export interface RequiredEnvVars {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
  FRONTEND_URL?: string;
  AI_SERVICE_URL?: string;
}

export interface OptionalEnvVars {
  REDIS_URL?: string;
  S3_BUCKET_NAME?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

const logger = new Logger('EnvironmentValidation');

export function validateEnvironmentVariables(): RequiredEnvVars {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'NODE_ENV',
  ];

  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  // Validate specific formats
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith('postgresql://')
  ) {
    invalidVars.push(
      'DATABASE_URL (must be a valid PostgreSQL connection string)',
    );
  }

  if (
    process.env.NODE_ENV &&
    !['development', 'production', 'test'].includes(process.env.NODE_ENV)
  ) {
    invalidVars.push('NODE_ENV (must be development, production, or test)');
  }

  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    invalidVars.push('PORT (must be a valid number)');
  }

  if (
    process.env.CLERK_SECRET_KEY &&
    process.env.CLERK_SECRET_KEY.length < 10
  ) {
    invalidVars.push('CLERK_SECRET_KEY (appears to be too short)');
  }

  // Log warnings for missing optional variables in production
  if (process.env.NODE_ENV === 'production') {
    const recommendedProdVars = ['FRONTEND_URL', 'AI_SERVICE_URL'];
    const missingProdVars = recommendedProdVars.filter(
      (varName) => !process.env[varName],
    );

    if (missingProdVars.length > 0) {
      logger.warn(
        `Recommended environment variables missing in production: ${missingProdVars.join(', ')}`,
      );
    }
  }

  // Report errors
  if (missingVars.length > 0 || invalidVars.length > 0) {
    const errors: string[] = [];

    if (missingVars.length > 0) {
      errors.push(
        `Missing required environment variables: ${missingVars.join(', ')}`,
      );
    }

    if (invalidVars.length > 0) {
      errors.push(`Invalid environment variables: ${invalidVars.join(', ')}`);
    }

    logger.error('Environment validation failed:');
    errors.forEach((error) => logger.error(`  - ${error}`));

    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }

  logger.log('✅ Environment variables validated successfully');

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  };
}

export function logEnvironmentInfo(): void {
  logger.log(
    `🚀 Starting application in ${process.env.NODE_ENV || 'unknown'} mode`,
  );
  logger.log(
    `📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`,
  );
  logger.log(
    `🔐 Authentication: ${process.env.CLERK_SECRET_KEY ? 'Configured' : 'Not configured'}`,
  );
  logger.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`,
  );
  logger.log(
    `🤖 AI Service: ${process.env.AI_SERVICE_URL || 'Not configured'}`,
  );
}
