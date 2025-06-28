import 'reflect-metadata';

// Global test setup for unit tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://test:test@localhost:5432/mentara_test';
});

// Mock external dependencies
jest.mock('axios');
jest.mock('@clerk/backend');

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Setup global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Test environment validation (only for integration tests)
if (
  process.env.JEST_TEST_TYPE === 'integration' &&
  !process.env.DATABASE_URL?.includes('test')
) {
  throw new Error(
    'Integration tests must use a test database. DATABASE_URL must contain "test"',
  );
}

// Global test constants
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      testDb: any;
    }
  }
}

// Export common test helpers
export const TEST_TIMEOUT = {
  UNIT: 5000,
  INTEGRATION: 15000,
  E2E: 30000,
};
