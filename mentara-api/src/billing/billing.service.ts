import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  SubscriptionStatus,
  SubscriptionTier,
  BillingCycle,
  PaymentStatus,
  PaymentMethodType,
  InvoiceStatus,
  DiscountType,
} from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // Subscription Management
  async createSubscription(data: {
    userId: string;
    planId: string;
    billingCycle?: BillingCycle;
    defaultPaymentMethodId?: string;
    trialStart?: Date;
    trialEnd?: Date;
  }) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan) {
      throw new NotFoundException(
        `Subscription plan with ID ${data.planId} not found`,
      );
    }

    const amount =
      data.billingCycle === BillingCycle.YEARLY
        ? plan.yearlyPrice || plan.monthlyPrice
        : plan.monthlyPrice;

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();

    if (data.billingCycle === BillingCycle.YEARLY) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    return this.prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        tier: plan.tier,
        billingCycle: data.billingCycle || BillingCycle.MONTHLY,
        amount,
        currentPeriodStart,
        currentPeriodEnd,
        trialStart: data.trialStart,
        trialEnd: data.trialEnd,
        defaultPaymentMethodId: data.defaultPaymentMethodId,
        status: data.trialStart
          ? SubscriptionStatus.TRIALING
          : SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
        defaultPaymentMethod: true,
      },
    });
  }

  async findUserSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
        defaultPaymentMethod: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async updateSubscription(
    userId: string,
    data: {
      planId?: string;
      billingCycle?: BillingCycle;
      status?: SubscriptionStatus;
      defaultPaymentMethodId?: string;
    },
  ) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    const updateData: any = { ...data };

    // If changing plan, update amount
    if (data.planId) {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: data.planId },
      });
      if (!plan) {
        throw new NotFoundException(
          `Subscription plan with ID ${data.planId} not found`,
        );
      }

      updateData.tier = plan.tier;
      updateData.amount =
        data.billingCycle === BillingCycle.YEARLY
          ? plan.yearlyPrice || plan.monthlyPrice
          : plan.monthlyPrice;
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: updateData,
      include: {
        plan: true,
        defaultPaymentMethod: true,
      },
    });
  }

  async cancelSubscription(userId: string) {
    return this.updateSubscription(userId, {
      status: SubscriptionStatus.CANCELED,
    });
  }

  // Subscription Plans
  async createSubscriptionPlan(data: {
    name: string;
    description?: string;
    tier: SubscriptionTier;
    monthlyPrice: number;
    yearlyPrice?: number;
    features: any;
    limits: any;
    trialDays?: number;
  }) {
    return this.prisma.subscriptionPlan.create({
      data,
    });
  }

  async findAllPlans(isActive = true) {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive },
      orderBy: { monthlyPrice: 'asc' },
    });
  }

  async updatePlan(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      monthlyPrice: number;
      yearlyPrice: number;
      features: any;
      limits: any;
      trialDays: number;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  // Payment Methods
  async createPaymentMethod(data: {
    userId: string;
    type: PaymentMethodType;
    cardLast4?: string;
    cardBrand?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
    stripePaymentMethodId?: string;
    isDefault?: boolean;
  }) {
    // If this is set as default, unset other default payment methods
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: data.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data,
    });
  }

  async findUserPaymentMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updatePaymentMethod(
    id: string,
    data: Partial<{
      isDefault: boolean;
      isActive: boolean;
    }>,
  ) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
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

  async deletePaymentMethod(id: string) {
    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Payments
  async createPayment(data: {
    amount: number;
    currency?: string;
    paymentMethodId?: string;
    subscriptionId?: string;
    invoiceId?: string;
    meetingId?: string;
    description?: string;
    providerPaymentId?: string;
  }) {
    return this.prisma.payment.create({
      data: {
        ...data,
        status: PaymentStatus.PENDING,
        currency: data.currency || 'USD',
      },
      include: {
        paymentMethod: true,
        subscription: true,
        invoice: true,
      },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, metadata?: any) {
    const updateData: any = { status };

    if (status === PaymentStatus.SUCCEEDED) {
      updateData.processedAt = new Date();
    } else if (status === PaymentStatus.FAILED) {
      updateData.failedAt = new Date();
      if (metadata?.failureCode) updateData.failureCode = metadata.failureCode;
      if (metadata?.failureMessage)
        updateData.failureMessage = metadata.failureMessage;
    }

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }

  async findPayments(
    subscriptionId?: string,
    status?: PaymentStatus,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};

    if (subscriptionId) where.subscriptionId = subscriptionId;
    if (status) where.status = status;
    if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    return this.prisma.payment.findMany({
      where,
      include: {
        paymentMethod: true,
        subscription: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Invoices
  async createInvoice(data: {
    subscriptionId: string;
    subtotal: number;
    taxAmount?: number;
    discountAmount?: number;
    dueDate: Date;
    billingAddress?: any;
  }) {
    const total =
      data.subtotal + (data.taxAmount || 0) - (data.discountAmount || 0);
    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.invoice.create({
      data: {
        ...data,
        number: invoiceNumber,
        total,
        amountDue: total,
        status: InvoiceStatus.OPEN,
      },
      include: {
        subscription: true,
        lineItems: true,
      },
    });
  }

  async findInvoices(subscriptionId?: string, status?: InvoiceStatus) {
    const where: any = {};

    if (subscriptionId) where.subscriptionId = subscriptionId;
    if (status) where.status = status;

    return this.prisma.invoice.findMany({
      where,
      include: {
        subscription: {
          include: { user: true },
        },
        lineItems: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markInvoiceAsPaid(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const totalPaid = invoice.payments
      .filter((p) => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status:
          totalPaid >= Number(invoice.total)
            ? InvoiceStatus.PAID
            : InvoiceStatus.OPEN,
        amountPaid: totalPaid,
        paidAt: totalPaid >= Number(invoice.total) ? new Date() : null,
      },
    });
  }

  // Discounts
  async createDiscount(data: {
    code?: string;
    name: string;
    description?: string;
    type: DiscountType;
    percentOff?: number;
    amountOff?: number;
    validFrom?: Date;
    validUntil?: Date;
    maxUses?: number;
    maxUsesPerUser?: number;
    applicableTiers?: SubscriptionTier[];
    minAmount?: number;
  }) {
    return this.prisma.discount.create({
      data: {
        ...data,
        validFrom: data.validFrom || new Date(),
      },
    });
  }

  async validateDiscount(code: string, userId: string, amount: number) {
    const discount = await this.prisma.discount.findUnique({
      where: { code },
      include: {
        redemptions: {
          where: { userId },
        },
      },
    });

    if (!discount || !discount.isActive) {
      throw new BadRequestException('Invalid discount code');
    }

    const now = new Date();
    if (discount.validUntil && discount.validUntil < now) {
      throw new BadRequestException('Discount code has expired');
    }

    if (discount.maxUses && discount.currentUses >= discount.maxUses) {
      throw new BadRequestException('Discount code usage limit reached');
    }

    if (
      discount.maxUsesPerUser &&
      discount.redemptions.length >= discount.maxUsesPerUser
    ) {
      throw new BadRequestException('You have already used this discount code');
    }

    const minAmountNum = Number(discount.minAmount);
    if (discount.minAmount && !isNaN(minAmountNum) && amount < minAmountNum) {
      throw new BadRequestException(
        `Minimum amount of ${String(discount.minAmount)} required`,
      );
    }

    return discount;
  }

  async redeemDiscount(
    discountId: string,
    userId: string,
    amountSaved: number,
  ) {
    await this.prisma.$transaction(async (tx) => {
      // Create redemption record
      await tx.discountRedemption.create({
        data: {
          discountId,
          userId,
          amountSaved,
        },
      });

      // Update discount usage count
      await tx.discount.update({
        where: { id: discountId },
        data: {
          currentUses: { increment: 1 },
        },
      });
    });
  }

  // Usage Records
  async recordUsage(data: {
    subscriptionId: string;
    feature: string;
    quantity: number;
    unit: string;
    usageDate?: Date;
    metadata?: any;
  }) {
    return this.prisma.usageRecord.create({
      data: {
        ...data,
        usageDate: data.usageDate || new Date(),
      },
    });
  }

  async getUsageRecords(
    subscriptionId: string,
    feature?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = { subscriptionId };

    if (feature) where.feature = feature;
    if (startDate) where.usageDate = { ...where.usageDate, gte: startDate };
    if (endDate) where.usageDate = { ...where.usageDate, lte: endDate };

    return this.prisma.usageRecord.findMany({
      where,
      orderBy: { usageDate: 'desc' },
    });
  }

  // Helper methods
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        number: { startsWith: `INV-${year}-` },
      },
      orderBy: { number: 'desc' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const parts = lastInvoice.number.split('-');
      if (parts.length >= 3 && parts[2]) {
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    return `INV-${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  async getBillingStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate) where.createdAt = { ...where.createdAt, gte: startDate };
    if (endDate) where.createdAt = { ...where.createdAt, lte: endDate };

    const [
      totalRevenue,
      activeSubscriptions,
      trialSubscriptions,
      canceledSubscriptions,
      subscriptionsByTier,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.SUCCEEDED },
        _sum: { amount: true },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.TRIALING },
      }),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.CANCELED },
      }),
      this.prisma.subscription.groupBy({
        by: ['tier'],
        where: { status: SubscriptionStatus.ACTIVE },
        _count: { tier: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      trialSubscriptions,
      canceledSubscriptions,
      subscriptionsByTier,
    };
  }

  // ===== ADVANCED SUBSCRIPTION MANAGEMENT =====

  /**
   * Upgrade or downgrade subscription with prorated billing
   */
  async changeSubscriptionPlan(
    userId: string,
    newPlanId: string,
    options: {
      billingCycle?: BillingCycle;
      prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
      effectiveDate?: Date;
    } = {}
  ) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    const newPlan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      throw new NotFoundException(`Plan ${newPlanId} not found`);
    }

    const effectiveDate = options.effectiveDate || new Date();
    const newBillingCycle = options.billingCycle || subscription.billingCycle;
    const newAmount = newBillingCycle === BillingCycle.YEARLY 
      ? newPlan.yearlyPrice || newPlan.monthlyPrice 
      : newPlan.monthlyPrice;

    // Calculate proration if needed
    let prorationAmount = 0;
    if (options.prorationBehavior !== 'none') {
      prorationAmount = await this.calculateProration(
        subscription,
        Number(newAmount),
        effectiveDate
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update subscription
      const updatedSubscription = await tx.subscription.update({
        where: { userId },
        data: {
          planId: newPlanId,
          tier: newPlan.tier,
          billingCycle: newBillingCycle,
          amount: newAmount,
          metadata: {
            ...subscription.metadata,
            lastPlanChange: effectiveDate.toISOString(),
            previousPlanId: subscription.planId,
          },
        },
        include: {
          plan: true,
          defaultPaymentMethod: true,
        },
      });

      // Create proration invoice if needed
      if (prorationAmount !== 0 && options.prorationBehavior !== 'none') {
        await this.createProrationInvoice(tx, subscription.id, prorationAmount, effectiveDate);
      }

      // Emit event
      this.eventEmitter.emit('subscription.plan.changed', {
        userId,
        subscriptionId: subscription.id,
        previousPlanId: subscription.planId,
        newPlanId,
        prorationAmount,
        effectiveDate,
      });

      this.logger.log(`User ${userId} changed subscription plan from ${subscription.planId} to ${newPlanId}`);

      return updatedSubscription;
    });
  }

  /**
   * Pause subscription (keep it active but stop billing)
   */
  async pauseSubscription(
    userId: string,
    options: {
      pauseUntil?: Date;
      reason?: string;
    } = {}
  ) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException('Can only pause active subscriptions');
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.PAUSED,
        metadata: {
          ...subscription.metadata,
          pausedAt: new Date().toISOString(),
          pauseUntil: options.pauseUntil?.toISOString(),
          pauseReason: options.reason,
          previousStatus: subscription.status,
        },
      },
      include: {
        plan: true,
        defaultPaymentMethod: true,
      },
    });

    this.eventEmitter.emit('subscription.paused', {
      userId,
      subscriptionId: subscription.id,
      pauseUntil: options.pauseUntil,
      reason: options.reason,
    });

    this.logger.log(`Subscription ${subscription.id} paused for user ${userId}`);

    return updatedSubscription;
  }

  /**
   * Resume paused subscription
   */
  async resumeSubscription(userId: string) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new BadRequestException('Can only resume paused subscriptions');
    }

    const metadata = subscription.metadata as any;
    const previousStatus = metadata?.previousStatus || SubscriptionStatus.ACTIVE;

    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: previousStatus,
        metadata: {
          ...metadata,
          resumedAt: new Date().toISOString(),
          pausedAt: undefined,
          pauseUntil: undefined,
          pauseReason: undefined,
          previousStatus: undefined,
        },
      },
      include: {
        plan: true,
        defaultPaymentMethod: true,
      },
    });

    this.eventEmitter.emit('subscription.resumed', {
      userId,
      subscriptionId: subscription.id,
    });

    this.logger.log(`Subscription ${subscription.id} resumed for user ${userId}`);

    return updatedSubscription;
  }

  /**
   * Schedule subscription cancellation at period end
   */
  async scheduleSubscriptionCancellation(
    userId: string,
    options: {
      reason?: string;
      feedback?: string;
      cancelAtPeriodEnd?: boolean;
    } = {}
  ) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    const cancelAtPeriodEnd = options.cancelAtPeriodEnd ?? true;
    const cancelDate = cancelAtPeriodEnd ? subscription.currentPeriodEnd : new Date();

    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: cancelAtPeriodEnd ? subscription.status : SubscriptionStatus.CANCELED,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        endedAt: cancelAtPeriodEnd ? subscription.currentPeriodEnd : new Date(),
        cancelReason: options.reason,
        canceledBy: userId,
        metadata: {
          ...subscription.metadata,
          scheduledCancellation: cancelAtPeriodEnd,
          cancellationFeedback: options.feedback,
          cancellationScheduledAt: new Date().toISOString(),
        },
      },
      include: {
        plan: true,
        defaultPaymentMethod: true,
      },
    });

    this.eventEmitter.emit('subscription.cancellation.scheduled', {
      userId,
      subscriptionId: subscription.id,
      cancelDate,
      reason: options.reason,
      feedback: options.feedback,
      cancelAtPeriodEnd,
    });

    this.logger.log(`Subscription cancellation scheduled for user ${userId}, effective ${cancelDate}`);

    return updatedSubscription;
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string, newPaymentMethodId?: string) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    if (subscription.status !== SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Can only reactivate canceled subscriptions');
    }

    // Reset period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (subscription.billingCycle === BillingCycle.YEARLY) {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        canceledAt: null,
        endedAt: null,
        cancelReason: null,
        defaultPaymentMethodId: newPaymentMethodId || subscription.defaultPaymentMethodId,
        metadata: {
          ...subscription.metadata,
          reactivatedAt: new Date().toISOString(),
          scheduledCancellation: false,
        },
      },
      include: {
        plan: true,
        defaultPaymentMethod: true,
      },
    });

    this.eventEmitter.emit('subscription.reactivated', {
      userId,
      subscriptionId: subscription.id,
    });

    this.logger.log(`Subscription ${subscription.id} reactivated for user ${userId}`);

    return updatedSubscription;
  }

  /**
   * Apply discount to subscription
   */
  async applyDiscountToSubscription(
    userId: string,
    discountCode: string
  ) {
    const subscription = await this.findUserSubscription(userId);
    if (!subscription) {
      throw new NotFoundException(`Subscription for user ${userId} not found`);
    }

    const discount = await this.validateDiscount(discountCode, userId, Number(subscription.amount));
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === DiscountType.PERCENTAGE && discount.percentOff) {
      discountAmount = Number(subscription.amount) * (Number(discount.percentOff) / 100);
    } else if (discount.type === DiscountType.FIXED_AMOUNT && discount.amountOff) {
      discountAmount = Number(discount.amountOff);
    }

    const newAmount = Math.max(0, Number(subscription.amount) - discountAmount);

    return await this.prisma.$transaction(async (tx) => {
      // Update subscription amount
      const updatedSubscription = await tx.subscription.update({
        where: { userId },
        data: {
          amount: newAmount,
          metadata: {
            ...subscription.metadata,
            appliedDiscounts: [
              ...(subscription.metadata?.appliedDiscounts || []),
              {
                discountId: discount.id,
                code: discountCode,
                appliedAt: new Date().toISOString(),
                originalAmount: subscription.amount,
                discountAmount,
                newAmount,
              },
            ],
          },
        },
        include: {
          plan: true,
          defaultPaymentMethod: true,
        },
      });

      // Record discount redemption
      await this.redeemDiscount(discount.id, userId, discountAmount);

      this.eventEmitter.emit('subscription.discount.applied', {
        userId,
        subscriptionId: subscription.id,
        discountCode,
        discountAmount,
        newAmount,
      });

      return updatedSubscription;
    });
  }

  /**
   * Process subscription renewal
   */
  async processSubscriptionRenewal(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        defaultPaymentMethod: true,
        user: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    // Check if renewal is due
    const now = new Date();
    if (subscription.currentPeriodEnd > now) {
      throw new BadRequestException('Subscription renewal not yet due');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Create invoice for next period
      const nextPeriodStart = subscription.currentPeriodEnd;
      const nextPeriodEnd = new Date(nextPeriodStart);

      if (subscription.billingCycle === BillingCycle.YEARLY) {
        nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
      } else {
        nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
      }

      const invoice = await this.createInvoice({
        subscriptionId,
        subtotal: Number(subscription.amount),
        dueDate: nextPeriodStart,
      });

      // Update subscription period
      const updatedSubscription = await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          currentPeriodStart: nextPeriodStart,
          currentPeriodEnd: nextPeriodEnd,
          metadata: {
            ...subscription.metadata,
            lastRenewal: now.toISOString(),
          },
        },
        include: {
          plan: true,
          defaultPaymentMethod: true,
        },
      });

      this.eventEmitter.emit('subscription.renewed', {
        userId: subscription.userId,
        subscriptionId,
        invoiceId: invoice.id,
        nextPeriodStart,
        nextPeriodEnd,
      });

      return { subscription: updatedSubscription, invoice };
    });
  }

  /**
   * Get subscription usage analytics
   */
  async getSubscriptionUsageAnalytics(
    subscriptionId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription ${subscriptionId} not found`);
    }

    const where: any = { subscriptionId };
    if (startDate) where.usageDate = { ...where.usageDate, gte: startDate };
    if (endDate) where.usageDate = { ...where.usageDate, lte: endDate };

    const [usageRecords, usageByFeature, totalUsage] = await Promise.all([
      this.prisma.usageRecord.findMany({
        where,
        orderBy: { usageDate: 'desc' },
        take: 100,
      }),
      this.prisma.usageRecord.groupBy({
        by: ['feature'],
        where,
        _sum: { quantity: true },
        _count: { quantity: true },
      }),
      this.prisma.usageRecord.aggregate({
        where,
        _sum: { quantity: true },
        _count: { quantity: true },
      }),
    ]);

    const planLimits = subscription.plan.limits as any;

    return {
      subscription,
      usageRecords,
      usageByFeature: usageByFeature.map(usage => ({
        feature: usage.feature,
        totalQuantity: usage._sum.quantity || 0,
        recordCount: usage._count.quantity,
        limit: planLimits?.[usage.feature] || null,
        utilizationPercentage: planLimits?.[usage.feature] 
          ? ((usage._sum.quantity || 0) / planLimits[usage.feature]) * 100 
          : null,
      })),
      totalUsage: {
        totalQuantity: totalUsage._sum.quantity || 0,
        totalRecords: totalUsage._count.quantity,
      },
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private async calculateProration(
    subscription: any,
    newAmount: number,
    effectiveDate: Date
  ): Promise<number> {
    const currentAmount = Number(subscription.amount);
    const periodStart = subscription.currentPeriodStart;
    const periodEnd = subscription.currentPeriodEnd;
    
    const totalPeriodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((periodEnd.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (remainingDays <= 0) return 0;

    const dailyCurrentRate = currentAmount / totalPeriodDays;
    const dailyNewRate = newAmount / totalPeriodDays;
    
    const prorationAmount = (dailyNewRate - dailyCurrentRate) * remainingDays;
    
    return Math.round(prorationAmount * 100) / 100; // Round to 2 decimal places
  }

  private async createProrationInvoice(
    tx: any,
    subscriptionId: string,
    prorationAmount: number,
    effectiveDate: Date
  ) {
    if (prorationAmount === 0) return;

    const invoiceNumber = await this.generateInvoiceNumber();
    const description = prorationAmount > 0 
      ? 'Proration charge for plan upgrade'
      : 'Proration credit for plan downgrade';

    return await tx.invoice.create({
      data: {
        subscriptionId,
        number: invoiceNumber,
        status: InvoiceStatus.OPEN,
        subtotal: Math.abs(prorationAmount),
        total: Math.abs(prorationAmount),
        amountDue: prorationAmount > 0 ? prorationAmount : 0,
        dueDate: effectiveDate,
        lineItems: {
          create: {
            description,
            quantity: 1,
            unitPrice: prorationAmount,
            amount: prorationAmount,
          },
        },
      },
    });
  }
}
