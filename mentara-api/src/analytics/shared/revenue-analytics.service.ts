import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { buildNestedDateFilter } from './date-filter.helpers';

@Injectable()
export class RevenueAnalyticsService {
  private readonly logger = new Logger(RevenueAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const nestedProcessedAt = buildNestedDateFilter(
        startDate,
        endDate,
        'processedAt',
      );

      const [
        totalRevenue,
        successfulPayments,
        failedPayments,
        refundedPayments,
        pendingPayments,
        paymentsByTherapist,
        averageTransactionValue,
      ] = await Promise.all([
        // Total revenue from completed payments
        this.prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
          _sum: { amount: true },
        }),

        // Count of successful payments
        this.prisma.payment.count({
          where: {
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
        }),

        // Count of failed payments
        this.prisma.payment.count({
          where: {
            status: 'FAILED',
            ...nestedProcessedAt,
          },
        }),

        // Count of refunded payments
        this.prisma.payment.count({
          where: {
            status: 'REFUNDED',
            ...nestedProcessedAt,
          },
        }),

        // Count of pending payments
        this.prisma.payment.count({
          where: {
            status: 'PENDING',
          },
        }),

        // Revenue by therapist
        this.prisma.payment.groupBy({
          by: ['therapistId'],
          where: {
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
          _sum: { amount: true },
          _count: { _all: true },
          orderBy: {
            _sum: {
              amount: 'desc',
            },
          },
          take: 10,
        }),

        // Average transaction value
        this.prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
          _avg: { amount: true },
        }),
      ]);

      const totalPayments =
        successfulPayments + failedPayments + refundedPayments;
      const successRate =
        totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

      // Get top earning therapists with their details
      const topTherapists = await Promise.all(
        paymentsByTherapist.slice(0, 5).map(async (t) => {
          const therapist = await this.prisma.therapist.findUnique({
            where: { userId: t.therapistId },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          });

          return {
            therapistId: t.therapistId,
            name: therapist
              ? `${therapist.user.firstName} ${therapist.user.lastName}`
              : 'Unknown',
            revenue: Number(t._sum.amount) || 0,
            sessionCount: t._count,
          };
        }),
      );

      this.logger.log(
        `Retrieved revenue analytics: $${totalRevenue._sum.amount || 0} from ${successfulPayments} payments`,
      );

      return {
        summary: {
          totalRevenue: Number(totalRevenue._sum.amount) || 0,
          currency: 'USD',
          successfulPayments,
          failedPayments,
          refundedPayments,
          pendingPayments,
          totalPayments,
          successRate: Math.round(successRate * 100) / 100,
          averageTransactionValue:
            Number(averageTransactionValue._avg.amount) || 0,
        },
        topTherapists,
        period: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get revenue analytics:', error);
      throw error;
    }
  }

  async getTherapistRevenue(
    therapistId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const nestedProcessedAt = buildNestedDateFilter(
        startDate,
        endDate,
        'processedAt',
      );

      const [revenue, paymentCount, averagePayment] = await Promise.all([
        this.prisma.payment.aggregate({
          where: {
            therapistId,
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
          _sum: { amount: true },
        }),

        this.prisma.payment.count({
          where: {
            therapistId,
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
        }),

        this.prisma.payment.aggregate({
          where: {
            therapistId,
            status: 'COMPLETED',
            ...nestedProcessedAt,
          },
          _avg: { amount: true },
        }),
      ]);

      return {
        therapistId,
        totalRevenue: Number(revenue._sum.amount) || 0,
        sessionCount: paymentCount,
        averageSessionValue: Number(averagePayment._avg.amount) || 0,
        currency: 'USD',
      };
    } catch (error) {
      this.logger.error(
        `Failed to get therapist revenue for ${therapistId}:`,
        error,
      );
      throw error;
    }
  }
}
