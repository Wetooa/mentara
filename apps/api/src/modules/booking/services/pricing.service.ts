import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

export interface PricingConfig {
  defaultHourlyRate: number;
  initialConsultationMultiplier: number;
  cancellationPolicies: {
    fullRefundHours: number;
    partialRefundHours: number;
    partialRefundPercentage: number;
  };
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);
  private readonly config: PricingConfig = {
    defaultHourlyRate: 100,
    initialConsultationMultiplier: 1.5,
    cancellationPolicies: {
      fullRefundHours: 24,
      partialRefundHours: 12,
      partialRefundPercentage: 50,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate session price based on therapist's hourly rate and duration
   */
  async calculateSessionPrice(
    therapistId: string,
    duration: number,
    isInitialConsultation: boolean = false,
    txClient?: any,
  ): Promise<number> {
    const client = txClient ?? this.prisma;

    // Get therapist's hourly rate
    const therapist = await client.therapist.findUnique({
      where: { userId: therapistId },
      select: { hourlyRate: true },
    });

    const hourlyRate = therapist?.hourlyRate ?? this.config.defaultHourlyRate;
    const basePrice = (duration / 60) * hourlyRate;

    // Apply multiplier for initial consultation
    const multiplier = isInitialConsultation
      ? this.config.initialConsultationMultiplier
      : 1.0;

    const finalPrice = basePrice * multiplier;

    this.logger.debug(
      `Calculated session price: ${finalPrice} (rate: ${hourlyRate}, duration: ${duration}min, initial: ${isInitialConsultation})`,
    );

    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate refund amount based on cancellation notice
   */
  calculateRefundPercentage(cancellationNoticeHours: number): number {
    const { fullRefundHours, partialRefundHours, partialRefundPercentage } =
      this.config.cancellationPolicies;

    if (cancellationNoticeHours >= fullRefundHours) {
      return 100; // Full refund
    }

    if (cancellationNoticeHours >= partialRefundHours) {
      return partialRefundPercentage; // Partial refund (50%)
    }

    return 0; // No refund
  }

  /**
   * Get cancellation policy details
   */
  getCancellationPolicy() {
    return {
      fullRefund: {
        minimumNoticeHours: this.config.cancellationPolicies.fullRefundHours,
        refundPercentage: 100,
        description: 'Cancel 24+ hours in advance for full refund',
      },
      partialRefund: {
        minimumNoticeHours: this.config.cancellationPolicies.partialRefundHours,
        refundPercentage:
          this.config.cancellationPolicies.partialRefundPercentage,
        description: 'Cancel 12-24 hours in advance for 50% refund',
      },
      noRefund: {
        minimumNoticeHours: 0,
        refundPercentage: 0,
        description:
          'Cancellations less than 12 hours before session are non-refundable',
      },
    };
  }
}
