import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../providers/prisma-client.provider';
import { DashboardService } from '../dashboard/dashboard.service';

/**
 * Background job to pre-calculate dashboard aggregations
 * Runs every 15 minutes to keep dashboard data fresh
 */
@Injectable()
export class DashboardAggregationJob {
  private readonly logger = new Logger(DashboardAggregationJob.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => DashboardService))
    private readonly dashboardService: DashboardService,
  ) {}

  /**
   * Pre-calculate client dashboard data for active clients
   * Runs every 15 minutes
   */
  @Cron('0 */15 * * * *')
  async preCalculateClientDashboards() {
    this.logger.log('Starting client dashboard aggregation job...');

    try {
      // Get active clients (limit to recent active ones to avoid overwhelming the system)
      const activeClients = await this.prisma.client.findMany({
        where: {
          user: {
            isActive: true,
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
            },
          },
        },
        select: {
          userId: true,
        },
        take: 100, // Process 100 clients at a time
      });

      this.logger.log(`Pre-calculating dashboards for ${activeClients.length} clients`);

      // Pre-calculate dashboard data for each client
      const results = await Promise.allSettled(
        activeClients.map(async (client) => {
          try {
            const dashboardData = await this.dashboardService.getClientDashboardData(
              client.userId,
            );

            return { userId: client.userId, success: true };
          } catch (error) {
            this.logger.error(
              `Failed to pre-calculate dashboard for client ${client.userId}:`,
              error,
            );
            return { userId: client.userId, success: false, error };
          }
        }),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Client dashboard aggregation completed: ${successful} successful, ${failed} failed`,
      );
    } catch (error) {
      this.logger.error('Error in client dashboard aggregation job:', error);
    }
  }

  /**
   * Pre-calculate therapist dashboard data for active therapists
   * Runs every 15 minutes
   */
  @Cron('0 */15 * * * *')
  async preCalculateTherapistDashboards() {
    this.logger.log('Starting therapist dashboard aggregation job...');

    try {
      // Get active therapists
      const activeTherapists = await this.prisma.therapist.findMany({
        where: {
          status: 'APPROVED',
          user: {
            isActive: true,
            lastLoginAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
            },
          },
        },
        select: {
          userId: true,
        },
        take: 100, // Process 100 therapists at a time
      });

      this.logger.log(`Pre-calculating dashboards for ${activeTherapists.length} therapists`);

      // Pre-calculate dashboard data for each therapist
      const results = await Promise.allSettled(
        activeTherapists.map(async (therapist) => {
          try {
            const dashboardData = await this.dashboardService.getTherapistDashboardData(
              therapist.userId,
            );

            return { userId: therapist.userId, success: true };
          } catch (error) {
            this.logger.error(
              `Failed to pre-calculate dashboard for therapist ${therapist.userId}:`,
              error,
            );
            return { userId: therapist.userId, success: false, error };
          }
        }),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Therapist dashboard aggregation completed: ${successful} successful, ${failed} failed`,
      );
    } catch (error) {
      this.logger.error('Error in therapist dashboard aggregation job:', error);
    }
  }
}

