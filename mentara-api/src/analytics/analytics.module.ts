import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { RevenueAnalyticsService } from './shared/revenue-analytics.service';
import { ClientInsightsService } from './services/client-insights.service';
import { PrismaService } from '../providers/prisma-client.provider';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    RevenueAnalyticsService,
    ClientInsightsService,
    PrismaService,
  ],
  exports: [
    AnalyticsService,
    RevenueAnalyticsService,
    ClientInsightsService,
  ],
})
export class AnalyticsModule {}
