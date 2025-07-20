/**
 * Comprehensive Test Suite for BillingController
 * Tests all billing endpoints including subscriptions, payments, invoices, and discounts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SecurityGuardTestUtils, RoleBasedTestUtils } from '../test-utils/auth-testing-helpers';
import { MockBuilder, TestDataGenerator, TestAssertions } from '../test-utils/enhanced-test-helpers';
import { TEST_USER_IDS, TEST_EMAILS } from '../test-utils/index';

describe('BillingController', () => {
  let controller: BillingController;
  let billingService: BillingService;
  let module: TestingModule;

  // Mock BillingService
  const mockBillingService = {
    createSubscription: jest.fn(),
    findUserSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    changeSubscriptionPlan: jest.fn(),
    pauseSubscription: jest.fn(),
    resumeSubscription: jest.fn(),
    scheduleSubscriptionCancellation: jest.fn(),
    reactivateSubscription: jest.fn(),
    applyDiscountToSubscription: jest.fn(),
    processSubscriptionRenewal: jest.fn(),
    getSubscriptionUsageAnalytics: jest.fn(),
    findAllPlans: jest.fn(),
    createSubscriptionPlan: jest.fn(),
    updatePlan: jest.fn(),
    createPaymentMethod: jest.fn(),
    findUserPaymentMethods: jest.fn(),
    updatePaymentMethod: jest.fn(),
    deletePaymentMethod: jest.fn(),
    createPayment: jest.fn(),
    findPayments: jest.fn(),
    updatePaymentStatus: jest.fn(),
    createInvoice: jest.fn(),
    findInvoices: jest.fn(),
    markInvoiceAsPaid: jest.fn(),
    createDiscount: jest.fn(),
    validateDiscount: jest.fn(),
    redeemDiscount: jest.fn(),
    recordUsage: jest.fn(),
    getUsageRecords: jest.fn(),
    getBillingStatistics: jest.fn(),
  };

  // Mock JwtAuthGuard
  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  // Test data
  const mockSubscription = {
    id: 'sub_123456789',
    userId: TEST_USER_IDS.CLIENT,
    planId: 'plan_basic_monthly',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlan = {
    id: 'plan_basic_monthly',
    name: 'Basic Monthly',
    description: 'Basic plan with monthly billing',
    amount: 29.99,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    isActive: true,
    features: ['therapy_sessions', 'basic_support'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaymentMethod = {
    id: 'pm_123456789',
    userId: TEST_USER_IDS.CLIENT,
    type: 'card',
    isDefault: true,
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayment = {
    id: 'pay_123456789',
    subscriptionId: 'sub_123456789',
    amount: 29.99,
    currency: 'USD',
    status: 'succeeded',
    paymentMethodId: 'pm_123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInvoice = {
    id: 'inv_123456789',
    subscriptionId: 'sub_123456789',
    amount: 29.99,
    currency: 'USD',
    status: 'paid',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDiscount = {
    id: 'disc_123456789',
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    isActive: true,
    usageLimit: 100,
    usageCount: 0,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: BillingService,
          useValue: mockBillingService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<BillingController>(BillingController);
    billingService = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Initialization', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have billingService injected', () => {
      expect(billingService).toBeDefined();
    });
  });

  describe('Security Guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', BillingController);
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should have proper route decorators', () => {
      const controllerMetadata = Reflect.getMetadata('path', BillingController);
      expect(controllerMetadata).toBe('billing');
    });
  });

  describe('Subscription Management', () => {
    describe('POST /billing/subscriptions', () => {
      const createSubscriptionDto = {
        planId: 'plan_basic_monthly',
        paymentMethodId: 'pm_123456789',
        trialStart: '2024-01-01T00:00:00.000Z',
        trialEnd: '2024-01-14T23:59:59.999Z',
      };

      it('should create subscription successfully', async () => {
        mockBillingService.createSubscription.mockResolvedValue(mockSubscription);

        const result = await controller.createSubscription(
          createSubscriptionDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(mockSubscription);
        expect(billingService.createSubscription).toHaveBeenCalledWith({
          ...createSubscriptionDto,
          userId: TEST_USER_IDS.CLIENT,
          trialStart: new Date(createSubscriptionDto.trialStart),
          trialEnd: new Date(createSubscriptionDto.trialEnd),
        });
      });

      it('should handle subscription creation without trial dates', async () => {
        const basicDto = {
          planId: 'plan_basic_monthly',
          paymentMethodId: 'pm_123456789',
        };
        mockBillingService.createSubscription.mockResolvedValue(mockSubscription);

        const result = await controller.createSubscription(
          basicDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(mockSubscription);
        expect(billingService.createSubscription).toHaveBeenCalledWith({
          ...basicDto,
          userId: TEST_USER_IDS.CLIENT,
          trialStart: undefined,
          trialEnd: undefined,
        });
      });

      it('should handle service errors', async () => {
        const serviceError = new Error('Payment method not found');
        mockBillingService.createSubscription.mockRejectedValue(serviceError);

        await expect(
          controller.createSubscription(createSubscriptionDto, TEST_USER_IDS.CLIENT)
        ).rejects.toThrow(serviceError);
      });
    });

    describe('GET /billing/subscriptions/me', () => {
      it('should get user subscription successfully', async () => {
        mockBillingService.findUserSubscription.mockResolvedValue(mockSubscription);

        const result = await controller.getMySubscription(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockSubscription);
        expect(billingService.findUserSubscription).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      });

      it('should handle subscription not found', async () => {
        mockBillingService.findUserSubscription.mockResolvedValue(null);

        const result = await controller.getMySubscription(TEST_USER_IDS.CLIENT);

        expect(result).toBeNull();
      });
    });

    describe('PATCH /billing/subscriptions/me', () => {
      const updateDto = {
        billingCycle: 'monthly' as const,
        autoRenew: true,
      };

      it('should update subscription successfully', async () => {
        const updatedSubscription = { ...mockSubscription, ...updateDto };
        mockBillingService.updateSubscription.mockResolvedValue(updatedSubscription);

        const result = await controller.updateMySubscription(
          updateDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(updatedSubscription);
        expect(billingService.updateSubscription).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          updateDto
        );
      });
    });

    describe('POST /billing/subscriptions/me/cancel', () => {
      const cancelDto = {
        reason: 'No longer needed',
        cancelAtPeriodEnd: true,
      };

      it('should cancel subscription successfully', async () => {
        const cancelledSubscription = { ...mockSubscription, status: 'canceled' };
        mockBillingService.cancelSubscription.mockResolvedValue(cancelledSubscription);

        const result = await controller.cancelMySubscription(
          cancelDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(cancelledSubscription);
        expect(billingService.cancelSubscription).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      });
    });

    describe('POST /billing/subscriptions/me/change-plan', () => {
      const changePlanDto = {
        newPlanId: 'plan_premium_monthly',
        billingCycle: 'monthly' as const,
        prorationBehavior: 'always_invoice' as const,
        effectiveDate: '2024-01-01T00:00:00.000Z',
      };

      it('should change subscription plan successfully', async () => {
        const updatedSubscription = { ...mockSubscription, planId: changePlanDto.newPlanId };
        mockBillingService.changeSubscriptionPlan.mockResolvedValue(updatedSubscription);

        const result = await controller.changeMySubscriptionPlan(
          changePlanDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(updatedSubscription);
        expect(billingService.changeSubscriptionPlan).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          changePlanDto.newPlanId,
          {
            billingCycle: changePlanDto.billingCycle,
            prorationBehavior: changePlanDto.prorationBehavior,
            effectiveDate: new Date(changePlanDto.effectiveDate),
          }
        );
      });
    });

    describe('POST /billing/subscriptions/me/pause', () => {
      const pauseDto = {
        pauseUntil: '2024-02-01T00:00:00.000Z',
        reason: 'Temporary break',
      };

      it('should pause subscription successfully', async () => {
        const pausedSubscription = { ...mockSubscription, status: 'paused' };
        mockBillingService.pauseSubscription.mockResolvedValue(pausedSubscription);

        const result = await controller.pauseMySubscription(
          pauseDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(pausedSubscription);
        expect(billingService.pauseSubscription).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          {
            pauseUntil: new Date(pauseDto.pauseUntil),
            reason: pauseDto.reason,
          }
        );
      });
    });

    describe('POST /billing/subscriptions/me/resume', () => {
      it('should resume subscription successfully', async () => {
        const resumedSubscription = { ...mockSubscription, status: 'active' };
        mockBillingService.resumeSubscription.mockResolvedValue(resumedSubscription);

        const result = await controller.resumeMySubscription(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(resumedSubscription);
        expect(billingService.resumeSubscription).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      });
    });
  });

  describe('Plan Management', () => {
    describe('GET /billing/plans', () => {
      it('should get all active plans by default', async () => {
        const mockPlans = [mockPlan];
        mockBillingService.findAllPlans.mockResolvedValue(mockPlans);

        const result = await controller.getAllPlans({});

        expect(result).toEqual(mockPlans);
        expect(billingService.findAllPlans).toHaveBeenCalledWith(true);
      });

      it('should get all plans including inactive when specified', async () => {
        const mockPlans = [mockPlan, { ...mockPlan, isActive: false }];
        mockBillingService.findAllPlans.mockResolvedValue(mockPlans);

        const result = await controller.getAllPlans({ isActive: false });

        expect(result).toEqual(mockPlans);
        expect(billingService.findAllPlans).toHaveBeenCalledWith(false);
      });
    });

    describe('POST /billing/plans', () => {
      const createPlanDto = {
        name: 'Premium Monthly',
        description: 'Premium plan with monthly billing',
        amount: 99.99,
        currency: 'USD',
        interval: 'month' as const,
        intervalCount: 1,
        features: ['unlimited_sessions', 'priority_support'],
      };

      it('should create plan as admin', async () => {
        mockBillingService.createSubscriptionPlan.mockResolvedValue(mockPlan);

        const result = await controller.createPlan(createPlanDto, 'admin');

        expect(result).toEqual(mockPlan);
        expect(billingService.createSubscriptionPlan).toHaveBeenCalledWith(createPlanDto);
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.createPlan(createPlanDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('PATCH /billing/plans/:id', () => {
      const updatePlanDto = {
        name: 'Updated Premium Monthly',
        amount: 79.99,
      };

      it('should update plan as admin', async () => {
        const updatedPlan = { ...mockPlan, ...updatePlanDto };
        mockBillingService.updatePlan.mockResolvedValue(updatedPlan);

        const result = await controller.updatePlan('plan_123', updatePlanDto, 'admin');

        expect(result).toEqual(updatedPlan);
        expect(billingService.updatePlan).toHaveBeenCalledWith('plan_123', updatePlanDto);
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.updatePlan('plan_123', updatePlanDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Payment Method Management', () => {
    describe('POST /billing/payment-methods', () => {
      const createPaymentMethodDto = {
        type: 'card' as const,
        cardToken: 'tok_visa',
        isDefault: true,
      };

      it('should create payment method successfully', async () => {
        mockBillingService.createPaymentMethod.mockResolvedValue(mockPaymentMethod);

        const result = await controller.createPaymentMethod(
          createPaymentMethodDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(mockPaymentMethod);
        expect(billingService.createPaymentMethod).toHaveBeenCalledWith({
          ...createPaymentMethodDto,
          userId: TEST_USER_IDS.CLIENT,
        });
      });
    });

    describe('GET /billing/payment-methods', () => {
      it('should get user payment methods', async () => {
        const mockPaymentMethods = [mockPaymentMethod];
        mockBillingService.findUserPaymentMethods.mockResolvedValue(mockPaymentMethods);

        const result = await controller.getMyPaymentMethods(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockPaymentMethods);
        expect(billingService.findUserPaymentMethods).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT);
      });
    });

    describe('PATCH /billing/payment-methods/:id', () => {
      const updatePaymentMethodDto = {
        isDefault: false,
        expiryMonth: 6,
        expiryYear: 2026,
      };

      it('should update payment method successfully', async () => {
        const updatedPaymentMethod = { ...mockPaymentMethod, ...updatePaymentMethodDto };
        mockBillingService.updatePaymentMethod.mockResolvedValue(updatedPaymentMethod);

        const result = await controller.updatePaymentMethod('pm_123', updatePaymentMethodDto);

        expect(result).toEqual(updatedPaymentMethod);
        expect(billingService.updatePaymentMethod).toHaveBeenCalledWith(
          'pm_123',
          updatePaymentMethodDto
        );
      });
    });

    describe('DELETE /billing/payment-methods/:id', () => {
      it('should delete payment method successfully', async () => {
        mockBillingService.deletePaymentMethod.mockResolvedValue({ success: true });

        const result = await controller.deletePaymentMethod('pm_123');

        expect(result).toEqual({ success: true });
        expect(billingService.deletePaymentMethod).toHaveBeenCalledWith('pm_123');
      });
    });
  });

  describe('Payment Management', () => {
    describe('POST /billing/payments', () => {
      const createPaymentDto = {
        subscriptionId: 'sub_123456789',
        amount: 29.99,
        currency: 'USD',
        paymentMethodId: 'pm_123456789',
      };

      it('should create payment successfully', async () => {
        mockBillingService.createPayment.mockResolvedValue(mockPayment);

        const result = await controller.createPayment(createPaymentDto);

        expect(result).toEqual(mockPayment);
        expect(billingService.createPayment).toHaveBeenCalledWith(createPaymentDto);
      });
    });

    describe('GET /billing/payments', () => {
      const paymentsQuery = {
        subscriptionId: 'sub_123456789',
        status: 'succeeded' as const,
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      it('should get payments as admin', async () => {
        const mockPayments = [mockPayment];
        mockBillingService.findPayments.mockResolvedValue(mockPayments);

        const result = await controller.getPayments('admin', paymentsQuery);

        expect(result).toEqual(mockPayments);
        expect(billingService.findPayments).toHaveBeenCalledWith(
          paymentsQuery.subscriptionId,
          paymentsQuery.status,
          new Date(paymentsQuery.startDate),
          new Date(paymentsQuery.endDate)
        );
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.getPayments('client', paymentsQuery)
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('PATCH /billing/payments/:id/status', () => {
      const updateStatusDto = {
        status: 'succeeded' as const,
        metadata: { processor: 'stripe' },
      };

      it('should update payment status as admin', async () => {
        const updatedPayment = { ...mockPayment, ...updateStatusDto };
        mockBillingService.updatePaymentStatus.mockResolvedValue(updatedPayment);

        const result = await controller.updatePaymentStatus(
          'pay_123',
          updateStatusDto,
          'admin'
        );

        expect(result).toEqual(updatedPayment);
        expect(billingService.updatePaymentStatus).toHaveBeenCalledWith(
          'pay_123',
          updateStatusDto.status,
          updateStatusDto.metadata
        );
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.updatePaymentStatus('pay_123', updateStatusDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Invoice Management', () => {
    describe('POST /billing/invoices', () => {
      const createInvoiceDto = {
        subscriptionId: 'sub_123456789',
        amount: 29.99,
        currency: 'USD',
        dueDate: '2024-02-01T00:00:00.000Z',
        description: 'Monthly subscription fee',
      };

      it('should create invoice as admin', async () => {
        mockBillingService.createInvoice.mockResolvedValue(mockInvoice);

        const result = await controller.createInvoice(createInvoiceDto, 'admin');

        expect(result).toEqual(mockInvoice);
        expect(billingService.createInvoice).toHaveBeenCalledWith({
          ...createInvoiceDto,
          dueDate: new Date(createInvoiceDto.dueDate),
        });
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.createInvoice(createInvoiceDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /billing/invoices', () => {
      const invoicesQuery = {
        subscriptionId: 'sub_123456789',
        status: 'paid' as const,
      };

      it('should get invoices successfully', async () => {
        const mockInvoices = [mockInvoice];
        mockBillingService.findInvoices.mockResolvedValue(mockInvoices);

        const result = await controller.getInvoices(
          'admin',
          TEST_USER_IDS.CLIENT,
          invoicesQuery
        );

        expect(result).toEqual(mockInvoices);
        expect(billingService.findInvoices).toHaveBeenCalledWith(
          invoicesQuery.subscriptionId,
          invoicesQuery.status
        );
      });
    });

    describe('POST /billing/invoices/:id/pay', () => {
      const markPaidDto = {
        paymentId: 'pay_123456789',
        paidAt: '2024-01-15T12:00:00.000Z',
      };

      it('should mark invoice as paid as admin', async () => {
        const paidInvoice = { ...mockInvoice, status: 'paid' };
        mockBillingService.markInvoiceAsPaid.mockResolvedValue(paidInvoice);

        const result = await controller.markInvoiceAsPaid('inv_123', markPaidDto, 'admin');

        expect(result).toEqual(paidInvoice);
        expect(billingService.markInvoiceAsPaid).toHaveBeenCalledWith('inv_123');
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.markInvoiceAsPaid('inv_123', markPaidDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Discount Management', () => {
    describe('POST /billing/discounts', () => {
      const createDiscountDto = {
        code: 'SAVE30',
        type: 'percentage' as const,
        value: 30,
        usageLimit: 50,
        validFrom: '2024-01-01T00:00:00.000Z',
        validUntil: '2024-12-31T23:59:59.999Z',
      };

      it('should create discount as admin', async () => {
        mockBillingService.createDiscount.mockResolvedValue(mockDiscount);

        const result = await controller.createDiscount(createDiscountDto, 'admin');

        expect(result).toEqual(mockDiscount);
        expect(billingService.createDiscount).toHaveBeenCalledWith({
          ...createDiscountDto,
          validFrom: new Date(createDiscountDto.validFrom),
          validUntil: new Date(createDiscountDto.validUntil),
        });
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.createDiscount(createDiscountDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('POST /billing/discounts/validate', () => {
      const validateDto = {
        code: 'SAVE20',
        amount: 29.99,
      };

      it('should validate discount successfully', async () => {
        const validationResult = {
          isValid: true,
          discount: mockDiscount,
          discountAmount: 5.99,
        };
        mockBillingService.validateDiscount.mockResolvedValue(validationResult);

        const result = await controller.validateDiscount(validateDto, TEST_USER_IDS.CLIENT);

        expect(result).toEqual(validationResult);
        expect(billingService.validateDiscount).toHaveBeenCalledWith(
          validateDto.code,
          TEST_USER_IDS.CLIENT,
          validateDto.amount
        );
      });
    });

    describe('POST /billing/discounts/:id/redeem', () => {
      const redeemDto = {
        amountSaved: 5.99,
      };

      it('should redeem discount successfully', async () => {
        const redeemResult = {
          success: true,
          discount: mockDiscount,
          amountSaved: redeemDto.amountSaved,
        };
        mockBillingService.redeemDiscount.mockResolvedValue(redeemResult);

        const result = await controller.redeemDiscount(
          'disc_123',
          redeemDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(redeemResult);
        expect(billingService.redeemDiscount).toHaveBeenCalledWith(
          'disc_123',
          TEST_USER_IDS.CLIENT,
          redeemDto.amountSaved
        );
      });
    });
  });

  describe('Usage Tracking', () => {
    describe('POST /billing/usage', () => {
      const recordUsageDto = {
        subscriptionId: 'sub_123456789',
        feature: 'therapy_sessions',
        quantity: 1,
        usageDate: '2024-01-15T14:30:00.000Z',
      };

      it('should record usage as admin', async () => {
        const usageRecord = {
          id: 'usage_123456789',
          ...recordUsageDto,
          usageDate: new Date(recordUsageDto.usageDate),
        };
        mockBillingService.recordUsage.mockResolvedValue(usageRecord);

        const result = await controller.recordUsage(recordUsageDto, 'admin');

        expect(result).toEqual(usageRecord);
        expect(billingService.recordUsage).toHaveBeenCalledWith({
          ...recordUsageDto,
          usageDate: new Date(recordUsageDto.usageDate),
        });
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.recordUsage(recordUsageDto, 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /billing/usage/:subscriptionId', () => {
      const usageQuery = {
        feature: 'therapy_sessions',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      it('should get usage records for admin', async () => {
        const mockUsageRecords = [
          {
            id: 'usage_123456789',
            subscriptionId: 'sub_123456789',
            feature: 'therapy_sessions',
            quantity: 5,
            usageDate: new Date(),
          },
        ];
        mockBillingService.getUsageRecords.mockResolvedValue(mockUsageRecords);

        const result = await controller.getUsageRecords(
          'sub_123456789',
          'admin',
          usageQuery
        );

        expect(result).toEqual(mockUsageRecords);
        expect(billingService.getUsageRecords).toHaveBeenCalledWith(
          'sub_123456789',
          usageQuery.feature,
          new Date(usageQuery.startDate),
          new Date(usageQuery.endDate)
        );
      });
    });
  });

  describe('Statistics', () => {
    describe('GET /billing/statistics', () => {
      const statsQuery = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      it('should get billing statistics as admin', async () => {
        const mockStatistics = {
          totalRevenue: 15000.00,
          activeSubscriptions: 120,
          cancelledSubscriptions: 15,
          averageRevenuePer: 125.00,
          monthlyGrowthRate: 8.5,
        };
        mockBillingService.getBillingStatistics.mockResolvedValue(mockStatistics);

        const result = await controller.getBillingStatistics('admin', statsQuery);

        expect(result).toEqual(mockStatistics);
        expect(billingService.getBillingStatistics).toHaveBeenCalledWith(
          new Date(statsQuery.startDate),
          new Date(statsQuery.endDate)
        );
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.getBillingStatistics('client', statsQuery)
        ).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('Advanced Subscription Features', () => {
    describe('POST /billing/subscriptions/me/apply-discount', () => {
      const applyDiscountDto = {
        discountCode: 'SAVE20',
      };

      it('should apply discount to subscription successfully', async () => {
        const updatedSubscription = { ...mockSubscription, discountApplied: true };
        mockBillingService.applyDiscountToSubscription.mockResolvedValue(updatedSubscription);

        const result = await controller.applyDiscountToMySubscription(
          applyDiscountDto,
          TEST_USER_IDS.CLIENT
        );

        expect(result).toEqual(updatedSubscription);
        expect(billingService.applyDiscountToSubscription).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          applyDiscountDto.discountCode
        );
      });
    });

    describe('POST /billing/subscriptions/:id/renew', () => {
      it('should process subscription renewal as admin', async () => {
        const renewedSubscription = { ...mockSubscription, renewedAt: new Date() };
        mockBillingService.processSubscriptionRenewal.mockResolvedValue(renewedSubscription);

        const result = await controller.processSubscriptionRenewal('sub_123456789', 'admin');

        expect(result).toEqual(renewedSubscription);
        expect(billingService.processSubscriptionRenewal).toHaveBeenCalledWith('sub_123456789');
      });

      it('should throw unauthorized error for non-admin users', async () => {
        await expect(
          controller.processSubscriptionRenewal('sub_123456789', 'client')
        ).rejects.toThrow(UnauthorizedException);
      });
    });

    describe('GET /billing/subscriptions/:id/usage-analytics', () => {
      const analyticsQuery = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      it('should get subscription usage analytics', async () => {
        const mockAnalytics = {
          totalUsage: 25,
          featureBreakdown: {
            therapy_sessions: 20,
            support_tickets: 5,
          },
          utilizationRate: 83.3,
        };
        mockBillingService.getSubscriptionUsageAnalytics.mockResolvedValue(mockAnalytics);

        const result = await controller.getSubscriptionUsageAnalytics(
          'sub_123456789',
          'admin',
          TEST_USER_IDS.CLIENT,
          analyticsQuery
        );

        expect(result).toEqual(mockAnalytics);
        expect(billingService.getSubscriptionUsageAnalytics).toHaveBeenCalledWith(
          'sub_123456789',
          new Date(analyticsQuery.startDate),
          new Date(analyticsQuery.endDate)
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable scenarios', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockBillingService.findUserSubscription.mockRejectedValue(serviceError);

      await expect(
        controller.getMySubscription(TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(serviceError);
    });

    it('should handle payment processing failures', async () => {
      const paymentError = new Error('Payment processing failed');
      mockBillingService.createPayment.mockRejectedValue(paymentError);

      await expect(
        controller.createPayment({
          subscriptionId: 'sub_123456789',
          amount: 29.99,
          currency: 'USD',
          paymentMethodId: 'pm_123456789',
        })
      ).rejects.toThrow(paymentError);
    });

    it('should handle invalid discount codes', async () => {
      const invalidDiscountError = new Error('Invalid discount code');
      mockBillingService.validateDiscount.mockRejectedValue(invalidDiscountError);

      await expect(
        controller.validateDiscount({ code: 'INVALID', amount: 29.99 }, TEST_USER_IDS.CLIENT)
      ).rejects.toThrow(invalidDiscountError);
    });

    it('should handle subscription limits exceeded', async () => {
      const limitError = new Error('Subscription limit exceeded');
      mockBillingService.createSubscription.mockRejectedValue(limitError);

      await expect(
        controller.createSubscription(
          { planId: 'plan_basic_monthly', paymentMethodId: 'pm_123456789' },
          TEST_USER_IDS.CLIENT
        )
      ).rejects.toThrow(limitError);
    });
  });

  describe('Response Format Validation', () => {
    it('should return properly formatted subscription response', async () => {
      mockBillingService.findUserSubscription.mockResolvedValue(mockSubscription);

      const result = await controller.getMySubscription(TEST_USER_IDS.CLIENT);

      TestAssertions.expectValidEntity(result, ['id', 'userId', 'planId', 'status']);
      expect(result.id).toBe(mockSubscription.id);
      expect(result.userId).toBe(TEST_USER_IDS.CLIENT);
    });

    it('should return properly formatted payment method response', async () => {
      const mockPaymentMethods = [mockPaymentMethod];
      mockBillingService.findUserPaymentMethods.mockResolvedValue(mockPaymentMethods);

      const result = await controller.getMyPaymentMethods(TEST_USER_IDS.CLIENT);

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        TestAssertions.expectValidEntity(result[0], ['id', 'userId', 'type', 'isDefault']);
      }
    });

    it('should return properly formatted billing statistics', async () => {
      const mockStats = {
        totalRevenue: 15000.00,
        activeSubscriptions: 120,
        cancelledSubscriptions: 15,
        averageRevenuePer: 125.00,
        monthlyGrowthRate: 8.5,
      };
      mockBillingService.getBillingStatistics.mockResolvedValue(mockStats);

      const result = await controller.getBillingStatistics('admin', {});

      expect(typeof result.totalRevenue).toBe('number');
      expect(typeof result.activeSubscriptions).toBe('number');
      expect(typeof result.monthlyGrowthRate).toBe('number');
    });
  });
});