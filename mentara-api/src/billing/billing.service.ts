import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { 
  Subscription, 
  SubscriptionStatus, 
  SubscriptionTier, 
  BillingCycle, 
  PaymentStatus, 
  PaymentMethodType,
  InvoiceStatus,
  DiscountType 
} from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

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
      throw new NotFoundException(`Subscription plan with ID ${data.planId} not found`);
    }

    const amount = data.billingCycle === BillingCycle.YEARLY 
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
        status: data.trialStart ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
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

  async updateSubscription(userId: string, data: {
    planId?: string;
    billingCycle?: BillingCycle;
    status?: SubscriptionStatus;
    defaultPaymentMethodId?: string;
  }) {
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
        throw new NotFoundException(`Subscription plan with ID ${data.planId} not found`);
      }
      
      updateData.tier = plan.tier;
      updateData.amount = data.billingCycle === BillingCycle.YEARLY 
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

  async cancelSubscription(userId: string, reason?: string) {
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

  async updatePlan(id: string, data: Partial<{
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: any;
    limits: any;
    trialDays: number;
    isActive: boolean;
  }>) {
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
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async updatePaymentMethod(id: string, data: Partial<{
    isDefault: boolean;
    isActive: boolean;
  }>) {
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
      if (metadata?.failureMessage) updateData.failureMessage = metadata.failureMessage;
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
    const total = data.subtotal + (data.taxAmount || 0) - (data.discountAmount || 0);
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

  async markInvoiceAsPaid(id: string, paymentId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    const totalPaid = invoice.payments
      .filter(p => p.status === PaymentStatus.SUCCEEDED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: totalPaid >= Number(invoice.total) ? InvoiceStatus.PAID : InvoiceStatus.OPEN,
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

    if (discount.maxUsesPerUser && discount.redemptions.length >= discount.maxUsesPerUser) {
      throw new BadRequestException('You have already used this discount code');
    }

    if (discount.minAmount && amount < Number(discount.minAmount)) {
      throw new BadRequestException(`Minimum amount of ${discount.minAmount} required`);
    }

    return discount;
  }

  async redeemDiscount(discountId: string, userId: string, amountSaved: number) {
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
      const lastNumber = parseInt(lastInvoice.number.split('-')[2]);
      nextNumber = lastNumber + 1;
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
}