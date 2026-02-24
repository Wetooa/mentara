import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DashboardAggregationJob } from './dashboard-aggregation.job';
import { AnalyticsComputationJob } from './analytics-computation.job';
import { PrismaService } from '../providers/prisma-client.provider';
import { DashboardModule } from '../dashboard/dashboard.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    forwardRef(() => DashboardModule),
    forwardRef(() => AnalyticsModule),
  ],
  providers: [
    DashboardAggregationJob,
    AnalyticsComputationJob,
    PrismaService,
  ],
})
export class JobsModule {}

