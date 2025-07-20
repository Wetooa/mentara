import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

interface CleanupStats {
  tablesProcessed: number;
  recordsDeleted: number;
  errors: string[];
  duration: number;
}

export class DatabaseTestSetup {
  private static container: StartedPostgreSqlContainer;
  private static prismaService: PrismaService;
  private static cleanupStats: CleanupStats[] = [];

  static async startContainer(): Promise<StartedPostgreSqlContainer> {
    if (!this.container) {
      this.container = await new PostgreSqlContainer('postgres:15')
        .withDatabase('mentara_test')
        .withUsername('test_user')
        .withPassword('test_password')
        .withExposedPorts(5432)
        .withEnvironment({
          POSTGRES_INITDB_ARGS: '--auth-host=scram-sha-256',
        })
        .start();
    }
    return this.container;
  }

  static async setupTestDatabase(): Promise<PrismaService> {
    const container = await this.startContainer();

    // Set environment variable for test database
    process.env.DATABASE_URL = container.getConnectionUri();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    this.prismaService = module.get<PrismaService>(PrismaService);

    // Run migrations
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
    });

    return this.prismaService;
  }

  /**
   * Enhanced database cleanup with comprehensive table coverage
   * Includes all 18+ Prisma models and their relationships
   */
  static async cleanupDatabase(): Promise<CleanupStats> {
    const startTime = Date.now();
    const stats: CleanupStats = {
      tablesProcessed: 0,
      recordsDeleted: 0,
      errors: [],
      duration: 0,
    };

    if (!this.prismaService) {
      stats.errors.push('PrismaService not initialized');
      return stats;
    }

    // Comprehensive table cleanup order respecting all foreign key constraints
    // Order is critical: child tables first, parent tables last
    const tableCleanupOrder = [
      // Messaging system (deepest dependencies)
      'TypingIndicator',
      'MessageReaction',
      'MessageReadReceipt',
      'Message',
      'ConversationParticipant',
      'Conversation',
      'UserBlock',

      // Community content (posts, comments, replies)
      'ReplyHeart',
      'Reply',
      'CommentHeart',
      'Comment',
      'PostHeart',
      'Post',
      'Membership',
      'Room',
      'RoomGroup',
      'Community',

      // Analytics and matching
      'RecommendationFeedback',
      'AlgorithmPerformance',
      'ClientCompatibility',
      'MatchHistory',
      'MatchingWeight',

      // Reviews and ratings
      'ReviewHelpful',
      'Review',

      // Sessions and meetings
      'SessionLog',
      'Meeting',
      'TherapyProgress',
      'TherapistAvailability',

      // Assessments and worksheets
      'Assessment',
      'MentalHealthIndicator',
      'Worksheet',
      'PreAssessment',

      // File management
      'FileDownload',
      'FileShare',
      'FileVersion',
      'File',

      // Billing and subscriptions
      'DiscountRedemption',
      'PaymentMethod',
      'Subscription',

      // Notifications and activities
      'Notification',
      'NotificationSettings',
      'UserActivity',
      'AuditLog',

      // Client-therapist relationships
      'ClientPreference',
      'ClientMedicalHistory',
      'ClientTherapist',

      // Role-specific profiles
      'Therapist',
      'Client',
      'Moderator',
      'ModeratorCommunity',
      'Admin',

      // Core user table (must be last)
      'User',
    ];

    // Process each table with enhanced error handling and statistics
    for (const tableName of tableCleanupOrder) {
      try {
        // Get count before deletion for statistics
        const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
        const countResult =
          await this.prismaService.$queryRawUnsafe<[{ count: string }]>(
            countQuery,
          );
        const recordCount = parseInt(countResult[0]?.count || '0', 10);

        if (recordCount > 0) {
          // Use TRUNCATE for better performance and to reset sequences
          await this.prismaService.$executeRawUnsafe(
            `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
          );
          stats.recordsDeleted += recordCount;
        }

        stats.tablesProcessed++;
      } catch (error) {
        // Log error but continue with cleanup
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Only log as error if it's not a "table doesn't exist" error
        if (!errorMessage.includes('does not exist')) {
          stats.errors.push(`${tableName}: ${errorMessage}`);
        }

        // Try alternative cleanup method for problematic tables
        try {
          await this.prismaService.$executeRawUnsafe(
            `DELETE FROM "${tableName}";`,
          );
          stats.tablesProcessed++;
        } catch (alternativeError) {
          const altErrorMessage =
            alternativeError instanceof Error
              ? alternativeError.message
              : String(alternativeError);
          if (!altErrorMessage.includes('does not exist')) {
            stats.errors.push(`${tableName} (alternative): ${altErrorMessage}`);
          }
        }
      }
    }

    // Reset all sequences to ensure consistent test data
    try {
      const sequenceResetQueries = [
        "SELECT setval(pg_get_serial_sequence('\"User\"', 'id'), 1, false);",
        "SELECT setval(pg_get_serial_sequence('\"Community\"', 'id'), 1, false);",
        "SELECT setval(pg_get_serial_sequence('\"Conversation\"', 'id'), 1, false);",
        "SELECT setval(pg_get_serial_sequence('\"Meeting\"', 'id'), 1, false);",
      ];

      for (const query of sequenceResetQueries) {
        try {
          await this.prismaService.$executeRawUnsafe(query);
        } catch {
          // Ignore sequence reset errors (sequence might not exist)
        }
      }
    } catch {
      // Ignore sequence reset errors
    }

    stats.duration = Date.now() - startTime;
    this.cleanupStats.push(stats);

    // Log cleanup statistics in debug mode
    if (process.env.DEBUG_TESTS === 'true') {
      console.log(`🧹 Database Cleanup Complete:
        📊 Tables Processed: ${stats.tablesProcessed}
        🗑️  Records Deleted: ${stats.recordsDeleted}
        ⏱️  Duration: ${stats.duration}ms
        ❌ Errors: ${stats.errors.length}
      `);

      if (stats.errors.length > 0) {
        console.log('Cleanup Errors:', stats.errors);
      }
    }

    return stats;
  }

  /**
   * Enhanced cleanup for specific test scenarios
   */
  static async cleanupMessagingData(): Promise<void> {
    if (!this.prismaService) return;

    const messagingTables = [
      'TypingIndicator',
      'MessageReaction',
      'MessageReadReceipt',
      'Message',
      'ConversationParticipant',
      'Conversation',
      'UserBlock',
    ];

    for (const table of messagingTables) {
      try {
        await this.prismaService.$executeRawUnsafe(
          `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
        );
      } catch {
        // Ignore errors for non-existent tables
      }
    }
  }

  static async cleanupAnalyticsData(): Promise<void> {
    if (!this.prismaService) return;

    const analyticsTables = [
      'RecommendationFeedback',
      'AlgorithmPerformance',
      'ClientCompatibility',
      'MatchHistory',
      'MatchingWeight',
    ];

    for (const table of analyticsTables) {
      try {
        await this.prismaService.$executeRawUnsafe(
          `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
        );
      } catch {
        // Ignore errors for non-existent tables
      }
    }
  }

  static async cleanupCommunityData(): Promise<void> {
    if (!this.prismaService) return;

    const communityTables = [
      'ReplyHeart',
      'Reply',
      'CommentHeart',
      'Comment',
      'PostHeart',
      'Post',
      'Membership',
      'Room',
      'RoomGroup',
      'Community',
    ];

    for (const table of communityTables) {
      try {
        await this.prismaService.$executeRawUnsafe(
          `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`,
        );
      } catch {
        // Ignore errors for non-existent tables
      }
    }
  }

  /**
   * Verify database connectivity and schema integrity
   */
  static async verifyDatabaseHealth(): Promise<{
    isConnected: boolean;
    schemaValid: boolean;
    tableCount: number;
    errors: string[];
  }> {
    const health = {
      isConnected: false,
      schemaValid: false,
      tableCount: 0,
      errors: [] as string[],
    };

    try {
      // Test basic connectivity
      await this.prismaService.$queryRaw`SELECT 1`;
      health.isConnected = true;

      // Count tables in the database
      const tableCountResult = await this.prismaService.$queryRaw<
        [{ count: bigint }]
      >`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      health.tableCount = Number(tableCountResult[0]?.count || 0);

      // Verify key tables exist
      const keyTables = ['User', 'Client', 'Therapist', 'Meeting', 'Community'];
      for (const table of keyTables) {
        try {
          await this.prismaService.$queryRawUnsafe(
            `SELECT 1 FROM "${table}" LIMIT 1`,
          );
        } catch (error) {
          health.errors.push(`Missing or inaccessible table: ${table}`);
        }
      }

      health.schemaValid = health.errors.length === 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      health.errors.push(`Database connection error: ${errorMessage}`);
    }

    return health;
  }

  /**
   * Get cleanup statistics for performance monitoring
   */
  static getCleanupStatistics(): CleanupStats[] {
    return [...this.cleanupStats];
  }

  /**
   * Reset cleanup statistics
   */
  static resetCleanupStatistics(): void {
    this.cleanupStats = [];
  }

  static async stopContainer(): Promise<void> {
    if (this.container) {
      await this.container.stop();
    }
  }

  static getPrismaService(): PrismaService {
    return this.prismaService;
  }

  /**
   * Enhanced container management with health checks
   */
  static async restartContainer(): Promise<void> {
    if (this.container) {
      await this.container.stop();
      this.container = null as any;
    }
    await this.startContainer();
  }

  /**
   * Performance monitoring for test database operations
   */
  static async measureDatabasePerformance<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<{ result: T; duration: number; memoryUsage: number }> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = await operation();
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      const performance = {
        result,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
      };

      if (process.env.TRACK_TEST_PERFORMANCE === 'true') {
        console.log(`📊 ${operationName} Performance:
          ⏱️  Duration: ${performance.duration}ms
          🧠 Memory: ${(performance.memoryUsage / 1024 / 1024).toFixed(2)}MB
        `);
      }

      return performance;
    } catch (error) {
      const endTime = Date.now();
      console.error(
        `❌ ${operationName} failed after ${endTime - startTime}ms:`,
        error,
      );
      throw error;
    }
  }
}
