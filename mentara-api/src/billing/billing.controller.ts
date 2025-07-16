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
  UnauthorizedException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateSubscriptionDtoSchema,
  UpdateSubscriptionDtoSchema,
  CancelSubscriptionDtoSchema,
  ChangeSubscriptionPlanDtoSchema,
  PauseSubscriptionDtoSchema,
  ScheduleSubscriptionCancellationDtoSchema,
  ReactivateSubscriptionDtoSchema,
  ApplyDiscountDtoSchema,
  SubscriptionUsageAnalyticsQueryDtoSchema,
  GetPlansQueryDtoSchema,
  CreatePlanDtoSchema,
  UpdatePlanDtoSchema,
  CreatePaymentMethodDtoSchema,
  UpdatePaymentMethodDtoSchema,
  CreatePaymentDtoSchema,
  GetPaymentsQueryDtoSchema,
  UpdatePaymentStatusDtoSchema,
  CreateInvoiceDtoSchema,
  GetInvoicesQueryDtoSchema,
  MarkInvoiceAsPaidDtoSchema,
  CreateDiscountDtoSchema,
  ValidateDiscountDtoSchema,
  RedeemDiscountDtoSchema,
  RecordUsageDtoSchema,
  GetUsageRecordsQueryDtoSchema,
  GetBillingStatisticsQueryDtoSchema,
  type CreateSubscriptionDto,
  type UpdateSubscriptionDto,
  type CancelSubscriptionDto,
  type ChangeSubscriptionPlanDto,
  type PauseSubscriptionDto,
  type ScheduleSubscriptionCancellationDto,
  type ReactivateSubscriptionDto,
  type ApplyDiscountDto,
  type SubscriptionUsageAnalyticsQueryDto,
  type GetPlansQueryDto,
  type CreatePlanDto,
  type UpdatePlanDto,
  type CreatePaymentMethodDto,
  type UpdatePaymentMethodDto,
  type CreatePaymentDto,
  type GetPaymentsQueryDto,
  type UpdatePaymentStatusDto,
  type CreateInvoiceDto,
  type GetInvoicesQueryDto,
  type MarkInvoiceAsPaidDto,
  type CreateDiscountDto,
  type ValidateDiscountDto,
  type RedeemDiscountDto,
  type RecordUsageDto,
  type GetUsageRecordsQueryDto,
  type GetBillingStatisticsQueryDto,
} from '@mentara/commons';
import {
  BillingCycle,
  SubscriptionTier,
  PaymentMethodType,
  PaymentStatus,
  InvoiceStatus,
  DiscountType,
} from '@prisma/client';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Subscription endpoints
  @Post('subscriptions')
  createSubscription(
    @Body(new ZodValidationPipe(CreateSubscriptionDtoSchema))
    body: CreateSubscriptionDto,
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
    @Body(new ZodValidationPipe(UpdateSubscriptionDtoSchema))
    body: UpdateSubscriptionDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.updateSubscription(userId, body);
  }

  @Post('subscriptions/me/cancel')
  cancelMySubscription(
    @Body(new ZodValidationPipe(CancelSubscriptionDtoSchema))
    body: CancelSubscriptionDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.cancelSubscription(userId);
  }

  // ===== ADVANCED SUBSCRIPTION MANAGEMENT =====

  @Post('subscriptions/me/change-plan')
  changeMySubscriptionPlan(
    @Body(new ZodValidationPipe(ChangeSubscriptionPlanDtoSchema))
    body: ChangeSubscriptionPlanDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.changeSubscriptionPlan(userId, body.newPlanId, {
      billingCycle: body.billingCycle,
      prorationBehavior: body.prorationBehavior,
      effectiveDate: body.effectiveDate
        ? new Date(body.effectiveDate)
        : undefined,
    });
  }

  @Post('subscriptions/me/pause')
  pauseMySubscription(
    @Body(new ZodValidationPipe(PauseSubscriptionDtoSchema))
    body: PauseSubscriptionDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.pauseSubscription(userId, {
      pauseUntil: body.pauseUntil ? new Date(body.pauseUntil) : undefined,
      reason: body.reason,
    });
  }

  @Post('subscriptions/me/resume')
  resumeMySubscription(@CurrentUserId() userId: string) {
    return this.billingService.resumeSubscription(userId);
  }

  @Post('subscriptions/me/schedule-cancellation')
  scheduleMySubscriptionCancellation(
    @Body(new ZodValidationPipe(ScheduleSubscriptionCancellationDtoSchema))
    body: ScheduleSubscriptionCancellationDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.scheduleSubscriptionCancellation(userId, body);
  }

  @Post('subscriptions/me/reactivate')
  reactivateMySubscription(
    @Body(new ZodValidationPipe(ReactivateSubscriptionDtoSchema))
    body: ReactivateSubscriptionDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.reactivateSubscription(
      userId,
      body.newPaymentMethodId,
    );
  }

  @Post('subscriptions/me/apply-discount')
  applyDiscountToMySubscription(
    @Body(new ZodValidationPipe(ApplyDiscountDtoSchema)) body: ApplyDiscountDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.applyDiscountToSubscription(
      userId,
      body.discountCode,
    );
  }

  @Post('subscriptions/:id/renew')
  processSubscriptionRenewal(
    @Param('id') subscriptionId: string,
    @CurrentUserRole() userRole: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }
    return this.billingService.processSubscriptionRenewal(subscriptionId);
  }

  @Get('subscriptions/:id/usage-analytics')
  getSubscriptionUsageAnalytics(
    @Param('id') subscriptionId: string,
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(SubscriptionUsageAnalyticsQueryDtoSchema))
    query: SubscriptionUsageAnalyticsQueryDto,
  ) {
    // Users can only see their own subscription analytics
    if (userRole !== 'admin') {
      // In a real implementation, verify subscriptionId belongs to user
    }

    return this.billingService.getSubscriptionUsageAnalytics(
      subscriptionId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  // Subscription Plans
  @Get('plans')
  getAllPlans(
    @Query(new ZodValidationPipe(GetPlansQueryDtoSchema))
    query: GetPlansQueryDto,
  ) {
    return this.billingService.findAllPlans(
      query.isActive !== undefined ? query.isActive : true,
    );
  }

  @Post('plans')
  createPlan(
    @Body(new ZodValidationPipe(CreatePlanDtoSchema)) body: CreatePlanDto,
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }
    return this.billingService.createSubscriptionPlan(body);
  }

  @Patch('plans/:id')
  updatePlan(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePlanDtoSchema)) body: UpdatePlanDto,
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }
    return this.billingService.updatePlan(id, body);
  }

  // Payment Methods
  @Post('payment-methods')
  createPaymentMethod(
    @Body(new ZodValidationPipe(CreatePaymentMethodDtoSchema))
    body: CreatePaymentMethodDto,
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
    @Body(new ZodValidationPipe(UpdatePaymentMethodDtoSchema))
    body: UpdatePaymentMethodDto,
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
    @Body(new ZodValidationPipe(CreatePaymentDtoSchema)) body: CreatePaymentDto,
  ) {
    return this.billingService.createPayment(body);
  }

  @Get('payments')
  getPayments(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(GetPaymentsQueryDtoSchema))
    query: GetPaymentsQueryDto,
  ) {
    // Only admins can view all payments
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return this.billingService.findPayments(
      query.subscriptionId,
      query.status,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdatePaymentStatusDtoSchema))
    body: UpdatePaymentStatusDto,
    @CurrentUserRole() userRole?: string,
  ) {
    // Only admins can update payment status
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
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
    @Body(new ZodValidationPipe(CreateInvoiceDtoSchema)) body: CreateInvoiceDto,
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return this.billingService.createInvoice({
      ...body,
      dueDate: new Date(body.dueDate),
    });
  }

  @Get('invoices')
  getInvoices(
    @CurrentUserRole() userRole: string,
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(GetInvoicesQueryDtoSchema))
    query: GetInvoicesQueryDto,
  ) {
    // Users can only see their own invoices
    if (userRole !== 'admin') {
      // Filter by user's subscription
      // In a real implementation, you'd need to verify subscriptionId belongs to user
    }

    return this.billingService.findInvoices(query.subscriptionId, query.status);
  }

  @Post('invoices/:id/pay')
  markInvoiceAsPaid(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(MarkInvoiceAsPaidDtoSchema))
    body: MarkInvoiceAsPaidDto,
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return this.billingService.markInvoiceAsPaid(id);
  }

  // Discounts
  @Post('discounts')
  createDiscount(
    @Body(new ZodValidationPipe(CreateDiscountDtoSchema))
    body: CreateDiscountDto,
    @CurrentUserRole() userRole?: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return this.billingService.createDiscount({
      ...body,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    });
  }

  @Post('discounts/validate')
  validateDiscount(
    @Body(new ZodValidationPipe(ValidateDiscountDtoSchema))
    body: ValidateDiscountDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.validateDiscount(body.code, userId, body.amount);
  }

  @Post('discounts/:id/redeem')
  redeemDiscount(
    @Param('id') discountId: string,
    @Body(new ZodValidationPipe(RedeemDiscountDtoSchema))
    body: RedeemDiscountDto,
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
    @Body(new ZodValidationPipe(RecordUsageDtoSchema)) body: RecordUsageDto,
    @CurrentUserRole() userRole?: string,
  ) {
    // Only admins or system can record usage
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return this.billingService.recordUsage({
      ...body,
      usageDate: body.usageDate ? new Date(body.usageDate) : undefined,
    });
  }

  @Get('usage/:subscriptionId')
  getUsageRecords(
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(GetUsageRecordsQueryDtoSchema))
    query: GetUsageRecordsQueryDto,
  ) {
    // Users can only see their own usage
    if (userRole !== 'admin') {
      // In a real implementation, verify subscriptionId belongs to user
    }

    return this.billingService.getUsageRecords(
      subscriptionId,
      query.feature,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  // Statistics
  @Get('statistics')
  getBillingStatistics(
    @CurrentUserRole() userRole: string,
    @Query(new ZodValidationPipe(GetBillingStatisticsQueryDtoSchema))
    query: GetBillingStatisticsQueryDto,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return this.billingService.getBillingStatistics(
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }
}
