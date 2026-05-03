import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsComputationJob } from './analytics-computation.job';
import { PrismaService } from '../providers/prisma-client.provider';
import { AnalyticsService } from '../analytics/analytics.service';

describe('AnalyticsComputationJob', () => {
  let job: AnalyticsComputationJob;

  beforeEach(async () => {
    const mockPrisma = {};
    const mockAnalytics = {
      getDashboardMetrics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsComputationJob,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AnalyticsService, useValue: mockAnalytics },
      ],
    }).compile();

    job = module.get(AnalyticsComputationJob);
  });

  it('should be defined', () => {
    expect(job).toBeDefined();
  });
});
