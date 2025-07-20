/*
 * Ultra-Comprehensive Test Suite for Environment Validation
 * 
 * This test suite provides extensive coverage for the environment validation functionality, which handles:
 * - Required environment variable validation
 * - Optional environment variable handling
 * - Format validation for specific variables (URLs, secrets, OAuth credentials)
 * - Security validation (minimum length requirements)
 * - Production environment warnings
 * - Environment information logging
 * 
 * Test Coverage Areas:
 * 1. Required Environment Variables Validation
 * 2. Format Validation (DATABASE_URL, SUPABASE_URL, NODE_ENV)
 * 3. Security Validation (JWT_SECRET, OAuth credentials length)
 * 4. Production Environment Warnings
 * 5. Error Handling and Reporting
 * 6. Environment Information Logging
 * 7. Edge Cases and Invalid Data
 * 8. Performance and Memory Management
 * 9. Integration Scenarios
 * 10. Security Attack Vectors
 * 
 * Testing Approach:
 * - Comprehensive validation rule testing
 * - Environment variable mocking and isolation
 * - Error message validation
 * - Logging behavior verification
 * - Performance testing with large configurations
 * - Security boundary testing
 */

import { Logger } from '@nestjs/common';
import {
  validateEnvironmentVariables,
  logEnvironmentInfo,
  RequiredEnvVars,
  OptionalEnvVars,
} from './env-validation';

describe('Environment Validation - Ultra-Comprehensive Test Suite', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let loggerSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };
    
    // Clear environment variables for clean test state
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('DATABASE_') || key.startsWith('JWT_') || 
          key.startsWith('GOOGLE_') || key.startsWith('MICROSOFT_') ||
          key.startsWith('SUPABASE_') || key === 'NODE_ENV' || key === 'PORT' ||
          key.startsWith('FRONTEND_') || key.startsWith('AI_') ||
          key.startsWith('REDIS_') || key.startsWith('S3_') ||
          key.startsWith('AWS_') || key.startsWith('SMTP_')) {
        delete process.env[key];
      }
    });

    // Setup logger spies
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('Core Environment Validation', () => {
    describe('Required Variables Validation', () => {
      it('should validate all required environment variables successfully', () => {
        // Set all required environment variables
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
        process.env.JWT_SECRET = 'a'.repeat(32); // 32 characters minimum
        process.env.NODE_ENV = 'development';
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25); // > 20 characters
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_API_KEY = 'e'.repeat(25);

        const result = validateEnvironmentVariables();

        expect(result).toEqual({
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/mentara',
          JWT_SECRET: 'a'.repeat(32),
          NODE_ENV: 'development',
          GOOGLE_CLIENT_ID: 'a'.repeat(25),
          GOOGLE_CLIENT_SECRET: 'b'.repeat(25),
          MICROSOFT_CLIENT_ID: 'c'.repeat(25),
          MICROSOFT_CLIENT_SECRET: 'd'.repeat(25),
          SUPABASE_URL: 'https://project.supabase.co',
          SUPABASE_API_KEY: 'e'.repeat(25),
          PORT: undefined,
          FRONTEND_URL: undefined,
          AI_SERVICE_URL: undefined,
          JWT_EXPIRES_IN: undefined,
          JWT_REFRESH_EXPIRES_IN: undefined,
          GOOGLE_CALLBACK_URL: undefined,
          MICROSOFT_CALLBACK_URL: undefined,
        });

        expect(loggerSpy).toHaveBeenCalledWith('✅ Environment variables validated successfully');
      });

      it('should include optional variables when provided', () => {
        // Set required variables
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
        process.env.JWT_SECRET = 'a'.repeat(32);
        process.env.NODE_ENV = 'production';
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_API_KEY = 'e'.repeat(25);

        // Set optional variables
        process.env.PORT = '3000';
        process.env.FRONTEND_URL = 'https://mentara.com';
        process.env.AI_SERVICE_URL = 'https://ai.mentara.com';
        process.env.JWT_EXPIRES_IN = '1h';
        process.env.JWT_REFRESH_EXPIRES_IN = '7d';
        process.env.GOOGLE_CALLBACK_URL = 'https://mentara.com/auth/google/callback';
        process.env.MICROSOFT_CALLBACK_URL = 'https://mentara.com/auth/microsoft/callback';

        const result = validateEnvironmentVariables();

        expect(result.PORT).toBe('3000');
        expect(result.FRONTEND_URL).toBe('https://mentara.com');
        expect(result.AI_SERVICE_URL).toBe('https://ai.mentara.com');
        expect(result.JWT_EXPIRES_IN).toBe('1h');
        expect(result.JWT_REFRESH_EXPIRES_IN).toBe('7d');
        expect(result.GOOGLE_CALLBACK_URL).toBe('https://mentara.com/auth/google/callback');
        expect(result.MICROSOFT_CALLBACK_URL).toBe('https://mentara.com/auth/microsoft/callback');
      });

      it('should handle all NODE_ENV values correctly', () => {
        const nodeEnvValues: Array<'development' | 'production' | 'test'> = ['development', 'production', 'test'];

        nodeEnvValues.forEach(nodeEnv => {
          // Reset environment
          Object.keys(process.env).forEach(key => {
            if (key.startsWith('DATABASE_') || key.startsWith('JWT_') || 
                key.startsWith('GOOGLE_') || key.startsWith('MICROSOFT_') ||
                key.startsWith('SUPABASE_') || key === 'NODE_ENV') {
              delete process.env[key];
            }
          });

          // Set required variables with current NODE_ENV
          process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
          process.env.JWT_SECRET = 'a'.repeat(32);
          process.env.NODE_ENV = nodeEnv;
          process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
          process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
          process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
          process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
          process.env.SUPABASE_URL = 'https://project.supabase.co';
          process.env.SUPABASE_API_KEY = 'e'.repeat(25);

          const result = validateEnvironmentVariables();
          expect(result.NODE_ENV).toBe(nodeEnv);
        });
      });
    });

    describe('Missing Required Variables', () => {
      it('should throw error when DATABASE_URL is missing', () => {
        // Set all except DATABASE_URL
        process.env.JWT_SECRET = 'a'.repeat(32);
        process.env.NODE_ENV = 'development';
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_API_KEY = 'e'.repeat(25);

        expect(() => validateEnvironmentVariables()).toThrow(
          'Environment validation failed: Missing required environment variables: DATABASE_URL'
        );

        expect(loggerErrorSpy).toHaveBeenCalledWith('Environment validation failed:');
        expect(loggerErrorSpy).toHaveBeenCalledWith('  - Missing required environment variables: DATABASE_URL');
      });

      it('should throw error when JWT_SECRET is missing', () => {
        // Set all except JWT_SECRET
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
        process.env.NODE_ENV = 'development';
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_API_KEY = 'e'.repeat(25);

        expect(() => validateEnvironmentVariables()).toThrow(
          'Environment validation failed: Missing required environment variables: JWT_SECRET'
        );
      });

      it('should throw error when multiple variables are missing', () => {
        // Set only some variables
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
        process.env.NODE_ENV = 'development';

        expect(() => validateEnvironmentVariables()).toThrow();
        
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing required environment variables: JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, SUPABASE_URL, SUPABASE_API_KEY')
        );
      });

      it('should throw error when variables are empty strings', () => {
        // Set variables as empty strings
        process.env.DATABASE_URL = '';
        process.env.JWT_SECRET = '   '; // Whitespace only
        process.env.NODE_ENV = 'development';
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
        process.env.SUPABASE_URL = 'https://project.supabase.co';
        process.env.SUPABASE_API_KEY = 'e'.repeat(25);

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing required environment variables: DATABASE_URL, JWT_SECRET')
        );
      });
    });
  });

  describe('Format Validation', () => {
    beforeEach(() => {
      // Set minimal valid configuration
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'e'.repeat(25);
    });

    describe('DATABASE_URL Validation', () => {
      it('should reject invalid DATABASE_URL format', () => {
        process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/mentara';

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid environment variables: DATABASE_URL (must be a valid PostgreSQL connection string)')
        );
      });

      it('should reject DATABASE_URL without protocol', () => {
        process.env.DATABASE_URL = 'user:pass@localhost:5432/mentara';

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('DATABASE_URL (must be a valid PostgreSQL connection string)')
        );
      });

      it('should accept valid PostgreSQL URLs with different formats', () => {
        const validUrls = [
          'postgresql://user:pass@localhost:5432/mentara',
          'postgresql://user@localhost/mentara',
          'postgresql://localhost/mentara',
          'postgresql://user:pass@remote.host.com:5432/mentara?sslmode=require'
        ];

        validUrls.forEach(url => {
          process.env.DATABASE_URL = url;
          expect(() => validateEnvironmentVariables()).not.toThrow();
        });
      });
    });

    describe('NODE_ENV Validation', () => {
      it('should reject invalid NODE_ENV values', () => {
        const invalidNodeEnvs = ['staging', 'local', 'prod', 'dev', 'testing'];

        invalidNodeEnvs.forEach(nodeEnv => {
          process.env.NODE_ENV = nodeEnv;
          
          expect(() => validateEnvironmentVariables()).toThrow();
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('NODE_ENV (must be development, production, or test)')
          );
          
          // Reset for next iteration
          loggerErrorSpy.mockClear();
        });
      });

      it('should accept valid NODE_ENV values', () => {
        const validNodeEnvs = ['development', 'production', 'test'];

        validNodeEnvs.forEach(nodeEnv => {
          process.env.NODE_ENV = nodeEnv;
          expect(() => validateEnvironmentVariables()).not.toThrow();
        });
      });
    });

    describe('PORT Validation', () => {
      it('should reject non-numeric PORT values', () => {
        process.env.PORT = 'not-a-number';

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid environment variables: PORT (must be a valid number)')
        );
      });

      it('should accept valid PORT numbers', () => {
        const validPorts = ['3000', '8080', '80', '443', '5432'];

        validPorts.forEach(port => {
          process.env.PORT = port;
          expect(() => validateEnvironmentVariables()).not.toThrow();
        });
      });

      it('should handle edge case PORT values', () => {
        // Test boundary values
        process.env.PORT = '0';
        expect(() => validateEnvironmentVariables()).not.toThrow();

        process.env.PORT = '65535';
        expect(() => validateEnvironmentVariables()).not.toThrow();

        // Negative numbers are technically valid numbers but inappropriate for ports
        process.env.PORT = '-1';
        expect(() => validateEnvironmentVariables()).not.toThrow(); // Current implementation allows this
      });
    });

    describe('SUPABASE_URL Validation', () => {
      it('should reject SUPABASE_URL without HTTPS', () => {
        process.env.SUPABASE_URL = 'http://project.supabase.co';

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid environment variables: SUPABASE_URL (must be a valid HTTPS URL)')
        );
      });

      it('should reject SUPABASE_URL without protocol', () => {
        process.env.SUPABASE_URL = 'project.supabase.co';

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('SUPABASE_URL (must be a valid HTTPS URL)')
        );
      });

      it('should accept valid HTTPS URLs', () => {
        const validUrls = [
          'https://project.supabase.co',
          'https://abc123.supabase.co',
          'https://custom.domain.com',
          'https://localhost:3000'
        ];

        validUrls.forEach(url => {
          process.env.SUPABASE_URL = url;
          expect(() => validateEnvironmentVariables()).not.toThrow();
        });
      });
    });
  });

  describe('Security Validation', () => {
    beforeEach(() => {
      // Set minimal valid configuration
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'e'.repeat(25);
    });

    describe('JWT_SECRET Length Validation', () => {
      it('should reject JWT_SECRET shorter than 32 characters', () => {
        const shortSecrets = ['a'.repeat(31), 'short', '12345', 'a'.repeat(20)];

        shortSecrets.forEach(secret => {
          process.env.JWT_SECRET = secret;
          
          expect(() => validateEnvironmentVariables()).toThrow();
          expect(loggerErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('JWT_SECRET (must be at least 32 characters for security)')
          );
          
          // Reset for next iteration
          loggerErrorSpy.mockClear();
        });
      });

      it('should accept JWT_SECRET with exactly 32 characters', () => {
        process.env.JWT_SECRET = 'a'.repeat(32);
        expect(() => validateEnvironmentVariables()).not.toThrow();
      });

      it('should accept JWT_SECRET longer than 32 characters', () => {
        const longSecrets = [
          'a'.repeat(64),
          'a'.repeat(128),
          'very-long-jwt-secret-with-special-chars-!@#$%^&*()_+',
          'a'.repeat(256)
        ];

        longSecrets.forEach(secret => {
          process.env.JWT_SECRET = secret;
          expect(() => validateEnvironmentVariables()).not.toThrow();
        });
      });
    });

    describe('OAuth Credentials Length Validation', () => {
      it('should reject short GOOGLE_CLIENT_ID', () => {
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(19); // Less than 20

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('GOOGLE_CLIENT_ID (appears to be too short)')
        );
      });

      it('should reject short GOOGLE_CLIENT_SECRET', () => {
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(15);

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('GOOGLE_CLIENT_SECRET (appears to be too short)')
        );
      });

      it('should reject short MICROSOFT_CLIENT_ID', () => {
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(10);

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('MICROSOFT_CLIENT_ID (appears to be too short)')
        );
      });

      it('should reject short MICROSOFT_CLIENT_SECRET', () => {
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(5);

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('MICROSOFT_CLIENT_SECRET (appears to be too short)')
        );
      });

      it('should accept OAuth credentials with exactly 20 characters', () => {
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(20);
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(20);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(20);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(20);

        expect(() => validateEnvironmentVariables()).not.toThrow();
      });

      it('should accept OAuth credentials longer than 20 characters', () => {
        process.env.GOOGLE_CLIENT_ID = 'a'.repeat(50);
        process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(50);
        process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(50);
        process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(50);

        expect(() => validateEnvironmentVariables()).not.toThrow();
      });
    });

    describe('SUPABASE_API_KEY Length Validation', () => {
      it('should reject short SUPABASE_API_KEY', () => {
        process.env.SUPABASE_API_KEY = 'e'.repeat(19);

        expect(() => validateEnvironmentVariables()).toThrow();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('SUPABASE_API_KEY (appears to be too short)')
        );
      });

      it('should accept SUPABASE_API_KEY with exactly 20 characters', () => {
        process.env.SUPABASE_API_KEY = 'e'.repeat(20);
        expect(() => validateEnvironmentVariables()).not.toThrow();
      });

      it('should accept long SUPABASE_API_KEY', () => {
        process.env.SUPABASE_API_KEY = 'e'.repeat(100);
        expect(() => validateEnvironmentVariables()).not.toThrow();
      });
    });
  });

  describe('Production Environment Warnings', () => {
    beforeEach(() => {
      // Set required variables for production
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'production';
      process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'e'.repeat(25);
    });

    it('should warn about missing FRONTEND_URL in production', () => {
      // Don't set FRONTEND_URL
      delete process.env.FRONTEND_URL;
      process.env.AI_SERVICE_URL = 'https://ai.mentara.com';

      validateEnvironmentVariables();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Recommended environment variables missing in production: FRONTEND_URL'
      );
    });

    it('should warn about missing AI_SERVICE_URL in production', () => {
      process.env.FRONTEND_URL = 'https://mentara.com';
      // Don't set AI_SERVICE_URL
      delete process.env.AI_SERVICE_URL;

      validateEnvironmentVariables();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Recommended environment variables missing in production: AI_SERVICE_URL'
      );
    });

    it('should warn about multiple missing recommended variables in production', () => {
      // Don't set any recommended variables
      delete process.env.FRONTEND_URL;
      delete process.env.AI_SERVICE_URL;

      validateEnvironmentVariables();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        'Recommended environment variables missing in production: FRONTEND_URL, AI_SERVICE_URL'
      );
    });

    it('should not warn when all recommended variables are set in production', () => {
      process.env.FRONTEND_URL = 'https://mentara.com';
      process.env.AI_SERVICE_URL = 'https://ai.mentara.com';

      validateEnvironmentVariables();

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn about missing recommended variables in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.FRONTEND_URL;
      delete process.env.AI_SERVICE_URL;

      validateEnvironmentVariables();

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('should not warn about missing recommended variables in test', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.FRONTEND_URL;
      delete process.env.AI_SERVICE_URL;

      validateEnvironmentVariables();

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Combined Validation Errors', () => {
    it('should report both missing and invalid variables', () => {
      // Set some variables with invalid values
      process.env.DATABASE_URL = 'mysql://invalid'; // Invalid format
      process.env.NODE_ENV = 'staging'; // Invalid value
      process.env.JWT_SECRET = 'short'; // Too short
      process.env.PORT = 'not-a-number'; // Invalid type
      // Leave other required variables missing

      expect(() => validateEnvironmentVariables()).toThrow();

      expect(loggerErrorSpy).toHaveBeenCalledWith('Environment validation failed:');
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing required environment variables:')
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid environment variables:')
      );
    });

    it('should handle multiple validation errors gracefully', () => {
      // Set variables with multiple issues
      process.env.DATABASE_URL = 'invalid-url';
      process.env.JWT_SECRET = 'short';
      process.env.NODE_ENV = 'invalid';
      process.env.GOOGLE_CLIENT_ID = 'short';
      process.env.GOOGLE_CLIENT_SECRET = 'short';
      process.env.MICROSOFT_CLIENT_ID = 'short';
      process.env.MICROSOFT_CLIENT_SECRET = 'short';
      process.env.SUPABASE_URL = 'http://insecure.com';
      process.env.SUPABASE_API_KEY = 'short';
      process.env.PORT = 'invalid';

      expect(() => validateEnvironmentVariables()).toThrow();

      // Should log all validation errors
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL (must be a valid PostgreSQL connection string)')
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('JWT_SECRET (must be at least 32 characters for security)')
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('NODE_ENV (must be development, production, or test)')
      );
    });
  });

  describe('Environment Information Logging', () => {
    beforeEach(() => {
      // Reset logger mocks
      loggerSpy.mockClear();
    });

    it('should log environment information with all services configured', () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'configured';
      process.env.GOOGLE_CLIENT_ID = 'configured';
      process.env.MICROSOFT_CLIENT_ID = 'configured';
      process.env.FRONTEND_URL = 'https://mentara.com';
      process.env.AI_SERVICE_URL = 'https://ai.mentara.com';
      process.env.SUPABASE_URL = 'https://project.supabase.co';

      logEnvironmentInfo();

      expect(loggerSpy).toHaveBeenCalledWith('🚀 Starting application in production mode');
      expect(loggerSpy).toHaveBeenCalledWith('📊 Database: Connected');
      expect(loggerSpy).toHaveBeenCalledWith('🔑 JWT Authentication: Configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔐 Google OAuth: Configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔐 Microsoft OAuth: Configured');
      expect(loggerSpy).toHaveBeenCalledWith('🌐 Frontend URL: https://mentara.com');
      expect(loggerSpy).toHaveBeenCalledWith('🤖 AI Service: https://ai.mentara.com');
      expect(loggerSpy).toHaveBeenCalledWith('☁️ Supabase Storage: Configured');
    });

    it('should log environment information with no services configured', () => {
      // Clear all environment variables
      Object.keys(process.env).forEach(key => delete process.env[key]);

      logEnvironmentInfo();

      expect(loggerSpy).toHaveBeenCalledWith('🚀 Starting application in unknown mode');
      expect(loggerSpy).toHaveBeenCalledWith('📊 Database: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔑 JWT Authentication: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔐 Google OAuth: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔐 Microsoft OAuth: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('🌐 Frontend URL: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('🤖 AI Service: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('☁️ Supabase Storage: Not configured');
    });

    it('should log environment information with partial configuration', () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost/mentara';
      process.env.JWT_SECRET = 'configured';
      // Leave OAuth and other services unconfigured

      logEnvironmentInfo();

      expect(loggerSpy).toHaveBeenCalledWith('🚀 Starting application in development mode');
      expect(loggerSpy).toHaveBeenCalledWith('📊 Database: Connected');
      expect(loggerSpy).toHaveBeenCalledWith('🔑 JWT Authentication: Configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔐 Google OAuth: Not configured');
      expect(loggerSpy).toHaveBeenCalledWith('🔐 Microsoft OAuth: Not configured');
    });

    it('should handle missing NODE_ENV gracefully', () => {
      delete process.env.NODE_ENV;

      logEnvironmentInfo();

      expect(loggerSpy).toHaveBeenCalledWith('🚀 Starting application in unknown mode');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle validation with large number of environment variables efficiently', () => {
      // Set required variables
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'e'.repeat(25);

      // Add many additional environment variables
      for (let i = 0; i < 1000; i++) {
        process.env[`EXTRA_VAR_${i}`] = `value_${i}`;
      }

      const startTime = Date.now();
      const result = validateEnvironmentVariables();
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('should handle very long environment variable values', () => {
      const longValue = 'a'.repeat(10000);

      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = longValue; // Very long JWT secret
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = longValue;
      process.env.GOOGLE_CLIENT_SECRET = longValue;
      process.env.MICROSOFT_CLIENT_ID = longValue;
      process.env.MICROSOFT_CLIENT_SECRET = longValue;
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = longValue;

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });

    it('should not have memory leaks with repeated validations', () => {
      // Set valid configuration
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'e'.repeat(25);

      const initialMemory = process.memoryUsage().heapUsed;

      // Run validation many times
      for (let i = 0; i < 1000; i++) {
        validateEnvironmentVariables();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle environment variables with special characters', () => {
      process.env.DATABASE_URL = 'postgresql://user:p@ss!w0rd@localhost:5432/mentara';
      process.env.JWT_SECRET = 'secret-with-special-chars-!@#$%^&*()_+{}[]';
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'client-id-with-dashes-and-underscores_123';
      process.env.GOOGLE_CLIENT_SECRET = 'secret!@#$%^&*()with+special=chars';
      process.env.MICROSOFT_CLIENT_ID = 'microsoft_client_123-abc';
      process.env.MICROSOFT_CLIENT_SECRET = 'microsoft&secret*with%symbols';
      process.env.SUPABASE_URL = 'https://project-name.supabase.co';
      process.env.SUPABASE_API_KEY = 'api.key.with.dots.and-dashes';

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });

    it('should handle unicode characters in environment variables', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'jwt-secret-with-unicode-café-naïve-résumé';
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'google-client-with-unicode-é';
      process.env.GOOGLE_CLIENT_SECRET = 'secret-with-unicode-characters-ñ';
      process.env.MICROSOFT_CLIENT_ID = 'microsoft-client-unicode-ü';
      process.env.MICROSOFT_CLIENT_SECRET = 'secret-unicode-characters-ç';
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'api-key-with-unicode-characters';

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });

    it('should handle null prototype objects', () => {
      // This tests behavior when process.env has been tampered with
      const nullProtoEnv = Object.create(null);
      nullProtoEnv.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      nullProtoEnv.JWT_SECRET = 'a'.repeat(32);
      nullProtoEnv.NODE_ENV = 'development';
      nullProtoEnv.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      nullProtoEnv.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      nullProtoEnv.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      nullProtoEnv.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      nullProtoEnv.SUPABASE_URL = 'https://project.supabase.co';
      nullProtoEnv.SUPABASE_API_KEY = 'e'.repeat(25);

      // Temporarily replace process.env
      const originalEnv = process.env;
      process.env = nullProtoEnv as any;

      expect(() => validateEnvironmentVariables()).not.toThrow();

      // Restore process.env
      process.env = originalEnv;
    });

    it('should handle extremely long variable names', () => {
      const longVarName = 'VERY_LONG_VARIABLE_NAME_' + 'A'.repeat(1000);
      
      // Set required variables
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/mentara';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.NODE_ENV = 'development';
      process.env.GOOGLE_CLIENT_ID = 'a'.repeat(25);
      process.env.GOOGLE_CLIENT_SECRET = 'b'.repeat(25);
      process.env.MICROSOFT_CLIENT_ID = 'c'.repeat(25);
      process.env.MICROSOFT_CLIENT_SECRET = 'd'.repeat(25);
      process.env.SUPABASE_URL = 'https://project.supabase.co';
      process.env.SUPABASE_API_KEY = 'e'.repeat(25);

      // Add very long variable name
      process.env[longVarName] = 'some-value';

      expect(() => validateEnvironmentVariables()).not.toThrow();
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with real-world production configuration', () => {
      // Simulate realistic production environment
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://mentara_user:complex_password_123@db.mentara.com:5432/mentara_prod?sslmode=require';
      process.env.JWT_SECRET = 'production-jwt-secret-with-128-bit-entropy-that-is-very-secure-and-random';
      process.env.GOOGLE_CLIENT_ID = '123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com';
      process.env.GOOGLE_CLIENT_SECRET = 'GOCSPx-AbCdEfGhIjKlMnOpQrStUvWxYz';
      process.env.MICROSOFT_CLIENT_ID = '12345678-1234-1234-1234-123456789012';
      process.env.MICROSOFT_CLIENT_SECRET = 'AbC1Q~dEfGhIjKlMnOpQrStUvWxYz.123456';
      process.env.SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
      process.env.SUPABASE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MjQ2MTU4MCwiZXhwIjoxOTU4MDM3NTgwfQ.1234567890abcdefghijklmnopqrstuvwxyz';
      process.env.PORT = '8080';
      process.env.FRONTEND_URL = 'https://app.mentara.com';
      process.env.AI_SERVICE_URL = 'https://ai-api.mentara.com';

      const result = validateEnvironmentVariables();

      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe('production');
      expect(loggerSpy).toHaveBeenCalledWith('✅ Environment variables validated successfully');
      expect(loggerWarnSpy).not.toHaveBeenCalled(); // No missing recommended vars
    });

    it('should work with minimal development configuration', () => {
      // Simulate minimal development setup
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost/mentara_dev';
      process.env.JWT_SECRET = 'development-jwt-secret-32-chars-long';
      process.env.GOOGLE_CLIENT_ID = 'dev-google-client-id-12345678901234567890';
      process.env.GOOGLE_CLIENT_SECRET = 'dev-google-secret-1234567890123';
      process.env.MICROSOFT_CLIENT_ID = 'dev-microsoft-client-12345678901234567890';
      process.env.MICROSOFT_CLIENT_SECRET = 'dev-microsoft-secret-123456789012';
      process.env.SUPABASE_URL = 'https://localhost:3000';
      process.env.SUPABASE_API_KEY = 'development-supabase-key-1234567890';

      const result = validateEnvironmentVariables();

      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe('development');
      expect(loggerSpy).toHaveBeenCalledWith('✅ Environment variables validated successfully');
    });

    it('should work with test environment configuration', () => {
      // Simulate test environment setup
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_URL = 'postgresql://localhost/mentara_test';
      process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes';
      process.env.GOOGLE_CLIENT_ID = 'test-google-client-id-123456789012345';
      process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret-123456789012';
      process.env.MICROSOFT_CLIENT_ID = 'test-microsoft-client-123456789012345';
      process.env.MICROSOFT_CLIENT_SECRET = 'test-microsoft-secret-12345678901';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_API_KEY = 'test-supabase-api-key-123456789012';
      process.env.PORT = '3001';

      const result = validateEnvironmentVariables();

      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe('test');
      expect(result.PORT).toBe('3001');
    });
  });
});