import 'reflect-metadata';
import { DatabaseTestSetup } from './database-test.setup';
import { TestDataFactory } from './test-data.factory';

// Global test database setup for integration tests
let testFactory: TestDataFactory;

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';

  // Setup test database container
  const prismaService = await DatabaseTestSetup.setupTestDatabase();

  // Initialize test data factory
  testFactory = new TestDataFactory(prismaService);

  // Make factory available globally
  (global as any).testFactory = testFactory;
  (global as any).testDb = prismaService;
}, 60000); // Increased timeout for container startup

beforeEach(async () => {
  // Clean database before each test
  await DatabaseTestSetup.cleanupDatabase();
}, 15000);

afterAll(async () => {
  // Stop test database container
  await DatabaseTestSetup.stopContainer();
}, 30000);

// Test timeout for integration tests
jest.setTimeout(30000);

// Suppress logs during integration tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Export utilities for integration tests
export { testFactory };
export const getTestDb = () => DatabaseTestSetup.getPrismaService();
