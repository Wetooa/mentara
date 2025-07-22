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
  BadRequestException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { PaymentStatus } from '@prisma/client';
import type {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  ProcessSessionPaymentDto,
} from './types';

/**
 * Educational Billing Controller for Mental Health Platform
 *
 * Simplified payment processing endpoints suitable for a school project.
 * Focuses on therapy session payments without complex billing features.
 */
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ===== PAYMENT METHODS =====

  @Post('payment-methods')
  async createPaymentMethod(
    @Body() body: CreatePaymentMethodDto,
    @CurrentUserId() userId: string,
  ) {
    return this.billingService.createPaymentMethod({
      ...body,
      userId,
    });
  }

  @Get('payment-methods')
  getUserPaymentMethods(@CurrentUserId() userId: string) {
    return this.billingService.getUserPaymentMethods(userId);
  }

  @Patch('payment-methods/:id')
  updatePaymentMethod(
    @Param('id') id: string,
    @Body() body: UpdatePaymentMethodDto,
  ) {
    return this.billingService.updatePaymentMethod(id, body);
  }

  @Delete('payment-methods/:id')
  deletePaymentMethod(@Param('id') id: string) {
    return this.billingService.deletePaymentMethod(id);
  }

  // ===== PAYMENT PROCESSING =====

  @Post('payments/session')
  async processSessionPayment(
    @Body() body: ProcessSessionPaymentDto,
    @CurrentUserId() clientId: string,
  ) {
    if (body.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    return this.billingService.processSessionPayment({
      ...body,
      clientId,
    });
  }

  @Get('payments/:id')
  getPayment(@Param('id') id: string) {
    return this.billingService.getPayment(id);
  }

  @Get('payments')
  getUserPayments(
    @CurrentUserId() userId: string,
    @Query('role') role?: 'client' | 'therapist',
    @Query('status') status?: PaymentStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.billingService.getUserPayments(userId, {
      role,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Post('payments/:id/retry')
  retryPayment(@Param('id') paymentId: string) {
    return this.billingService.retryPayment(paymentId);
  }

  // ===== ANALYTICS & REPORTING =====

  @Get('analytics/therapist')
  getTherapistAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Only allow therapists to access their own analytics
    if (userRole !== 'therapist' && userRole !== 'admin') {
      throw new UnauthorizedException(
        'Only therapists can access payment analytics',
      );
    }

    return this.billingService.getTherapistPaymentStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('analytics/platform')
  getPlatformAnalytics(
    @CurrentUserRole()
    userRole: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }

    return this.billingService.getPlatformStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
