import 'reflect-metadata';

// Global test setup for unit tests
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://test:test@localhost:5432/mentara_test';

  // Disable external services in tests
  process.env.DISABLE_CLERK_WEBHOOK = 'true';
  process.env.DISABLE_EMAIL_SERVICE = 'true';
  process.env.DISABLE_AI_SERVICE = 'true';

  // Test-specific configurations
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars!!';
});

// Mock external dependencies
jest.mock('axios');
// @clerk/backend has been removed from the project - JWT auth is now used instead

// Note: File upload and AI service mocks will be added per-test as needed
// This prevents global module resolution issues when dependencies aren't installed

// Enhanced console mocking with test insights
const originalConsole = { ...console };
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn((message) => {
    if (process.env.DEBUG_TESTS === 'true') {
      originalConsole.log('[TEST DEBUG]', message);
    }
  }),
  debug: jest.fn(),
  info: jest.fn(),
  warn: (message) => {
    if (process.env.SHOW_WARNINGS === 'true') {
      originalConsole.warn('[TEST WARN]', message);
    }
  },
  error: originalConsole.error.bind(originalConsole), // Always show errors
};

// Setup global test timeout
jest.setTimeout(10000);

// Enhanced cleanup after each test
afterEach(async () => {
  jest.clearAllMocks();
  jest.clearAllTimers();

  // Reset environment variables that might have been modified
  delete process.env.TEST_USER_ID;
  delete process.env.TEST_ROLE;
});

// Global cleanup
afterAll(async () => {
  // Clean up any remaining async operations
  await new Promise((resolve) => setTimeout(resolve, 100));
});

// Test environment validation
if (
  process.env.JEST_TEST_TYPE === 'integration' &&
  !process.env.DATABASE_URL?.includes('test')
) {
  throw new Error(
    'Integration tests must use a test database. DATABASE_URL must contain "test"',
  );
}

// Prevent tests from running against production database
if (process.env.DATABASE_URL?.includes('prod')) {
  throw new Error('Tests cannot run against production database!');
}

// Global test constants
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      testDb: any;
      testFactory: any;
    }
  }
}

// Enhanced test timeouts with categories
export const TEST_TIMEOUT = {
  UNIT: 5000,
  INTEGRATION: 15000,
  E2E: 30000,
  DATABASE: 20000,
  ASYNC_OPERATION: 10000,
};

// Test performance tracking
const testStartTimes = new Map();

beforeEach(() => {
  const testName = expect.getState().currentTestName;
  testStartTimes.set(testName, Date.now());
});

afterEach(() => {
  const testName = expect.getState().currentTestName;
  const startTime = testStartTimes.get(testName);
  if (startTime && process.env.TRACK_TEST_PERFORMANCE === 'true') {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`Slow test detected: ${testName} took ${duration}ms`);
    }
  }
  testStartTimes.delete(testName);
});

// Global error handlers for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
