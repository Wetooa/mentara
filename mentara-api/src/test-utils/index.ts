export { DatabaseTestSetup } from './database-test.setup';
export { TestDataFactory } from './test-data.factory';

// Mock utilities
export const createMockPrismaService = () => ({
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  client: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  therapist: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  community: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  meeting: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  preAssessment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  membership: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  clientTherapist: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
});

// Event Bus Mocks
export const createMockEventBus = () => ({
  emit: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  subscribeToAggregate: jest.fn(),
  subscribeToAll: jest.fn(),
  getEventStats: jest.fn(),
  hasListeners: jest.fn(),
  removeAllListeners: jest.fn(),
});

// Auth Mocks
export const createMockAuthGuard = () => ({
  canActivate: jest.fn().mockReturnValue(true),
});

export const createMockClerkClient = () => ({
  users: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
});

// Common test constants
export const TEST_USER_IDS = {
  CLIENT: 'test-client-123',
  THERAPIST: 'test-therapist-456',
  ADMIN: 'test-admin-789',
  MODERATOR: 'test-moderator-101',
};

export const TEST_EMAILS = {
  CLIENT: 'test-client@example.com',
  THERAPIST: 'test-therapist@example.com',
  ADMIN: 'test-admin@example.com',
  MODERATOR: 'test-moderator@example.com',
};

// Helper functions for tests
export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const expectToThrowAsync = async (
  asyncFn: () => Promise<any>,
  expectedError: any,
) => {
  let error: any = null;
  try {
    await asyncFn();
  } catch (e) {
    error = e;
  }
  expect(error).toBeInstanceOf(expectedError);
};

export const waitForCondition = async (
  condition: () => boolean,
  timeoutMs: number = 5000,
  intervalMs: number = 100,
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Condition not met within ${timeoutMs}ms`);
    }
    await delay(intervalMs);
  }
};
