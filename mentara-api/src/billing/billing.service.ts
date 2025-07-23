import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PaymentStatus,
  PaymentMethodType,
} from '@prisma/client';

/**
 * Educational Billing Service for Mental Health Platform
 * 
 * This service provides a simplified, educational payment processing system
 * suitable for a school project. It simulates real payment flows without
 * processing actual money.
 * 
 * Features:
 * - Mock payment processing for therapy sessions
 * - Payment method management
 * - Educational payment flows
 * - Realistic payment failures and retries
 */

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ===== PAYMENT METHODS =====

  /**
   * Create a new payment method for a user
   */
  async createPaymentMethod(data: {
    userId: string;
    type: PaymentMethodType;
    cardLast4?: string;
    cardBrand?: string;
    isDefault?: boolean;
  }) {
    this.logger.log(`Creating payment method for user ${data.userId}`);

    // If this is set as default, unset other default payment methods
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: data.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        userId: data.userId,
        type: data.type,
        cardLast4: data.cardLast4,
        cardBrand: data.cardBrand,
        isDefault: data.isDefault || false,
      },
    });

    this.eventEmitter.emit('payment_method.created', {
      userId: data.userId,
      paymentMethodId: paymentMethod.id,
      type: data.type,
    });

    return paymentMethod;
  }

  /**
   * Get all payment methods for a user
   */
  async getUserPaymentMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Update payment method settings
   */
  async updatePaymentMethod(
    id: string,
    data: { isDefault?: boolean }
  ) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method ${id} not found`);
    }

    // If setting as default, unset other defaults for this user
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: paymentMethod.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete (soft delete) a payment method
   */
  async deletePaymentMethod(id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method ${id} not found`);
    }

    // Cannot delete the only payment method if user has pending payments
    const otherMethods = await this.prisma.paymentMethod.count({
      where: { 
        userId: paymentMethod.userId,
        id: { not: id }
      },
    });

    const pendingPayments = await this.prisma.payment.count({
      where: {
        OR: [
          { clientId: paymentMethod.userId },
          { therapistId: paymentMethod.userId }
        ],
        status: PaymentStatus.PENDING,
      },
    });

    if (otherMethods === 0 && pendingPayments > 0) {
      throw new BadRequestException(
        'Cannot delete the only payment method with pending payments'
      );
    }

    await this.prisma.paymentMethod.delete({
      where: { id },
    });

    this.eventEmitter.emit('payment_method.deleted', {
      userId: paymentMethod.userId,
      paymentMethodId: id,
    });

    return { success: true };
  }

  /**
   * Create automatic mock payment for booking (used when payment is mocked/automatic)
   * This creates a COMPLETED payment record without requiring payment method validation
   */
  async createAutomaticMockPayment(data: {
    clientId: string;
    therapistId: string;
    meetingId: string;
    amount: number;
    currency?: string;
    description?: string;
  }, tx?: any) {
    this.logger.log(
      `Creating automatic mock payment: ${data.amount} ${data.currency || 'USD'} for meeting ${data.meetingId}`
    );

    const prismaClient = tx || this.prisma;

    // Create completed payment record (mock payment is always successful)
    const payment = await prismaClient.payment.create({
      data: {
        amount: data.amount,
        currency: data.currency || 'USD',
        status: 'COMPLETED', // Mock payment is always successful
        clientId: data.clientId,
        therapistId: data.therapistId,
        meetingId: data.meetingId,
        paymentMethodId: null, // No payment method needed for mock
        processedAt: new Date(),
        failureReason: null,
      },
      include: {
        client: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        therapist: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
      },
    });

    this.logger.log(`Mock payment created successfully: ${payment.id}`);
    return payment;
  }

  // ===== PAYMENT PROCESSING =====

  /**
   * Process a payment for a therapy session
   */
  async processSessionPayment(data: {
    clientId: string;
    therapistId: string;
    meetingId?: string;
    amount: number;
    currency?: string;
    paymentMethodId: string;
    description?: string;
  }) {
    this.logger.log(
      `Processing session payment: ${data.amount} ${data.currency || 'USD'} from client ${data.clientId} to therapist ${data.therapistId}`
    );

    // Validate payment method belongs to client
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        id: data.paymentMethodId,
        userId: data.clientId,
      },
    });

    if (!paymentMethod) {
      throw new BadRequestException('Invalid payment method');
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        amount: data.amount,
        currency: data.currency || 'USD',
        status: PaymentStatus.PENDING,
        clientId: data.clientId,
        therapistId: data.therapistId,
        meetingId: data.meetingId,
        paymentMethodId: data.paymentMethodId,
        failureReason: null,
      },
      include: {
        client: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        therapist: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        paymentMethod: true,
      },
    });

    // Process payment asynchronously
    this.processPaymentAsync(payment.id).catch((error) => {
      this.logger.error(`Failed to process payment ${payment.id}:`, error);
    });

    return payment;
  }

  /**
   * Asynchronously process the payment with mock payment gateway
   */
  private async processPaymentAsync(paymentId: string) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        client: { 
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        therapist: { 
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        paymentMethod: true,
      },
    });

    if (!payment) {
      this.logger.error(`Payment ${paymentId} not found during processing`);
      return;
    }

    // Mock payment processing with realistic success/failure rates
    const success = this.mockPaymentGateway(payment);

    if (success) {
      await this.handlePaymentSuccess(payment);
    } else {
      await this.handlePaymentFailure(payment);
    }
  }

  /**
   * Mock payment gateway simulation
   * Returns true for success, false for failure
   */
  private mockPaymentGateway(payment: any): boolean {
    // Simulate different failure scenarios based on card details
    const cardLast4 = payment.paymentMethod?.cardLast4;
    
    // Test card numbers for specific scenarios
    if (cardLast4) {
      switch (cardLast4) {
        case '0002': // Always decline
          return false;
        case '0004': // Always decline with insufficient funds
          return false;
        case '0008': // Always decline with expired card
          return false;
        case '0001': // Always succeed
          return true;
        default:
          // Random success/failure (90% success rate)
          return Math.random() > 0.1;
      }
    }

    // Default: 90% success rate
    return Math.random() > 0.1;
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(payment: any) {
    this.logger.log(`Payment ${payment.id} processed successfully`);

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        processedAt: new Date(),
      },
    });

    // Calculate platform fee (e.g., 5% platform commission)
    const platformFeeRate = 0.05;
    const platformFee = Number(payment.amount) * platformFeeRate;
    const therapistAmount = Number(payment.amount) - platformFee;

    // Emit payment success event
    this.eventEmitter.emit('payment.succeeded', {
      paymentId: payment.id,
      clientId: payment.clientId,
      therapistId: payment.therapistId,
      amount: Number(payment.amount),
      currency: payment.currency,
      platformFee,
      therapistAmount,
      meetingId: payment.meetingId,
    });

    return updatedPayment;
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(payment: any) {
    const failureReasons = [
      'Insufficient funds',
      'Card declined',
      'Expired card',
      'Invalid card number',
      'Network error',
    ];

    const failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
    
    this.logger.warn(`Payment ${payment.id} failed: ${failureReason}`);

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        failureReason,
      },
    });

    // Emit payment failure event
    this.eventEmitter.emit('payment.failed', {
      paymentId: payment.id,
      clientId: payment.clientId,
      therapistId: payment.therapistId,
      amount: Number(payment.amount),
      currency: payment.currency,
      failureReason,
      meetingId: payment.meetingId,
    });

    return updatedPayment;
  }

  // ===== PAYMENT QUERIES =====

  /**
   * Get payment by ID
   */
  async getPayment(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        client: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        therapist: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        paymentMethod: true,
        meeting: {
          select: { startTime: true, endTime: true, title: true }
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  /**
   * Get payments for a user (as client or therapist)
   */
  async getUserPayments(
    userId: string,
    options: {
      role?: 'client' | 'therapist';
      status?: PaymentStatus;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const where: any = {};

    if (options.role === 'client') {
      where.clientId = userId;
    } else if (options.role === 'therapist') {
      where.therapistId = userId;
    } else {
      where.OR = [
        { clientId: userId },
        { therapistId: userId },
      ];
    }

    if (options.status) {
      where.status = options.status;
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        client: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        therapist: {
          select: { 
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        paymentMethod: true,
        meeting: {
          select: { startTime: true, endTime: true, title: true }
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  }

  /**
   * Retry a failed payment
   */
  async retryPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    if (payment.status !== PaymentStatus.FAILED) {
      throw new BadRequestException('Can only retry failed payments');
    }

    // Reset payment to pending and retry
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PENDING,
        failureReason: null,
        failedAt: null,
      },
    });

    // Process payment again
    this.processPaymentAsync(paymentId).catch((error) => {
      this.logger.error(`Failed to retry payment ${paymentId}:`, error);
    });

    return { success: true, message: 'Payment retry initiated' };
  }

  // ===== ANALYTICS & REPORTING =====

  /**
   * Get payment statistics for therapists
   */
  async getTherapistPaymentStats(
    therapistId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: any = {
      therapistId,
      status: PaymentStatus.COMPLETED,
    };

    if (startDate) {
      where.processedAt = { ...where.processedAt, gte: startDate };
    }
    if (endDate) {
      where.processedAt = { ...where.processedAt, lte: endDate };
    }

    const [totalPayments, stats] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true },
      }),
    ]);

    const totalRevenue = Number(stats._sum.amount || 0);
    const averageSessionRate = Number(stats._avg.amount || 0);
    const platformFeeRate = 0.05;
    const platformFees = totalRevenue * platformFeeRate;
    const netEarnings = totalRevenue - platformFees;

    return {
      totalSessions: totalPayments,
      totalRevenue,
      averageSessionRate,
      platformFees,
      netEarnings,
      period: {
        startDate,
        endDate,
      },
    };
  }

  /**
   * Get platform billing statistics (admin only)
   */
  async getPlatformStats(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: startDate };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate };
    }

    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      revenueStats,
    ] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.count({ 
        where: { ...where, status: PaymentStatus.COMPLETED }
      }),
      this.prisma.payment.count({ 
        where: { ...where, status: PaymentStatus.FAILED }
      }),
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(revenueStats._sum.amount || 0);
    const platformFeeRate = 0.05;
    const platformRevenue = totalRevenue * platformFeeRate;
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      successRate,
      totalRevenue,
      platformRevenue,
      therapistPayouts: totalRevenue - platformRevenue,
      period: {
        startDate,
        endDate,
      },
    };
  }
}