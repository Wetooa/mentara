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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/auth/decorators/current-user-id.decorator';
import { CurrentUserRole } from 'src/auth/decorators/current-user-role.decorator';
import { PaymentStatus, PaymentMethodType } from '@prisma/client';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  ProcessSessionPaymentDto,
  GetPaymentsQueryDto,
} from 'mentara-commons';
import {
  TherapistAnalyticsQueryDto,
  PlatformAnalyticsQueryDto,
} from 'mentara-commons';

/**
 * Educational Billing Controller for Mental Health Platform
 * 
 * Simplified payment processing endpoints suitable for a school project.
 * Focuses on therapy session payments without complex billing features.
 */
@ApiTags('billing')
@ApiBearerAuth('JWT-auth')
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ===== PAYMENT METHODS =====

  @Post('payment-methods')
  @ApiOperation({
    summary: 'Add payment method',
    description: 'Add a new payment method for the authenticated user',
  })
  @ApiResponse({ status: 201, description: 'Payment method created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment method data' })
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
  @ApiOperation({
    summary: 'Get user payment methods',
    description: 'Retrieve all payment methods for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  getUserPaymentMethods(@CurrentUserId() userId: string) {
    return this.billingService.getUserPaymentMethods(userId);
  }

  @Patch('payment-methods/:id')
  @ApiOperation({
    summary: 'Update payment method',
    description: 'Update payment method settings (e.g., set as default)',
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  updatePaymentMethod(
    @Param('id') id: string,
    @Body() body: UpdatePaymentMethodDto,
  ) {
    return this.billingService.updatePaymentMethod(id, body);
  }

  @Delete('payment-methods/:id')
  @ApiOperation({
    summary: 'Delete payment method',
    description: 'Remove a payment method from the user account',
  })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot delete the only payment method with pending payments' 
  })
  deletePaymentMethod(@Param('id') id: string) {
    return this.billingService.deletePaymentMethod(id);
  }

  // ===== PAYMENT PROCESSING =====

  @Post('payments/session')
  @ApiOperation({
    summary: 'Process session payment',
    description: 'Process payment for a therapy session',
  })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
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
  @ApiOperation({
    summary: 'Get payment details',
    description: 'Retrieve details of a specific payment',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  getPayment(@Param('id') id: string) {
    return this.billingService.getPayment(id);
  }

  @Get('payments')
  @ApiOperation({
    summary: 'Get user payments',
    description: 'Retrieve payment history for the authenticated user',
  })
  @ApiQuery({ name: 'role', required: false, enum: ['client', 'therapist'] })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
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
  @ApiOperation({
    summary: 'Retry failed payment',
    description: 'Retry processing a failed payment',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({ status: 200, description: 'Payment retry initiated successfully' })
  @ApiResponse({ status: 400, description: 'Can only retry failed payments' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  retryPayment(@Param('id') paymentId: string) {
    return this.billingService.retryPayment(paymentId);
  }

  // ===== ANALYTICS & REPORTING =====

  @Get('analytics/therapist')
  @ApiOperation({
    summary: 'Get therapist payment statistics',
    description: 'Retrieve payment analytics for therapists',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Therapist analytics retrieved successfully' })
  getTherapistAnalytics(
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Only allow therapists to access their own analytics
    if (userRole !== 'therapist' && userRole !== 'admin') {
      throw new UnauthorizedException('Only therapists can access payment analytics');
    }

    return this.billingService.getTherapistPaymentStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('analytics/platform')
  @ApiOperation({
    summary: 'Get platform payment statistics',
    description: 'Retrieve platform-wide payment analytics (admin only)',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Platform analytics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getPlatformAnalytics(
    @CurrentUserRole() userRole: string,
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

  // ===== EDUCATIONAL ENDPOINTS =====

  @Get('test-cards')
  @ApiOperation({
    summary: 'Get test card information',
    description: 'Educational endpoint showing test card numbers for different scenarios',
  })
  @ApiResponse({ status: 200, description: 'Test card information retrieved' })
  getTestCardInfo() {
    return {
      message: 'Educational Payment System - Test Card Numbers',
      testCards: [
        {
          last4: '0001',
          scenario: 'Always succeeds',
          description: 'Use this card ending in 0001 for successful payments',
        },
        {
          last4: '0002',
          scenario: 'Always declines',
          description: 'Use this card ending in 0002 to test payment failures',
        },
        {
          last4: '0004',
          scenario: 'Insufficient funds',
          description: 'Use this card ending in 0004 to test insufficient funds error',
        },
        {
          last4: '0008',
          scenario: 'Expired card',
          description: 'Use this card ending in 0008 to test expired card error',
        },
      ],
      notes: [
        'This is an educational payment system for demonstration purposes',
        'No real money is processed',
        'All payments are simulated with realistic delays and responses',
        'Platform takes a 5% commission on successful payments',
      ],
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get billing service status',
    description: 'Check the health and configuration of the billing service',
  })
  @ApiResponse({ status: 200, description: 'Billing service status' })
  getServiceStatus() {
    return {
      service: 'Educational Billing Service',
      status: 'operational',
      mode: 'educational',
      features: [
        'Mock payment processing',
        'Payment method management',
        'Session-based payments',
        'Analytics and reporting',
        'Test card scenarios',
      ],
      configuration: {
        platformFeeRate: '5%',
        successRate: '90%',
        processingDelay: '2-5 seconds',
      },
    };
  }
}