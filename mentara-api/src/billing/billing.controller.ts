import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/decorators/current-user-role.decorator';
import {
  BillingCycle,
  SubscriptionStatus,
  SubscriptionTier,
  PaymentMethodType,
  PaymentStatus,
  InvoiceStatus,
  DiscountType,
} from '@prisma/client';

@Controller('billing')
@UseGuards(ClerkAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Subscription endpoints
  @Post('subscriptions')
  createSubscription(
    @Body()
    body: {
      planId: string;
      billingCycle?: BillingCycle;
      defaultPaymentMethodId?: string;
      trialStart?: string;
      trialEnd?: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.createSubscription({
      ...body,
      userId,
      trialStart: body.trialStart ? new Date(body.trialStart) : undefined,
      trialEnd: body.trialEnd ? new Date(body.trialEnd) : undefined,
    });
  }

  @Get('subscriptions/me')
  getMySubscription(@CurrentUserId() userId: string) {
    return this.billingService.findUserSubscription(userId);
  }

  @Patch('subscriptions/me')
  updateMySubscription(
    @Body()
    body: {
      planId?: string;
      billingCycle?: BillingCycle;
      defaultPaymentMethodId?: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.updateSubscription(userId, body);
  }

  @Post('subscriptions/me/cancel')
  cancelMySubscription(
    @Body() body: { reason?: string },
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.cancelSubscription(userId, body.reason);
  }

  // Subscription Plans
  @Get('plans')
  getAllPlans(@Query('isActive') isActive?: string) {
    return this.billingService.findAllPlans(
      isActive !== undefined ? isActive === 'true' : true,
    );
  }

  @Post('plans')
  createPlan(
    @Body()
    body: {
      name: string;
      description?: string;
      tier: SubscriptionTier;
      monthlyPrice: number;
      yearlyPrice?: number;
      features: any;
      limits: any;
      trialDays?: number;
    },
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.billingService.createSubscriptionPlan(body);
  }

  @Patch('plans/:id')
  updatePlan(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      monthlyPrice?: number;
      yearlyPrice?: number;
      features?: any;
      limits?: any;
      trialDays?: number;
      isActive?: boolean;
    },
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.billingService.updatePlan(id, body);
  }

  // Payment Methods
  @Post('payment-methods')
  createPaymentMethod(
    @Body()
    body: {
      type: PaymentMethodType;
      cardLast4?: string;
      cardBrand?: string;
      cardExpMonth?: number;
      cardExpYear?: number;
      stripePaymentMethodId?: string;
      isDefault?: boolean;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.createPaymentMethod({
      ...body,
      userId,
    });
  }

  @Get('payment-methods')
  getMyPaymentMethods(@CurrentUserId() userId: string) {
    return this.billingService.findUserPaymentMethods(userId);
  }

  @Patch('payment-methods/:id')
  updatePaymentMethod(
    @Param('id') id: string,
    @Body()
    body: {
      isDefault?: boolean;
      isActive?: boolean;
    },
  ) {
    return this.billingService.updatePaymentMethod(id, body);
  }

  @Delete('payment-methods/:id')
  deletePaymentMethod(@Param('id') id: string) {
    return this.billingService.deletePaymentMethod(id);
  }

  // Payments
  @Post('payments')
  createPayment(
    @Body()
    body: {
      amount: number;
      currency?: string;
      paymentMethodId?: string;
      subscriptionId?: string;
      invoiceId?: string;
      meetingId?: string;
      description?: string;
      providerPaymentId?: string;
    },
  ) {
    return this.billingService.createPayment(body);
  }

  @Get('payments')
  getPayments(
    @Query('subscriptionId') subscriptionId?: string,
    @Query('status') status?: PaymentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUserRole() userRole?: string,
  ) {
    // Only admins can view all payments
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.findPayments(
      subscriptionId,
      status,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: PaymentStatus;
      metadata?: any;
    },
    @CurrentUserRole() userRole?: string,
  ) {
    // Only admins can update payment status
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.updatePaymentStatus(
      id,
      body.status,
      body.metadata,
    );
  }

  // Invoices
  @Post('invoices')
  createInvoice(
    @Body()
    body: {
      subscriptionId: string;
      subtotal: number;
      taxAmount?: number;
      discountAmount?: number;
      dueDate: string;
      billingAddress?: any;
    },
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.createInvoice({
      ...body,
      dueDate: new Date(body.dueDate),
    });
  }

  @Get('invoices')
  getInvoices(
    @Query('subscriptionId') subscriptionId?: string,
    @Query('status') status?: InvoiceStatus,
    @CurrentUserRole() userRole?: string,
    @CurrentUserId() userId?: string,
  ) {
    // Users can only see their own invoices
    if (userRole !== 'admin') {
      // Filter by user's subscription
      // In a real implementation, you'd need to verify subscriptionId belongs to user
    }

    return this.billingService.findInvoices(subscriptionId, status);
  }

  @Post('invoices/:id/pay')
  markInvoiceAsPaid(
    @Param('id') id: string,
    @Body() body: { paymentId: string },
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.markInvoiceAsPaid(id, body.paymentId);
  }

  // Discounts
  @Post('discounts')
  createDiscount(
    @Body()
    body: {
      code?: string;
      name: string;
      description?: string;
      type: DiscountType;
      percentOff?: number;
      amountOff?: number;
      validFrom?: string;
      validUntil?: string;
      maxUses?: number;
      maxUsesPerUser?: number;
      applicableTiers?: SubscriptionTier[];
      minAmount?: number;
    },
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.createDiscount({
      ...body,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    });
  }

  @Post('discounts/validate')
  validateDiscount(
    @Body()
    body: {
      code: string;
      amount: number;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.validateDiscount(body.code, userId, body.amount);
  }

  @Post('discounts/:id/redeem')
  redeemDiscount(
    @Param('id') discountId: string,
    @Body() body: { amountSaved: number },
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.redeemDiscount(
      discountId,
      userId,
      body.amountSaved,
    );
  }

  // Usage Records
  @Post('usage')
  recordUsage(
    @Body()
    body: {
      subscriptionId: string;
      feature: string;
      quantity: number;
      unit: string;
      usageDate?: string;
      metadata?: any;
    },
    @CurrentUserRole() userRole?: string,
  ) {
    // Only admins or system can record usage
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.recordUsage({
      ...body,
      usageDate: body.usageDate ? new Date(body.usageDate) : undefined,
    });
  }

  @Get('usage/:subscriptionId')
  getUsageRecords(
    @Param('subscriptionId') subscriptionId: string,
    @Query('feature') feature?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUserRole() userRole?: string,
  ) {
    // Users can only see their own usage
    if (userRole !== 'admin') {
      // In a real implementation, verify subscriptionId belongs to user
    }

    return this.billingService.getUsageRecords(
      subscriptionId,
      feature,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Statistics
  @Get('statistics')
  getBillingStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized');
    }

    return this.billingService.getBillingStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
