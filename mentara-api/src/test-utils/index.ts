export { DatabaseTestSetup } from './database-test.setup';
export { TestDataFactory } from './test-data.factory';

// Mock utilities
const createMockPrismaModel = () => ({
  findUnique: jest.fn().mockResolvedValue(null),
  findMany: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  updateMany: jest.fn().mockResolvedValue({ count: 0 }),
  delete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  findFirst: jest.fn().mockResolvedValue(null),
  count: jest.fn().mockResolvedValue(0),
  groupBy: jest.fn().mockResolvedValue([]),
  aggregate: jest
    .fn()
    .mockResolvedValue({ _sum: {}, _avg: {}, _count: {}, _max: {}, _min: {} }),
  upsert: jest.fn().mockResolvedValue({}),
  createMany: jest.fn().mockResolvedValue({ count: 0 }),
});

export const createMockPrismaService = () => ({
  user: createMockPrismaModel(),
  client: createMockPrismaModel(),
  therapist: createMockPrismaModel(),
  community: createMockPrismaModel(),
  post: createMockPrismaModel(),
  comment: createMockPrismaModel(),
  reply: createMockPrismaModel(),
  commentHeart: createMockPrismaModel(),
  replyHeart: createMockPrismaModel(),
  fileAttachment: createMockPrismaModel(),
  meeting: createMockPrismaModel(),
  preAssessment: createMockPrismaModel(),
  membership: createMockPrismaModel(),
  clientTherapist: createMockPrismaModel(),
  therapistAvailability: createMockPrismaModel(),
  // Audit and System models
  auditLog: createMockPrismaModel(),
  systemEvent: createMockPrismaModel(),
  dataChangeLog: createMockPrismaModel(),
  // Billing models
  subscription: createMockPrismaModel(),
  subscriptionPlan: createMockPrismaModel(),
  paymentMethod: createMockPrismaModel(),
  payment: createMockPrismaModel(),
  invoice: createMockPrismaModel(),
  discount: createMockPrismaModel(),
  discountRedemption: createMockPrismaModel(),
  usageRecord: createMockPrismaModel(),
  // Messaging models
  conversation: createMockPrismaModel(),
  conversationParticipant: createMockPrismaModel(),
  message: createMockPrismaModel(),
  messageReadReceipt: createMockPrismaModel(),
  messageReaction: createMockPrismaModel(),
  userBlock: createMockPrismaModel(),
  // Additional models that might be needed
  worksheetType: createMockPrismaModel(),
  worksheet: createMockPrismaModel(),
  worksheetSubmission: createMockPrismaModel(),
  session: createMockPrismaModel(),
  review: createMockPrismaModel(),
  notification: createMockPrismaModel(),
  file: createMockPrismaModel(),
  admin: createMockPrismaModel(),
  moderator: createMockPrismaModel(),
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
