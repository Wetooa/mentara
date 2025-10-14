import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { RevenueAnalyticsService } from './shared/revenue-analytics.service';
import { PrismaService } from '../providers/prisma-client.provider';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, RevenueAnalyticsService, PrismaService],
  exports: [AnalyticsService, RevenueAnalyticsService],
})
export class AnalyticsModule {}
