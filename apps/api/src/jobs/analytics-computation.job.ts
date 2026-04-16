import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../providers/prisma-client.provider';
import { AnalyticsService } from '../analytics/analytics.service';

/**
 * Background job to pre-compute analytics data
 * Runs hourly to keep analytics data fresh
 */
@Injectable()
export class AnalyticsComputationJob {
  private readonly logger = new Logger(AnalyticsComputationJob.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AnalyticsService))
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Pre-compute platform analytics
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async preComputePlatformAnalytics() {
    this.logger.log('Starting platform analytics computation job...');

    try {
      // Compute analytics for different time ranges
      const timeRanges = [
        { name: 'today', start: new Date(new Date().setHours(0, 0, 0, 0)), end: new Date() },
        {
          name: 'week',
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        {
          name: 'month',
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        {
          name: 'year',
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      ];

      const results = await Promise.allSettled(
        timeRanges.map(async (range) => {
          try {
            const analytics = await this.analyticsService.getPlatformAnalytics(
              range.start,
              range.end,
            );

            return { range: range.name, success: true };
          } catch (error) {
            this.logger.error(`Failed to compute analytics for ${range.name}:`, error);
            return { range: range.name, success: false, error };
          }
        }),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Platform analytics computation completed: ${successful} successful, ${failed} failed`,
      );
    } catch (error) {
      this.logger.error('Error in platform analytics computation job:', error);
    }
  }

  /**
   * Pre-compute user growth stats
   * Runs every 6 hours
   */
  @Cron('0 */6 * * *') // Every 6 hours
  async preComputeUserGrowthStats() {
    this.logger.log('Starting user growth stats computation job...');

    try {
      const timeRanges = [
        {
          name: 'month',
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        {
          name: 'year',
          start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      ];

      const results = await Promise.allSettled(
        timeRanges.map(async (range) => {
          try {
            const growthStats = await this.analyticsService.getUserGrowthStats(
              range.start,
              range.end,
            );


            return { range: range.name, success: true };
          } catch (error) {
            this.logger.error(`Failed to compute user growth for ${range.name}:`, error);
            return { range: range.name, success: false, error };
          }
        }),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      this.logger.log(
        `User growth stats computation completed: ${successful}/${timeRanges.length} successful`,
      );
    } catch (error) {
      this.logger.error('Error in user growth stats computation job:', error);
    }
  }
}

