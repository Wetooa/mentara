// Integration test exports
export * from './auth.integration.spec';
export * from './booking.integration.spec';
export * from './messaging.integration.spec';

// Test utilities for integration tests
export const INTEGRATION_TEST_CONFIG = {
  timeout: 30000, // 30 seconds for integration tests
  database: {
    cleanup: true,
    seed: false,
  },
  api: {
    baseUrl: 'http://localhost',
    timeout: 10000,
  },
};

export interface IntegrationTestSetup {
  app: any;
  prisma: any;
  moduleRef: any;
}

export class IntegrationTestHelper {
  static setupTestHeaders(userId: string, role: string = 'client') {
    return {
      'x-user-id': userId,
      'x-user-role': role,
      'Content-Type': 'application/json',
    };
  }

  static async waitForAsync(ms: number = 100) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async retryRequest(
    requestFn: () => Promise<any>,
    maxRetries: number = 3,
  ) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await this.waitForAsync(100 * (i + 1)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }
}
