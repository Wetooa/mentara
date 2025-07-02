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
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  therapist: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  community: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  post: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  reply: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  commentHeart: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    delete: jest.fn(),
  },
  replyHeart: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    delete: jest.fn(),
  },
  fileAttachment: {
    findMany: jest.fn().mockResolvedValue([]),
    createMany: jest.fn().mockResolvedValue({ count: 0 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  meeting: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  preAssessment: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  membership: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  clientTherapist: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  therapistAvailability: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  // Audit and System models
  auditLog: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    groupBy: jest.fn().mockResolvedValue([]),
  },
  systemEvent: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  dataChangeLog: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Billing models
  subscription: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    groupBy: jest.fn().mockResolvedValue([]),
  },
  subscriptionPlan: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  paymentMethod: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  payment: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
  },
  invoice: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  discount: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  discountRedemption: {
    create: jest.fn(),
  },
  usageRecord: {
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
  },
  // Messaging models
  conversation: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn().mockResolvedValue(null),
  },
  conversationParticipant: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    delete: jest.fn(),
  },
  message: {
    findUnique: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  messageReadReceipt: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    upsert: jest.fn(),
  },
  messageReaction: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  userBlock: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
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
