import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardAggregationJob } from './dashboard-aggregation.job';
import { AnalyticsComputationJob } from './analytics-computation.job';
import { CacheWarmingJob } from './cache-warming.job';
import { PrismaService } from '../providers/prisma-client.provider';
import { CacheModule } from '../cache/cache.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule,
    forwardRef(() => DashboardModule),
    forwardRef(() => AnalyticsModule),
  ],
  providers: [
    DashboardAggregationJob,
    AnalyticsComputationJob,
    CacheWarmingJob,
    PrismaService,
  ],
})
export class JobsModule {}

