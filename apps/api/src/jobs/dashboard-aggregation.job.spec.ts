import { Test, TestingModule } from '@nestjs/testing';
import { DashboardAggregationJob } from './dashboard-aggregation.job';
import { PrismaService } from '../providers/prisma-client.provider';
import { DashboardService } from '../dashboard/dashboard.service';

describe('DashboardAggregationJob', () => {
  let job: DashboardAggregationJob;

  beforeEach(async () => {
    const mockPrisma = {
      client: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const mockDashboard = {
      getClientDashboardSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardAggregationJob,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DashboardService, useValue: mockDashboard },
      ],
    }).compile();

    job = module.get(DashboardAggregationJob);
  });

  it('should be defined', () => {
    expect(job).toBeDefined();
  });
});
