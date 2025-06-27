import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

export class DatabaseTestSetup {
  private static container: StartedPostgreSqlContainer;
  private static prismaService: PrismaService;

  static async startContainer(): Promise<StartedPostgreSqlContainer> {
    if (!this.container) {
      this.container = await new PostgreSqlContainer('postgres:15')
        .withDatabase('mentara_test')
        .withUsername('test_user')
        .withPassword('test_password')
        .withExposedPorts(5432)
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
    const { execSync } = require('child_process');
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
    });

    return this.prismaService;
  }

  static async cleanupDatabase(): Promise<void> {
    if (this.prismaService) {
      // Clean all tables in the correct order to respect foreign key constraints
      const tableNames = [
        'PostHeart',
        'Reply',
        'CommentHeart',
        'Comment',
        'Post',
        'Membership',
        'Meeting',
        'TherapistAvailability',
        'ClientTherapist',
        'Therapist',
        'Client',
        'PreAssessment',
        'User',
        'Community',
        'RoomGroup',
        'Room',
      ];

      for (const tableName of tableNames) {
        try {
          await this.prismaService.$executeRawUnsafe(
            `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
          );
        } catch (error) {
          // Ignore if table doesn't exist
        }
      }
    }
  }

  static async stopContainer(): Promise<void> {
    if (this.container) {
      await this.container.stop();
    }
  }

  static getPrismaService(): PrismaService {
    return this.prismaService;
  }
}
