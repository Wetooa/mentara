import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../providers/prisma-client.provider';
import {
  SubscriptionStatus,
  SubscriptionTier,
  BillingCycle,
  PaymentStatus,
  PaymentMethodType,
  InvoiceStatus,
  DiscountType,
} from '@prisma/client';
import { createMockPrismaService, TEST_USER_IDS } from '../test-utils';

describe('BillingService', () => {
  let service: BillingService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Subscription Management', () => {
    describe('createSubscription', () => {
      const mockPlan = {
        id: 'plan-id',
        name: 'Premium Plan',
        tier: SubscriptionTier.PREMIUM,
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
      };

      const mockSubscriptionData = {
        userId: TEST_USER_IDS.CLIENT,
        planId: 'plan-id',
        billingCycle: BillingCycle.MONTHLY,
      };

      it('should successfully create a monthly subscription', async () => {
        const expectedSubscription = {
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          planId: 'plan-id',
          tier: SubscriptionTier.PREMIUM,
          billingCycle: BillingCycle.MONTHLY,
          amount: 29.99,
          status: SubscriptionStatus.ACTIVE,
          plan: mockPlan,
          defaultPaymentMethod: null,
        };

        prismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
        prismaService.subscription.create.mockResolvedValue(expectedSubscription);

        const result = await service.createSubscription(mockSubscriptionData);

        expect(result).toEqual(expectedSubscription);
        expect(prismaService.subscription.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            userId: TEST_USER_IDS.CLIENT,
            planId: 'plan-id',
            tier: SubscriptionTier.PREMIUM,
            billingCycle: BillingCycle.MONTHLY,
            amount: 29.99,
            status: SubscriptionStatus.ACTIVE,
          }),
          include: {
            plan: true,
            defaultPaymentMethod: true,
          },
        });
      });

      it('should successfully create a yearly subscription', async () => {
        const yearlyData = {
          ...mockSubscriptionData,
          billingCycle: BillingCycle.YEARLY,
        };

        const expectedSubscription = {
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          amount: 299.99,
          billingCycle: BillingCycle.YEARLY,
        };

        prismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
        prismaService.subscription.create.mockResolvedValue(expectedSubscription);

        const result = await service.createSubscription(yearlyData);

        expect(result.amount).toBe(299.99);
        expect(result.billingCycle).toBe(BillingCycle.YEARLY);
      });

      it('should create subscription with trial period', async () => {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);

        const trialData = {
          ...mockSubscriptionData,
          trialStart,
          trialEnd,
        };

        const expectedSubscription = {
          id: 'subscription-id',
          status: SubscriptionStatus.TRIALING,
          trialStart,
          trialEnd,
        };

        prismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
        prismaService.subscription.create.mockResolvedValue(expectedSubscription);

        const result = await service.createSubscription(trialData);

        expect(result.status).toBe(SubscriptionStatus.TRIALING);
        expect(prismaService.subscription.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: SubscriptionStatus.TRIALING,
            trialStart,
            trialEnd,
          }),
          include: expect.any(Object),
        });
      });

      it('should throw NotFoundException when plan does not exist', async () => {
        prismaService.subscriptionPlan.findUnique.mockResolvedValue(null);

        await expect(
          service.createSubscription(mockSubscriptionData),
        ).rejects.toThrow(NotFoundException);

        expect(prismaService.subscription.create).not.toHaveBeenCalled();
      });
    });

    describe('findUserSubscription', () => {
      it('should return user subscription with included data', async () => {
        const mockSubscription = {
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          plan: { name: 'Premium Plan' },
          defaultPaymentMethod: { cardLast4: '4242' },
          invoices: [{ id: 'invoice-1' }],
        };

        prismaService.subscription.findUnique.mockResolvedValue(mockSubscription);

        const result = await service.findUserSubscription(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockSubscription);
        expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT },
          include: {
            plan: true,
            defaultPaymentMethod: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        });
      });

      it('should return null when subscription does not exist', async () => {
        prismaService.subscription.findUnique.mockResolvedValue(null);

        const result = await service.findUserSubscription('non-existent-user');

        expect(result).toBeNull();
      });
    });

    describe('updateSubscription', () => {
      const mockSubscription = {
        id: 'subscription-id',
        userId: TEST_USER_IDS.CLIENT,
        planId: 'old-plan-id',
      };

      const mockNewPlan = {
        id: 'new-plan-id',
        tier: SubscriptionTier.ENTERPRISE,
        monthlyPrice: 99.99,
        yearlyPrice: 999.99,
      };

      it('should successfully update subscription plan', async () => {
        const updateData = {
          planId: 'new-plan-id',
          billingCycle: BillingCycle.MONTHLY,
        };

        const updatedSubscription = {
          ...mockSubscription,
          planId: 'new-plan-id',
          tier: SubscriptionTier.ENTERPRISE,
          amount: 99.99,
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(mockSubscription as any);
        prismaService.subscriptionPlan.findUnique.mockResolvedValue(mockNewPlan);
        prismaService.subscription.update.mockResolvedValue(updatedSubscription);

        const result = await service.updateSubscription(TEST_USER_IDS.CLIENT, updateData);

        expect(result).toEqual(updatedSubscription);
        expect(prismaService.subscription.update).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT },
          data: expect.objectContaining({
            planId: 'new-plan-id',
            tier: SubscriptionTier.ENTERPRISE,
            amount: 99.99,
            billingCycle: BillingCycle.MONTHLY,
          }),
          include: expect.any(Object),
        });
      });

      it('should throw NotFoundException when subscription does not exist', async () => {
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(null);

        await expect(
          service.updateSubscription('non-existent-user', { planId: 'new-plan' }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException when new plan does not exist', async () => {
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(mockSubscription as any);
        prismaService.subscriptionPlan.findUnique.mockResolvedValue(null);

        await expect(
          service.updateSubscription(TEST_USER_IDS.CLIENT, { planId: 'non-existent-plan' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription by updating status', async () => {
        const canceledSubscription = {
          id: 'subscription-id',
          status: SubscriptionStatus.CANCELED,
        };

        jest.spyOn(service, 'updateSubscription').mockResolvedValue(canceledSubscription as any);

        const result = await service.cancelSubscription(TEST_USER_IDS.CLIENT);

        expect(result.status).toBe(SubscriptionStatus.CANCELED);
        expect(service.updateSubscription).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, {
          status: SubscriptionStatus.CANCELED,
        });
      });
    });
  });

  describe('Subscription Plans', () => {
    describe('createSubscriptionPlan', () => {
      it('should successfully create a subscription plan', async () => {
        const planData = {
          name: 'Premium Plan',
          description: 'Full access plan',
          tier: SubscriptionTier.PREMIUM,
          monthlyPrice: 29.99,
          yearlyPrice: 299.99,
          features: { sessions: 'unlimited', storage: '100GB' },
          limits: { clients: 50 },
          trialDays: 14,
        };

        const expectedPlan = {
          id: 'plan-id',
          ...planData,
        };

        prismaService.subscriptionPlan.create.mockResolvedValue(expectedPlan);

        const result = await service.createSubscriptionPlan(planData);

        expect(result).toEqual(expectedPlan);
        expect(prismaService.subscriptionPlan.create).toHaveBeenCalledWith({
          data: planData,
        });
      });
    });

    describe('findAllPlans', () => {
      it('should return active plans by default', async () => {
        const mockPlans = [
          { id: 'plan-1', name: 'Basic', monthlyPrice: 9.99 },
          { id: 'plan-2', name: 'Premium', monthlyPrice: 29.99 },
        ];

        prismaService.subscriptionPlan.findMany.mockResolvedValue(mockPlans);

        const result = await service.findAllPlans();

        expect(result).toEqual(mockPlans);
        expect(prismaService.subscriptionPlan.findMany).toHaveBeenCalledWith({
          where: { isActive: true },
          orderBy: { monthlyPrice: 'asc' },
        });
      });

      it('should return inactive plans when specified', async () => {
        await service.findAllPlans(false);

        expect(prismaService.subscriptionPlan.findMany).toHaveBeenCalledWith({
          where: { isActive: false },
          orderBy: { monthlyPrice: 'asc' },
        });
      });
    });

    describe('updatePlan', () => {
      it('should successfully update plan', async () => {
        const updateData = {
          name: 'Updated Plan',
          monthlyPrice: 39.99,
          features: { newFeature: true },
        };

        const updatedPlan = {
          id: 'plan-id',
          ...updateData,
        };

        prismaService.subscriptionPlan.update.mockResolvedValue(updatedPlan);

        const result = await service.updatePlan('plan-id', updateData);

        expect(result).toEqual(updatedPlan);
        expect(prismaService.subscriptionPlan.update).toHaveBeenCalledWith({
          where: { id: 'plan-id' },
          data: updateData,
        });
      });
    });
  });

  describe('Payment Methods', () => {
    describe('createPaymentMethod', () => {
      it('should create payment method and set as default', async () => {
        const paymentMethodData = {
          userId: TEST_USER_IDS.CLIENT,
          type: PaymentMethodType.CARD,
          cardLast4: '4242',
          cardBrand: 'visa',
          cardExpMonth: 12,
          cardExpYear: 2025,
          isDefault: true,
        };

        const expectedPaymentMethod = {
          id: 'payment-method-id',
          ...paymentMethodData,
        };

        prismaService.paymentMethod.updateMany.mockResolvedValue({ count: 1 });
        prismaService.paymentMethod.create.mockResolvedValue(expectedPaymentMethod);

        const result = await service.createPaymentMethod(paymentMethodData);

        expect(result).toEqual(expectedPaymentMethod);
        expect(prismaService.paymentMethod.updateMany).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT, isDefault: true },
          data: { isDefault: false },
        });
        expect(prismaService.paymentMethod.create).toHaveBeenCalledWith({
          data: paymentMethodData,
        });
      });

      it('should create payment method without setting as default', async () => {
        const paymentMethodData = {
          userId: TEST_USER_IDS.CLIENT,
          type: PaymentMethodType.CARD,
          cardLast4: '4242',
        };

        prismaService.paymentMethod.create.mockResolvedValue(paymentMethodData);

        await service.createPaymentMethod(paymentMethodData);

        expect(prismaService.paymentMethod.updateMany).not.toHaveBeenCalled();
      });
    });

    describe('findUserPaymentMethods', () => {
      it('should return user payment methods ordered by default and creation date', async () => {
        const mockPaymentMethods = [
          { id: 'pm-1', isDefault: true, cardLast4: '4242' },
          { id: 'pm-2', isDefault: false, cardLast4: '1234' },
        ];

        prismaService.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);

        const result = await service.findUserPaymentMethods(TEST_USER_IDS.CLIENT);

        expect(result).toEqual(mockPaymentMethods);
        expect(prismaService.paymentMethod.findMany).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT, isActive: true },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
      });
    });

    describe('updatePaymentMethod', () => {
      const mockPaymentMethod = {
        id: 'payment-method-id',
        userId: TEST_USER_IDS.CLIENT,
      };

      it('should successfully update payment method', async () => {
        const updateData = { isDefault: true };
        const updatedPaymentMethod = { ...mockPaymentMethod, ...updateData };

        prismaService.paymentMethod.findUnique.mockResolvedValue(mockPaymentMethod);
        prismaService.paymentMethod.updateMany.mockResolvedValue({ count: 1 });
        prismaService.paymentMethod.update.mockResolvedValue(updatedPaymentMethod);

        const result = await service.updatePaymentMethod('payment-method-id', updateData);

        expect(result).toEqual(updatedPaymentMethod);
        expect(prismaService.paymentMethod.updateMany).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT, isDefault: true },
          data: { isDefault: false },
        });
      });

      it('should throw NotFoundException when payment method does not exist', async () => {
        prismaService.paymentMethod.findUnique.mockResolvedValue(null);

        await expect(
          service.updatePaymentMethod('non-existent-id', { isDefault: true }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deletePaymentMethod', () => {
      it('should soft delete payment method by setting isActive to false', async () => {
        const deactivatedPaymentMethod = {
          id: 'payment-method-id',
          isActive: false,
        };

        prismaService.paymentMethod.update.mockResolvedValue(deactivatedPaymentMethod);

        const result = await service.deletePaymentMethod('payment-method-id');

        expect(result).toEqual(deactivatedPaymentMethod);
        expect(prismaService.paymentMethod.update).toHaveBeenCalledWith({
          where: { id: 'payment-method-id' },
          data: { isActive: false },
        });
      });
    });
  });

  describe('Payments', () => {
    describe('createPayment', () => {
      it('should create payment with default values', async () => {
        const paymentData = {
          amount: 29.99,
          paymentMethodId: 'payment-method-id',
          subscriptionId: 'subscription-id',
          description: 'Monthly subscription',
        };

        const expectedPayment = {
          id: 'payment-id',
          ...paymentData,
          status: PaymentStatus.PENDING,
          currency: 'USD',
          paymentMethod: { cardLast4: '4242' },
          subscription: { tier: SubscriptionTier.PREMIUM },
          invoice: null,
        };

        prismaService.payment.create.mockResolvedValue(expectedPayment);

        const result = await service.createPayment(paymentData);

        expect(result).toEqual(expectedPayment);
        expect(prismaService.payment.create).toHaveBeenCalledWith({
          data: {
            ...paymentData,
            status: PaymentStatus.PENDING,
            currency: 'USD',
          },
          include: {
            paymentMethod: true,
            subscription: true,
            invoice: true,
          },
        });
      });

      it('should create payment with custom currency', async () => {
        const paymentData = {
          amount: 25.99,
          currency: 'EUR',
        };

        prismaService.payment.create.mockResolvedValue({ id: 'payment-id', currency: 'EUR' });

        await service.createPayment(paymentData);

        expect(prismaService.payment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            currency: 'EUR',
          }),
          include: expect.any(Object),
        });
      });
    });

    describe('updatePaymentStatus', () => {
      it('should update payment status to succeeded', async () => {
        const updatedPayment = {
          id: 'payment-id',
          status: PaymentStatus.SUCCEEDED,
          processedAt: expect.any(Date),
        };

        prismaService.payment.update.mockResolvedValue(updatedPayment);

        const result = await service.updatePaymentStatus('payment-id', PaymentStatus.SUCCEEDED);

        expect(result).toEqual(updatedPayment);
        expect(prismaService.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment-id' },
          data: {
            status: PaymentStatus.SUCCEEDED,
            processedAt: expect.any(Date),
          },
        });
      });

      it('should update payment status to failed with metadata', async () => {
        const metadata = {
          failureCode: 'card_declined',
          failureMessage: 'Your card was declined.',
        };

        const updatedPayment = {
          id: 'payment-id',
          status: PaymentStatus.FAILED,
          failedAt: expect.any(Date),
          failureCode: 'card_declined',
          failureMessage: 'Your card was declined.',
        };

        prismaService.payment.update.mockResolvedValue(updatedPayment);

        const result = await service.updatePaymentStatus(
          'payment-id',
          PaymentStatus.FAILED,
          metadata,
        );

        expect(result).toEqual(updatedPayment);
        expect(prismaService.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment-id' },
          data: {
            status: PaymentStatus.FAILED,
            failedAt: expect.any(Date),
            failureCode: 'card_declined',
            failureMessage: 'Your card was declined.',
          },
        });
      });
    });

    describe('findPayments', () => {
      it('should return payments with filters', async () => {
        const mockPayments = [
          { id: 'payment-1', status: PaymentStatus.SUCCEEDED },
          { id: 'payment-2', status: PaymentStatus.SUCCEEDED },
        ];

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        prismaService.payment.findMany.mockResolvedValue(mockPayments);

        const result = await service.findPayments(
          'subscription-id',
          PaymentStatus.SUCCEEDED,
          startDate,
          endDate,
        );

        expect(result).toEqual(mockPayments);
        expect(prismaService.payment.findMany).toHaveBeenCalledWith({
          where: {
            subscriptionId: 'subscription-id',
            status: PaymentStatus.SUCCEEDED,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            paymentMethod: true,
            subscription: true,
            invoice: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      });
    });
  });

  describe('Invoices', () => {
    describe('createInvoice', () => {
      it('should create invoice with calculated total', async () => {
        const invoiceData = {
          subscriptionId: 'subscription-id',
          subtotal: 100,
          taxAmount: 10,
          discountAmount: 5,
          dueDate: new Date('2024-02-01'),
        };

        const expectedInvoice = {
          id: 'invoice-id',
          ...invoiceData,
          number: 'INV-2024-000001',
          total: 105, // 100 + 10 - 5
          amountDue: 105,
          status: InvoiceStatus.OPEN,
        };

        // Mock generateInvoiceNumber
        jest.spyOn(service as any, 'generateInvoiceNumber').mockResolvedValue('INV-2024-000001');
        prismaService.invoice.create.mockResolvedValue(expectedInvoice);

        const result = await service.createInvoice(invoiceData);

        expect(result).toEqual(expectedInvoice);
        expect(prismaService.invoice.create).toHaveBeenCalledWith({
          data: {
            ...invoiceData,
            number: 'INV-2024-000001',
            total: 105,
            amountDue: 105,
            status: InvoiceStatus.OPEN,
          },
          include: {
            subscription: true,
            lineItems: true,
          },
        });
      });
    });

    describe('findInvoices', () => {
      it('should return invoices with filters', async () => {
        const mockInvoices = [
          { id: 'invoice-1', status: InvoiceStatus.OPEN },
          { id: 'invoice-2', status: InvoiceStatus.PAID },
        ];

        prismaService.invoice.findMany.mockResolvedValue(mockInvoices);

        const result = await service.findInvoices('subscription-id', InvoiceStatus.OPEN);

        expect(result).toEqual(mockInvoices);
        expect(prismaService.invoice.findMany).toHaveBeenCalledWith({
          where: {
            subscriptionId: 'subscription-id',
            status: InvoiceStatus.OPEN,
          },
          include: {
            subscription: {
              include: { user: true },
            },
            lineItems: true,
            payments: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('markInvoiceAsPaid', () => {
      it('should mark invoice as paid when fully paid', async () => {
        const mockInvoice = {
          id: 'invoice-id',
          total: 100,
          payments: [
            { amount: 60, status: PaymentStatus.SUCCEEDED },
            { amount: 40, status: PaymentStatus.SUCCEEDED },
          ],
        };

        const updatedInvoice = {
          ...mockInvoice,
          status: InvoiceStatus.PAID,
          amountPaid: 100,
          paidAt: expect.any(Date),
        };

        prismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
        prismaService.invoice.update.mockResolvedValue(updatedInvoice);

        const result = await service.markInvoiceAsPaid('invoice-id');

        expect(result).toEqual(updatedInvoice);
        expect(prismaService.invoice.update).toHaveBeenCalledWith({
          where: { id: 'invoice-id' },
          data: {
            status: InvoiceStatus.PAID,
            amountPaid: 100,
            paidAt: expect.any(Date),
          },
        });
      });

      it('should keep invoice open when partially paid', async () => {
        const mockInvoice = {
          id: 'invoice-id',
          total: 100,
          payments: [
            { amount: 30, status: PaymentStatus.SUCCEEDED },
            { amount: 20, status: PaymentStatus.FAILED },
          ],
        };

        prismaService.invoice.findUnique.mockResolvedValue(mockInvoice);
        prismaService.invoice.update.mockResolvedValue({
          ...mockInvoice,
          status: InvoiceStatus.OPEN,
          amountPaid: 30,
        });

        const result = await service.markInvoiceAsPaid('invoice-id');

        expect(result.status).toBe(InvoiceStatus.OPEN);
        expect(result.amountPaid).toBe(30);
      });

      it('should throw NotFoundException when invoice does not exist', async () => {
        prismaService.invoice.findUnique.mockResolvedValue(null);

        await expect(service.markInvoiceAsPaid('non-existent-id')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Discounts', () => {
    describe('createDiscount', () => {
      it('should create discount with default valid from date', async () => {
        const discountData = {
          code: 'SAVE20',
          name: '20% Off',
          type: DiscountType.PERCENT,
          percentOff: 20,
        };

        const expectedDiscount = {
          id: 'discount-id',
          ...discountData,
          validFrom: expect.any(Date),
        };

        prismaService.discount.create.mockResolvedValue(expectedDiscount);

        const result = await service.createDiscount(discountData);

        expect(result).toEqual(expectedDiscount);
        expect(prismaService.discount.create).toHaveBeenCalledWith({
          data: {
            ...discountData,
            validFrom: expect.any(Date),
          },
        });
      });
    });

    describe('validateDiscount', () => {
      const mockDiscount = {
        id: 'discount-id',
        code: 'SAVE20',
        isActive: true,
        validUntil: new Date('2024-12-31'),
        maxUses: 100,
        currentUses: 50,
        maxUsesPerUser: 1,
        minAmount: 50,
        redemptions: [],
      };

      it('should return valid discount', async () => {
        prismaService.discount.findUnique.mockResolvedValue(mockDiscount);

        const result = await service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100);

        expect(result).toEqual(mockDiscount);
      });

      it('should throw BadRequestException for invalid discount code', async () => {
        prismaService.discount.findUnique.mockResolvedValue(null);

        await expect(
          service.validateDiscount('INVALID', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for inactive discount', async () => {
        prismaService.discount.findUnique.mockResolvedValue({
          ...mockDiscount,
          isActive: false,
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for expired discount', async () => {
        prismaService.discount.findUnique.mockResolvedValue({
          ...mockDiscount,
          validUntil: new Date('2020-01-01'), // Expired
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when max uses reached', async () => {
        prismaService.discount.findUnique.mockResolvedValue({
          ...mockDiscount,
          maxUses: 50,
          currentUses: 50, // Reached limit
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when user has already used discount', async () => {
        prismaService.discount.findUnique.mockResolvedValue({
          ...mockDiscount,
          redemptions: [{ userId: TEST_USER_IDS.CLIENT }], // User already used
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when amount is below minimum', async () => {
        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 25), // Below min of 50
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('redeemDiscount', () => {
      it('should redeem discount in transaction', async () => {
        const mockTransaction = {
          discountRedemption: {
            create: jest.fn(),
          },
          discount: {
            update: jest.fn(),
          },
        };

        prismaService.$transaction.mockImplementation(async (callback) => {
          return callback(mockTransaction);
        });

        await service.redeemDiscount('discount-id', TEST_USER_IDS.CLIENT, 20);

        expect(mockTransaction.discountRedemption.create).toHaveBeenCalledWith({
          data: {
            discountId: 'discount-id',
            userId: TEST_USER_IDS.CLIENT,
            amountSaved: 20,
          },
        });

        expect(mockTransaction.discount.update).toHaveBeenCalledWith({
          where: { id: 'discount-id' },
          data: {
            currentUses: { increment: 1 },
          },
        });
      });
    });
  });

  describe('Usage Records', () => {
    describe('recordUsage', () => {
      it('should create usage record with default date', async () => {
        const usageData = {
          subscriptionId: 'subscription-id',
          feature: 'api_calls',
          quantity: 100,
          unit: 'requests',
          metadata: { endpoint: '/api/users' },
        };

        const expectedUsage = {
          id: 'usage-id',
          ...usageData,
          usageDate: expect.any(Date),
        };

        prismaService.usageRecord.create.mockResolvedValue(expectedUsage);

        const result = await service.recordUsage(usageData);

        expect(result).toEqual(expectedUsage);
        expect(prismaService.usageRecord.create).toHaveBeenCalledWith({
          data: {
            ...usageData,
            usageDate: expect.any(Date),
          },
        });
      });
    });

    describe('getUsageRecords', () => {
      it('should return usage records with filters', async () => {
        const mockUsageRecords = [
          { id: 'usage-1', feature: 'api_calls', quantity: 100 },
          { id: 'usage-2', feature: 'api_calls', quantity: 50 },
        ];

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        prismaService.usageRecord.findMany.mockResolvedValue(mockUsageRecords);

        const result = await service.getUsageRecords(
          'subscription-id',
          'api_calls',
          startDate,
          endDate,
        );

        expect(result).toEqual(mockUsageRecords);
        expect(prismaService.usageRecord.findMany).toHaveBeenCalledWith({
          where: {
            subscriptionId: 'subscription-id',
            feature: 'api_calls',
            usageDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { usageDate: 'desc' },
        });
      });
    });
  });

  describe('Helper Methods', () => {
    describe('generateInvoiceNumber', () => {
      it('should generate first invoice number for year', async () => {
        prismaService.invoice.findFirst.mockResolvedValue(null);

        const result = await (service as any).generateInvoiceNumber();

        const currentYear = new Date().getFullYear();
        expect(result).toBe(`INV-${currentYear}-000001`);
      });

      it('should increment from last invoice number', async () => {
        const currentYear = new Date().getFullYear();
        const lastInvoice = {
          number: `INV-${currentYear}-000005`,
        };

        prismaService.invoice.findFirst.mockResolvedValue(lastInvoice);

        const result = await (service as any).generateInvoiceNumber();

        expect(result).toBe(`INV-${currentYear}-000006`);
      });

      it('should handle invalid invoice number format', async () => {
        const lastInvoice = {
          number: 'INVALID-FORMAT',
        };

        prismaService.invoice.findFirst.mockResolvedValue(lastInvoice);

        const result = await (service as any).generateInvoiceNumber();

        const currentYear = new Date().getFullYear();
        expect(result).toBe(`INV-${currentYear}-000001`);
      });
    });

    describe('getBillingStatistics', () => {
      it('should return billing statistics', async () => {
        const mockStats = {
          totalRevenue: { _sum: { amount: 10000 } },
          activeSubscriptions: 25,
          trialSubscriptions: 5,
          canceledSubscriptions: 10,
          subscriptionsByTier: [
            { tier: SubscriptionTier.BASIC, _count: { tier: 10 } },
            { tier: SubscriptionTier.PREMIUM, _count: { tier: 15 } },
          ],
        };

        prismaService.payment.aggregate.mockResolvedValue(mockStats.totalRevenue);
        prismaService.subscription.count
          .mockResolvedValueOnce(mockStats.activeSubscriptions)
          .mockResolvedValueOnce(mockStats.trialSubscriptions)
          .mockResolvedValueOnce(mockStats.canceledSubscriptions);
        prismaService.subscription.groupBy.mockResolvedValue(mockStats.subscriptionsByTier);

        const result = await service.getBillingStatistics();

        expect(result).toEqual({
          totalRevenue: 10000,
          activeSubscriptions: 25,
          trialSubscriptions: 5,
          canceledSubscriptions: 10,
          subscriptionsByTier: mockStats.subscriptionsByTier,
        });
      });

      it('should handle null revenue sum', async () => {
        prismaService.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
        prismaService.subscription.count.mockResolvedValue(0);
        prismaService.subscription.groupBy.mockResolvedValue([]);

        const result = await service.getBillingStatistics();

        expect(result.totalRevenue).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in createSubscription', async () => {
      prismaService.subscriptionPlan.findUnique.mockResolvedValue({
        id: 'plan-id',
        monthlyPrice: 29.99,
      });
      prismaService.subscription.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.createSubscription({
          userId: TEST_USER_IDS.CLIENT,
          planId: 'plan-id',
        }),
      ).rejects.toThrow('Database error');
    });

    it('should handle database errors in payment operations', async () => {
      prismaService.payment.create.mockRejectedValue(new Error('Payment creation failed'));

      await expect(
        service.createPayment({
          amount: 29.99,
        }),
      ).rejects.toThrow('Payment creation failed');
    });

    it('should handle transaction errors in discount redemption', async () => {
      prismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.redeemDiscount('discount-id', TEST_USER_IDS.CLIENT, 20),
      ).rejects.toThrow('Transaction failed');
    });
  });
});