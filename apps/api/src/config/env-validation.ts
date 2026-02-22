import { Logger } from '@nestjs/common';

export interface RequiredEnvVars {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  MICROSOFT_CLIENT_ID: string;
  MICROSOFT_CLIENT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_API_KEY: string;
  PORT?: string;
  FRONTEND_URL?: string;
  AI_SERVICE_URL?: string;
  JWT_EXPIRES_IN?: string;
  JWT_REFRESH_EXPIRES_IN?: string;
  GOOGLE_CALLBACK_URL?: string;
  MICROSOFT_CALLBACK_URL?: string;
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
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  CLERK_SECRET_KEY?: string;
  ALLOWED_ORIGINS?: string;
  SAMBANOVA_API_KEY?: string;
  SAMBANOVA_BASE_URL?: string;
  SAMBANOVA_MODEL?: string;
  TEST_DATABASE_URL?: string;
  // AI Provider Configuration
  AI_PROVIDER?: 'gemini' | 'ollama' | 'sambanova';
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
}

const logger = new Logger('EnvironmentValidation');

export function validateEnvironmentVariables(): RequiredEnvVars {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'SUPABASE_URL',
    'SUPABASE_API_KEY',
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

  // Validate OAuth client IDs (they should be substantial strings)
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID.length < 20
  ) {
    invalidVars.push('GOOGLE_CLIENT_ID (appears to be too short)');
  }

  if (
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET.length < 20
  ) {
    invalidVars.push('GOOGLE_CLIENT_SECRET (appears to be too short)');
  }

  if (
    process.env.MICROSOFT_CLIENT_ID &&
    process.env.MICROSOFT_CLIENT_ID.length < 20
  ) {
    invalidVars.push('MICROSOFT_CLIENT_ID (appears to be too short)');
  }

  if (
    process.env.MICROSOFT_CLIENT_SECRET &&
    process.env.MICROSOFT_CLIENT_SECRET.length < 20
  ) {
    invalidVars.push('MICROSOFT_CLIENT_SECRET (appears to be too short)');
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    invalidVars.push(
      'JWT_SECRET (must be at least 32 characters for security)',
    );
  }

  if (
    process.env.MESSAGE_ENCRYPTION_KEY &&
    process.env.MESSAGE_ENCRYPTION_KEY.length < 32
  ) {
    invalidVars.push(
      'MESSAGE_ENCRYPTION_KEY (must be at least 32 characters for security)',
    );
  }

  // Validate Supabase configuration
  if (
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.startsWith('https://')
  ) {
    invalidVars.push('SUPABASE_URL (must be a valid HTTPS URL)');
  }

  if (
    process.env.SUPABASE_API_KEY &&
    process.env.SUPABASE_API_KEY.length < 20
  ) {
    invalidVars.push('SUPABASE_API_KEY (appears to be too short)');
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
    JWT_SECRET: process.env.JWT_SECRET!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID!,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY!,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    PORT: process.env.PORT,
    FRONTEND_URL: process.env.FRONTEND_URL,
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    MICROSOFT_CALLBACK_URL: process.env.MICROSOFT_CALLBACK_URL,
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
    `🔑 JWT Authentication: ${process.env.JWT_SECRET ? 'Configured' : 'Not configured'}`,
  );
  logger.log(
    `🔐 Message Encryption: ${process.env.MESSAGE_ENCRYPTION_KEY ? 'Configured' : 'Not configured'}`,
  );
  logger.log(
    `🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`,
  );
  logger.log(
    `🔐 Microsoft OAuth: ${process.env.MICROSOFT_CLIENT_ID ? 'Configured' : 'Not configured'}`,
  );
  logger.log(
    `🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`,
  );
  logger.log(
    `🤖 AI Service: ${process.env.AI_SERVICE_URL || 'Not configured'}`,
  );

  // AI Provider Configuration
  const aiProvider = process.env.AI_PROVIDER || 'ollama';
  logger.log(`🤖 AI Provider: ${aiProvider}`);

  // Log provider-specific configuration
  switch (aiProvider.toLowerCase()) {
    case 'gemini':
      logger.log(
        `🤖 Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`,
      );
      if (process.env.GEMINI_API_KEY) {
        logger.log(
          `🤖 Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}`,
        );
      }
      break;
    case 'sambanova':
      logger.log(
        `🤖 SambaNova API: ${process.env.SAMBANOVA_API_KEY ? 'Configured' : 'Not configured'}`,
      );
      if (process.env.SAMBANOVA_API_KEY) {
        const modelName = process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.1-8B-Instruct (default)';
        logger.log(`🤖 SambaNova Model: ${modelName}`);
        logger.log(
          `   Base URL: ${process.env.SAMBANOVA_BASE_URL || 'https://api.sambanova.ai/v1'}`,
        );

        // Warn if using a potentially problematic model
        if (modelName.toLowerCase().includes('allam')) {
          logger.warn(
            '⚠️ Warning: ALLaM models are designed for Arabic and may not work well for English conversations',
          );
          logger.warn(
            '⚠️ Consider setting SAMBANOVA_MODEL to: Meta-Llama-3.1-8B-Instruct, Meta-Llama-3.1-70B-Instruct, or Meta-Llama-3.2-1B-Instruct',
          );
        }
      }
      break;
    case 'ollama':
    default:
      logger.log(
        `🤖 Ollama Base URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`,
      );
      logger.log(
        `🤖 Ollama Model: ${process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'}`,
      );
      break;
  }

  logger.log(
    `☁️ Supabase Storage: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured'}`,
  );
}
