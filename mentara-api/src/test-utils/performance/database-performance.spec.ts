/**
 * Database Performance Testing Suite
 *
 * Tests database query performance, connection pooling, and data handling
 * under various load conditions.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { TestDataFactory } from '../test-data.factory';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';

interface QueryPerformanceResult {
  queryName: string;
  executionTime: number;
  rowsAffected: number;
  memoryUsage: number;
  success: boolean;
  error?: string;
}

interface ConnectionPoolMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  connectionLatency: number;
  queryQueueLength: number;
}

describe('Database Performance Testing', () => {
  let prisma: PrismaService;
  let testFactory: TestDataFactory;
  const performanceResults: QueryPerformanceResult[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    testFactory = new TestDataFactory(prisma);
  });

  afterAll(async () => {
    // Generate comprehensive performance report
    await generateDatabasePerformanceReport();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanDatabase();
  });

  describe('Query Performance Analysis', () => {
    it('should measure basic CRUD operation performance', async () => {
      console.log('📊 Testing basic CRUD operations...');

      // Test CREATE performance
      const createResult = await measureQueryPerformance(
        'User Creation',
        async () => {
          const users = [];
          for (let i = 0; i < 100; i++) {
            users.push(
              await testFactory.createUser({
                email: `user${i}@example.com`,
                firstName: `User${i}`,
                lastName: 'Test',
              }),
            );
          }
          return users.length;
        },
      );

      // Test READ performance
      const readResult = await measureQueryPerformance(
        'User Query (All)',
        async () => {
          const users = await prisma.user.findMany({
            include: {
              client: true,
              therapist: true,
            },
          });
          return users.length;
        },
      );

      // Test UPDATE performance
      const updateResult = await measureQueryPerformance(
        'User Update (Batch)',
        async () => {
          const result = await prisma.user.updateMany({
            where: {
              email: {
                contains: '@example.com',
              },
            },
            data: {
              firstName: 'Updated',
            },
          });
          return result.count;
        },
      );

      // Test DELETE performance
      const deleteResult = await measureQueryPerformance(
        'User Deletion (Batch)',
        async () => {
          const result = await prisma.user.deleteMany({
            where: {
              email: {
                contains: '@example.com',
              },
            },
          });
          return result.count;
        },
      );

      // Assertions
      expect(createResult.success).toBe(true);
      expect(readResult.success).toBe(true);
      expect(updateResult.success).toBe(true);
      expect(deleteResult.success).toBe(true);

      // Performance expectations
      expect(createResult.executionTime).toBeLessThan(5000); // 5 seconds for 100 users
      expect(readResult.executionTime).toBeLessThan(2000); // 2 seconds for read
      expect(updateResult.executionTime).toBeLessThan(1000); // 1 second for batch update
      expect(deleteResult.executionTime).toBeLessThan(1000); // 1 second for batch delete

      console.log(`CRUD Performance Summary:
        CREATE: ${createResult.executionTime.toFixed(2)}ms for ${createResult.rowsAffected} records
        READ: ${readResult.executionTime.toFixed(2)}ms for ${readResult.rowsAffected} records
        UPDATE: ${updateResult.executionTime.toFixed(2)}ms for ${updateResult.rowsAffected} records
        DELETE: ${deleteResult.executionTime.toFixed(2)}ms for ${deleteResult.rowsAffected} records`);
    }, 30000);

    it('should test complex query performance', async () => {
      console.log('🔍 Testing complex query performance...');

      // Set up test data
      const users = [];
      const therapists = [];

      for (let i = 0; i < 50; i++) {
        const user = await testFactory.createUser();
        users.push(user);

        if (i < 10) {
          const therapist = await testFactory.createTherapist({
            userId: user.id,
            specializations: ['depression', 'anxiety'],
            hourlyRate: 100 + i * 10,
          });
          therapists.push(therapist);
        }
      }

      // Complex join query
      const complexJoinResult = await measureQueryPerformance(
        'Complex Join Query',
        async () => {
          const result = await prisma.user.findMany({
            where: {
              therapist: {
                isNot: null,
              },
            },
            include: {
              therapist: {
                include: {
                  clients: {
                    include: {
                      user: true,
                      preAssessment: true,
                    },
                  },
                  application: true,
                },
              },
              client: {
                include: {
                  therapist: {
                    include: {
                      user: true,
                    },
                  },
                  preAssessment: true,
                },
              },
            },
          });
          return result.length;
        },
      );

      // Aggregation query
      const aggregationResult = await measureQueryPerformance(
        'Aggregation Query',
        async () => {
          const stats = await prisma.therapist.aggregate({
            _avg: {
              hourlyRate: true,
            },
            _count: {
              id: true,
            },
            _max: {
              hourlyRate: true,
            },
            _min: {
              hourlyRate: true,
            },
          });
          return 1; // Single result
        },
      );

      // Search query with filters
      const searchResult = await measureQueryPerformance(
        'Search with Filters',
        async () => {
          const result = await prisma.therapist.findMany({
            where: {
              AND: [
                {
                  specializations: {
                    hasSome: ['depression', 'anxiety'],
                  },
                },
                {
                  hourlyRate: {
                    gte: 100,
                    lte: 200,
                  },
                },
                {
                  user: {
                    isActive: true,
                  },
                },
              ],
            },
            include: {
              user: true,
              clients: {
                take: 5,
              },
            },
            orderBy: {
              hourlyRate: 'asc',
            },
          });
          return result.length;
        },
      );

      // Assertions
      expect(complexJoinResult.success).toBe(true);
      expect(aggregationResult.success).toBe(true);
      expect(searchResult.success).toBe(true);

      // Performance expectations for complex queries
      expect(complexJoinResult.executionTime).toBeLessThan(3000);
      expect(aggregationResult.executionTime).toBeLessThan(1000);
      expect(searchResult.executionTime).toBeLessThan(2000);

      console.log(`Complex Query Performance:
        Complex Join: ${complexJoinResult.executionTime.toFixed(2)}ms
        Aggregation: ${aggregationResult.executionTime.toFixed(2)}ms
        Search/Filter: ${searchResult.executionTime.toFixed(2)}ms`);
    }, 30000);

    it('should test pagination performance', async () => {
      console.log('📄 Testing pagination performance...');

      // Create test data
      for (let i = 0; i < 200; i++) {
        await testFactory.createUser({
          email: `page-user-${i}@example.com`,
          firstName: `PageUser${i}`,
        });
      }

      const pageSize = 20;
      const pageTests = [1, 5, 10]; // Test different page numbers

      for (const pageNumber of pageTests) {
        const paginationResult = await measureQueryPerformance(
          `Pagination Page ${pageNumber}`,
          async () => {
            const skip = (pageNumber - 1) * pageSize;
            const users = await prisma.user.findMany({
              skip,
              take: pageSize,
              where: {
                email: {
                  contains: 'page-user',
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });
            return users.length;
          },
        );

        expect(paginationResult.success).toBe(true);
        expect(paginationResult.executionTime).toBeLessThan(1000); // Should be fast

        console.log(
          `Page ${pageNumber}: ${paginationResult.executionTime.toFixed(2)}ms`,
        );
      }
    }, 20000);
  });

  describe('Connection Pool Performance', () => {
    it('should handle concurrent database connections efficiently', async () => {
      console.log('🔗 Testing connection pool performance...');

      const connectionTests: Promise<QueryPerformanceResult>[] = [];
      const concurrentQueries = 20;

      // Create multiple concurrent database operations
      for (let i = 0; i < concurrentQueries; i++) {
        connectionTests.push(
          measureQueryPerformance(`Concurrent Query ${i}`, async () => {
            // Simulate different types of database operations
            const operations = [
              () => prisma.user.count(),
              () => prisma.user.findFirst(),
              () => prisma.therapist.findMany({ take: 5 }),
              () =>
                prisma.user.findMany({ take: 10, include: { client: true } }),
            ];

            const operation = operations[i % operations.length];
            const result = await operation();
            return Array.isArray(result) ? result.length : 1;
          }),
        );
      }

      const results = await Promise.allSettled(connectionTests);

      const successfulQueries = results.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const failedQueries = results.length - successfulQueries;

      console.log(`Connection Pool Test Results:
        Concurrent Queries: ${concurrentQueries}
        Successful: ${successfulQueries}
        Failed: ${failedQueries}
        Success Rate: ${((successfulQueries / concurrentQueries) * 100).toFixed(2)}%`);

      // Most queries should succeed
      expect(successfulQueries).toBeGreaterThan(concurrentQueries * 0.8); // 80% success rate
      expect(failedQueries).toBeLessThan(concurrentQueries * 0.2); // Less than 20% failures
    }, 15000);

    it('should handle transaction performance under load', async () => {
      console.log('💳 Testing transaction performance...');

      const transactionResult = await measureQueryPerformance(
        'Complex Transaction',
        async () => {
          const results = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
              data: {
                email: 'transaction-test@example.com',
                firstName: 'Transaction',
                lastName: 'Test',
                clerkId: `transaction-${Date.now()}`,
              },
            });

            // Create client profile
            const client = await tx.client.create({
              data: {
                userId: user.id,
                needsTherapistRecommendations: true,
              },
            });

            // Create pre-assessment
            const preAssessment = await tx.preAssessment.create({
              data: {
                userId: user.id,
                questionnaires: {
                  PHQ9: [1, 2, 1, 0, 2, 1, 3, 2, 1],
                  GAD7: [2, 1, 3, 2, 1, 2, 3],
                },
                scores: {
                  depression: 15,
                  anxiety: 12,
                },
                severityLevels: {
                  depression: 'moderate',
                  anxiety: 'mild',
                },
                status: 'COMPLETED',
              },
            });

            return { user, client, preAssessment };
          });

          return 1; // One transaction completed
        },
      );

      expect(transactionResult.success).toBe(true);
      expect(transactionResult.executionTime).toBeLessThan(2000); // 2 seconds max for complex transaction

      console.log(
        `Transaction Performance: ${transactionResult.executionTime.toFixed(2)}ms`,
      );
    }, 10000);
  });

  describe('Data Volume Performance', () => {
    it('should handle large dataset queries efficiently', async () => {
      console.log('📈 Testing large dataset performance...');

      // Create large dataset
      const batchSize = 100;
      const batches = 5; // Total: 500 records

      for (let batch = 0; batch < batches; batch++) {
        const users = [];
        for (let i = 0; i < batchSize; i++) {
          users.push({
            email: `bulk-user-${batch}-${i}@example.com`,
            firstName: `BulkUser${batch}${i}`,
            lastName: 'Test',
            clerkId: `bulk-${batch}-${i}-${Date.now()}`,
          });
        }

        await prisma.user.createMany({
          data: users,
        });
      }

      // Test large dataset queries
      const largeQueryResult = await measureQueryPerformance(
        'Large Dataset Query',
        async () => {
          const users = await prisma.user.findMany({
            where: {
              email: {
                contains: 'bulk-user',
              },
            },
            include: {
              client: true,
            },
          });
          return users.length;
        },
      );

      // Test large dataset aggregation
      const aggregationResult = await measureQueryPerformance(
        'Large Dataset Aggregation',
        async () => {
          const count = await prisma.user.count({
            where: {
              email: {
                contains: 'bulk-user',
              },
            },
          });
          return count;
        },
      );

      expect(largeQueryResult.success).toBe(true);
      expect(aggregationResult.success).toBe(true);
      expect(largeQueryResult.executionTime).toBeLessThan(5000); // 5 seconds for large query
      expect(aggregationResult.executionTime).toBeLessThan(2000); // 2 seconds for aggregation

      console.log(`Large Dataset Performance:
        Query: ${largeQueryResult.executionTime.toFixed(2)}ms for ${largeQueryResult.rowsAffected} records
        Aggregation: ${aggregationResult.executionTime.toFixed(2)}ms`);
    }, 30000);
  });

  // Helper Functions
  async function measureQueryPerformance(
    queryName: string,
    queryFunction: () => Promise<number>,
  ): Promise<QueryPerformanceResult> {
    const memoryBefore = process.memoryUsage().heapUsed / 1024 / 1024;
    const startTime = performance.now();

    let result: QueryPerformanceResult;

    try {
      const rowsAffected = await queryFunction();
      const endTime = performance.now();
      const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

      result = {
        queryName,
        executionTime: endTime - startTime,
        rowsAffected,
        memoryUsage: memoryAfter - memoryBefore,
        success: true,
      };
    } catch (error) {
      const endTime = performance.now();
      const memoryAfter = process.memoryUsage().heapUsed / 1024 / 1024;

      result = {
        queryName,
        executionTime: endTime - startTime,
        rowsAffected: 0,
        memoryUsage: memoryAfter - memoryBefore,
        success: false,
        error: error.message,
      };
    }

    performanceResults.push(result);
    return result;
  }

  async function cleanDatabase(): Promise<void> {
    await prisma.$transaction([
      prisma.preAssessment.deleteMany(),
      prisma.client.deleteMany(),
      prisma.therapist.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  }

  async function generateDatabasePerformanceReport(): Promise<void> {
    const report = {
      summary: {
        totalQueries: performanceResults.length,
        successfulQueries: performanceResults.filter((r) => r.success).length,
        failedQueries: performanceResults.filter((r) => !r.success).length,
        averageExecutionTime:
          performanceResults.reduce((sum, r) => sum + r.executionTime, 0) /
          performanceResults.length,
        slowestQuery: performanceResults.reduce((max, r) =>
          r.executionTime > max.executionTime ? r : max,
        ),
        fastestQuery: performanceResults.reduce((min, r) =>
          r.executionTime < min.executionTime ? r : min,
        ),
        totalMemoryUsage: performanceResults.reduce(
          (sum, r) => sum + r.memoryUsage,
          0,
        ),
      },
      performanceThresholds: {
        maxAcceptableTime: 5000, // 5 seconds
        queriesExceedingThreshold: performanceResults.filter(
          (r) => r.executionTime > 5000,
        ),
      },
      detailedResults: performanceResults,
      recommendations: generatePerformanceRecommendations(),
    };

    const reportsDir = path.join(__dirname, '../../../test-reports/database');
    await fs.promises.mkdir(reportsDir, { recursive: true });

    const filePath = path.join(reportsDir, 'database-performance-report.json');
    await fs.promises.writeFile(filePath, JSON.stringify(report, null, 2));

    console.log(`📊 Database performance report saved to: ${filePath}`);
  }

  function generatePerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    const slowQueries = performanceResults.filter(
      (r) => r.executionTime > 2000,
    );
    if (slowQueries.length > 0) {
      recommendations.push(
        `Optimize slow queries: ${slowQueries.map((q) => q.queryName).join(', ')}`,
      );
    }

    const memoryIntensive = performanceResults.filter(
      (r) => r.memoryUsage > 10,
    );
    if (memoryIntensive.length > 0) {
      recommendations.push(
        `Review memory usage for: ${memoryIntensive.map((q) => q.queryName).join(', ')}`,
      );
    }

    const failedQueries = performanceResults.filter((r) => !r.success);
    if (failedQueries.length > 0) {
      recommendations.push(
        `Fix failing queries: ${failedQueries.map((q) => q.queryName).join(', ')}`,
      );
    }

    return recommendations;
  }
});
