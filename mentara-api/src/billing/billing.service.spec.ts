import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
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

        (
          prismaService.subscriptionPlan.findUnique as jest.Mock
        ).mockResolvedValue(mockPlan);
        (prismaService.subscription.create as jest.Mock).mockResolvedValue(
          expectedSubscription,
        );

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

        (
          prismaService.subscriptionPlan.findUnique as jest.Mock
        ).mockResolvedValue(mockPlan);
        (prismaService.subscription.create as jest.Mock).mockResolvedValue(
          expectedSubscription,
        );

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

        (
          prismaService.subscriptionPlan.findUnique as jest.Mock
        ).mockResolvedValue(mockPlan);
        (prismaService.subscription.create as jest.Mock).mockResolvedValue(
          expectedSubscription,
        );

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
        (
          prismaService.subscriptionPlan.findUnique as jest.Mock
        ).mockResolvedValue(null);

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

        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(
          mockSubscription,
        );

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
        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(
          null,
        );

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

        jest
          .spyOn(service, 'findUserSubscription')
          .mockResolvedValue(mockSubscription as any);
        (
          prismaService.subscriptionPlan.findUnique as jest.Mock
        ).mockResolvedValue(mockNewPlan);
        (prismaService.subscription.update as jest.Mock).mockResolvedValue(
          updatedSubscription,
        );

        const result = await service.updateSubscription(
          TEST_USER_IDS.CLIENT,
          updateData,
        );

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
          service.updateSubscription('non-existent-user', {
            planId: 'new-plan',
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException when new plan does not exist', async () => {
        jest
          .spyOn(service, 'findUserSubscription')
          .mockResolvedValue(mockSubscription as any);
        (
          prismaService.subscriptionPlan.findUnique as jest.Mock
        ).mockResolvedValue(null);

        await expect(
          service.updateSubscription(TEST_USER_IDS.CLIENT, {
            planId: 'non-existent-plan',
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription by updating status', async () => {
        const canceledSubscription = {
          id: 'subscription-id',
          status: SubscriptionStatus.CANCELED,
        };

        jest
          .spyOn(service, 'updateSubscription')
          .mockResolvedValue(canceledSubscription as any);

        const result = await service.cancelSubscription(TEST_USER_IDS.CLIENT);

        expect(result.status).toBe(SubscriptionStatus.CANCELED);
        expect(service.updateSubscription).toHaveBeenCalledWith(
          TEST_USER_IDS.CLIENT,
          {
            status: SubscriptionStatus.CANCELED,
          },
        );
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

        (prismaService.subscriptionPlan.create as jest.Mock).mockResolvedValue(
          expectedPlan,
        );

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

        (
          prismaService.subscriptionPlan.findMany as jest.Mock
        ).mockResolvedValue(mockPlans);

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

        (prismaService.subscriptionPlan.update as jest.Mock).mockResolvedValue(
          updatedPlan,
        );

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

        (prismaService.paymentMethod.updateMany as jest.Mock).mockResolvedValue(
          { count: 1 },
        );
        (prismaService.paymentMethod.create as jest.Mock).mockResolvedValue(
          expectedPaymentMethod,
        );

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

        (prismaService.paymentMethod.create as jest.Mock).mockResolvedValue(
          paymentMethodData,
        );

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

        (prismaService.paymentMethod.findMany as jest.Mock).mockResolvedValue(
          mockPaymentMethods,
        );

        const result = await service.findUserPaymentMethods(
          TEST_USER_IDS.CLIENT,
        );

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

        (prismaService.paymentMethod.findUnique as jest.Mock).mockResolvedValue(
          mockPaymentMethod,
        );
        (prismaService.paymentMethod.updateMany as jest.Mock).mockResolvedValue(
          { count: 1 },
        );
        (prismaService.paymentMethod.update as jest.Mock).mockResolvedValue(
          updatedPaymentMethod,
        );

        const result = await service.updatePaymentMethod(
          'payment-method-id',
          updateData,
        );

        expect(result).toEqual(updatedPaymentMethod);
        expect(prismaService.paymentMethod.updateMany).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT, isDefault: true },
          data: { isDefault: false },
        });
      });

      it('should throw NotFoundException when payment method does not exist', async () => {
        (prismaService.paymentMethod.findUnique as jest.Mock).mockResolvedValue(
          null,
        );

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

        (prismaService.paymentMethod.update as jest.Mock).mockResolvedValue(
          deactivatedPaymentMethod,
        );

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

        (prismaService.payment.create as jest.Mock).mockResolvedValue(
          expectedPayment,
        );

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

        (prismaService.payment.create as jest.Mock).mockResolvedValue({
          id: 'payment-id',
          currency: 'EUR',
        });

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

        (prismaService.payment.update as jest.Mock).mockResolvedValue(
          updatedPayment,
        );

        const result = await service.updatePaymentStatus(
          'payment-id',
          PaymentStatus.SUCCEEDED,
        );

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

        (prismaService.payment.update as jest.Mock).mockResolvedValue(
          updatedPayment,
        );

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

        (prismaService.payment.findMany as jest.Mock).mockResolvedValue(
          mockPayments,
        );

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
        jest
          .spyOn(service as any, 'generateInvoiceNumber')
          .mockResolvedValue('INV-2024-000001');
        (prismaService.invoice.create as jest.Mock).mockResolvedValue(
          expectedInvoice,
        );

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

        (prismaService.invoice.findMany as jest.Mock).mockResolvedValue(
          mockInvoices,
        );

        const result = await service.findInvoices(
          'subscription-id',
          InvoiceStatus.OPEN,
        );

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

        (prismaService.invoice.findUnique as jest.Mock).mockResolvedValue(
          mockInvoice,
        );
        (prismaService.invoice.update as jest.Mock).mockResolvedValue(
          updatedInvoice,
        );

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

        (prismaService.invoice.findUnique as jest.Mock).mockResolvedValue(
          mockInvoice,
        );
        (prismaService.invoice.update as jest.Mock).mockResolvedValue({
          ...mockInvoice,
          status: InvoiceStatus.OPEN,
          amountPaid: 30,
        });

        const result = await service.markInvoiceAsPaid('invoice-id');

        expect(result.status).toBe(InvoiceStatus.OPEN);
        expect(result.amountPaid).toBe(30);
      });

      it('should throw NotFoundException when invoice does not exist', async () => {
        (prismaService.invoice.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.markInvoiceAsPaid('non-existent-id'),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Discounts', () => {
    describe('createDiscount', () => {
      it('should create discount with default valid from date', async () => {
        const discountData = {
          code: 'SAVE20',
          name: '20% Off',
          type: DiscountType.PERCENTAGE,
          percentOff: 20,
        };

        const expectedDiscount = {
          id: 'discount-id',
          ...discountData,
          validFrom: expect.any(Date),
        };

        (prismaService.discount.create as jest.Mock).mockResolvedValue(
          expectedDiscount,
        );

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
        (prismaService.discount.findUnique as jest.Mock).mockResolvedValue(
          mockDiscount,
        );

        const result = await service.validateDiscount(
          'SAVE20',
          TEST_USER_IDS.CLIENT,
          100,
        );

        expect(result).toEqual(mockDiscount);
      });

      it('should throw BadRequestException for invalid discount code', async () => {
        (prismaService.discount.findUnique as jest.Mock).mockResolvedValue(
          null,
        );

        await expect(
          service.validateDiscount('INVALID', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for inactive discount', async () => {
        (prismaService.discount.findUnique as jest.Mock).mockResolvedValue({
          ...mockDiscount,
          isActive: false,
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for expired discount', async () => {
        (prismaService.discount.findUnique as jest.Mock).mockResolvedValue({
          ...mockDiscount,
          validUntil: new Date('2020-01-01'), // Expired
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when max uses reached', async () => {
        (prismaService.discount.findUnique as jest.Mock).mockResolvedValue({
          ...mockDiscount,
          maxUses: 50,
          currentUses: 50, // Reached limit
        });

        await expect(
          service.validateDiscount('SAVE20', TEST_USER_IDS.CLIENT, 100),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when user has already used discount', async () => {
        (prismaService.discount.findUnique as jest.Mock).mockResolvedValue({
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
          ...createMockPrismaService(),
          discountRedemption: {
            create: jest.fn(),
          },
          discount: {
            update: jest.fn(),
          },
        };

        (prismaService.$transaction as jest.Mock).mockImplementation(
          async (callback) => {
            return callback(mockTransaction);
          },
        );

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

        (prismaService.usageRecord.create as jest.Mock).mockResolvedValue(
          expectedUsage,
        );

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

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue(
          mockUsageRecords,
        );

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
        (prismaService.invoice.findFirst as jest.Mock).mockResolvedValue(null);

        const result = await (service as any).generateInvoiceNumber();

        const currentYear = new Date().getFullYear();
        expect(result).toBe(`INV-${currentYear}-000001`);
      });

      it('should increment from last invoice number', async () => {
        const currentYear = new Date().getFullYear();
        const lastInvoice = {
          number: `INV-${currentYear}-000005`,
        };

        (prismaService.invoice.findFirst as jest.Mock).mockResolvedValue(
          lastInvoice,
        );

        const result = await (service as any).generateInvoiceNumber();

        expect(result).toBe(`INV-${currentYear}-000006`);
      });

      it('should handle invalid invoice number format', async () => {
        const lastInvoice = {
          number: 'INVALID-FORMAT',
        };

        (prismaService.invoice.findFirst as jest.Mock).mockResolvedValue(
          lastInvoice,
        );

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

        (prismaService.payment.aggregate as jest.Mock).mockResolvedValue(
          mockStats.totalRevenue,
        );
        (prismaService.subscription.count as jest.Mock)
          .mockResolvedValueOnce(mockStats.activeSubscriptions)
          .mockResolvedValueOnce(mockStats.trialSubscriptions)
          .mockResolvedValueOnce(mockStats.canceledSubscriptions);
        (prismaService.subscription.groupBy as jest.Mock).mockResolvedValue(
          mockStats.subscriptionsByTier,
        );

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
        (prismaService.payment.aggregate as jest.Mock).mockResolvedValue({
          _sum: { amount: null },
        });
        (prismaService.subscription.count as jest.Mock).mockResolvedValue(0);
        (prismaService.subscription.groupBy as jest.Mock).mockResolvedValue([]);

        const result = await service.getBillingStatistics();

        expect(result.totalRevenue).toBe(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in createSubscription', async () => {
      (
        prismaService.subscriptionPlan.findUnique as jest.Mock
      ).mockResolvedValue({
        id: 'plan-id',
        monthlyPrice: 29.99,
      });
      (prismaService.subscription.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.createSubscription({
          userId: TEST_USER_IDS.CLIENT,
          planId: 'plan-id',
        }),
      ).rejects.toThrow('Database error');
    });

    it('should handle database errors in payment operations', async () => {
      (prismaService.payment.create as jest.Mock).mockRejectedValue(
        new Error('Payment creation failed'),
      );

      await expect(
        service.createPayment({
          amount: 29.99,
        }),
      ).rejects.toThrow('Payment creation failed');
    });

    it('should handle transaction errors in discount redemption', async () => {
      prismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(
        service.redeemDiscount('discount-id', TEST_USER_IDS.CLIENT, 20),
      ).rejects.toThrow('Transaction failed');

      // Verify no partial state changes
      expect(prismaService.discountRedemption.create).not.toHaveBeenCalled();
    });
  });

  describe('Advanced Subscription Management', () => {
    const mockSubscription = {
      id: 'subscription-id',
      userId: TEST_USER_IDS.CLIENT,
      planId: 'old-plan-id',
      tier: SubscriptionTier.BASIC,
      billingCycle: BillingCycle.MONTHLY,
      amount: 9.99,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-02-01'),
      plan: {
        id: 'old-plan-id',
        monthlyPrice: 9.99,
        yearlyPrice: 99.99,
      },
    };

    const mockNewPlan = {
      id: 'new-plan-id',
      tier: SubscriptionTier.PREMIUM,
      monthlyPrice: 29.99,
      yearlyPrice: 299.99,
    };

    describe('changeSubscriptionPlan', () => {
      beforeEach(() => {
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(mockSubscription as any);
        (prismaService.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockNewPlan);
      });

      it('should change plan with immediate proration', async () => {
        const options = {
          billingCycle: BillingCycle.MONTHLY,
          prorationBehavior: 'create_prorations',
          effectiveDate: new Date('2024-01-15'),
        };

        const expectedUpdate = {
          ...mockSubscription,
          planId: 'new-plan-id',
          tier: SubscriptionTier.PREMIUM,
          amount: 29.99,
        };

        const mockProrationCredit = {
          id: 'credit-id',
          amount: -5.00,
          description: 'Proration credit for plan change',
        };

        const mockProrationCharge = {
          id: 'charge-id',
          amount: 15.00,
          description: 'Proration charge for plan change',
        };

        (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
          const mockTxn = {
            subscription: {
              update: jest.fn().mockResolvedValue(expectedUpdate),
            },
            invoice: {
              create: jest.fn().mockResolvedValue({
                id: 'proration-invoice',
                lineItems: [mockProrationCredit, mockProrationCharge],
              }),
            },
            invoiceLineItem: {
              createMany: jest.fn(),
            },
          };
          return callback(mockTxn);
        });

        const result = await service.changeSubscriptionPlan(
          TEST_USER_IDS.CLIENT,
          'new-plan-id',
          options
        );

        expect(result).toEqual(expectedUpdate);
        expect(prismaService.$transaction).toHaveBeenCalled();
      });

      it('should change plan with no proration', async () => {
        const options = {
          billingCycle: BillingCycle.MONTHLY,
          prorationBehavior: 'none',
        };

        const expectedUpdate = {
          ...mockSubscription,
          planId: 'new-plan-id',
          tier: SubscriptionTier.PREMIUM,
          amount: 29.99,
        };

        (prismaService.subscription.update as jest.Mock).mockResolvedValue(expectedUpdate);

        const result = await service.changeSubscriptionPlan(
          TEST_USER_IDS.CLIENT,
          'new-plan-id',
          options
        );

        expect(result).toEqual(expectedUpdate);
        expect(prismaService.subscription.update).toHaveBeenCalledWith({
          where: { userId: TEST_USER_IDS.CLIENT },
          data: {
            planId: 'new-plan-id',
            tier: SubscriptionTier.PREMIUM,
            amount: 29.99,
            billingCycle: BillingCycle.MONTHLY,
          },
          include: expect.any(Object),
        });
      });

      it('should change plan with effective date in future', async () => {
        const futureDate = new Date('2024-02-01');
        const options = {
          billingCycle: BillingCycle.YEARLY,
          effectiveDate: futureDate,
          prorationBehavior: 'none',
        };

        const expectedUpdate = {
          ...mockSubscription,
          planId: 'new-plan-id',
          tier: SubscriptionTier.PREMIUM,
          amount: 299.99,
          scheduledPlanChange: {
            newPlanId: 'new-plan-id',
            effectiveDate: futureDate,
          },
        };

        (prismaService.subscription.update as jest.Mock).mockResolvedValue(expectedUpdate);

        const result = await service.changeSubscriptionPlan(
          TEST_USER_IDS.CLIENT,
          'new-plan-id',
          options
        );

        expect(result.scheduledPlanChange).toBeDefined();
        expect(result.scheduledPlanChange.effectiveDate).toEqual(futureDate);
      });

      it('should throw error when changing to same plan', async () => {
        await expect(
          service.changeSubscriptionPlan(
            TEST_USER_IDS.CLIENT,
            'old-plan-id',
            { billingCycle: BillingCycle.MONTHLY }
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw error when subscription is canceled', async () => {
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue({
          ...mockSubscription,
          status: SubscriptionStatus.CANCELED,
        } as any);

        await expect(
          service.changeSubscriptionPlan(
            TEST_USER_IDS.CLIENT,
            'new-plan-id',
            { billingCycle: BillingCycle.MONTHLY }
          )
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('pauseSubscription', () => {
      it('should pause subscription with specified date', async () => {
        const pauseUntil = new Date('2024-03-01');
        const options = {
          pauseUntil,
          reason: 'Financial hardship',
        };

        const pausedSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.PAUSED,
          pausedAt: new Date(),
          pauseUntil,
          pauseReason: 'Financial hardship',
        };

        jest.spyOn(service, 'updateSubscription').mockResolvedValue(pausedSubscription as any);

        const result = await service.pauseSubscription(TEST_USER_IDS.CLIENT, options);

        expect(result.status).toBe(SubscriptionStatus.PAUSED);
        expect(result.pauseUntil).toEqual(pauseUntil);
        expect(service.updateSubscription).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, {
          status: SubscriptionStatus.PAUSED,
          pausedAt: expect.any(Date),
          pauseUntil,
          pauseReason: 'Financial hardship',
        });
      });

      it('should pause subscription indefinitely', async () => {
        const options = {
          reason: 'Temporary break',
        };

        const pausedSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.PAUSED,
          pausedAt: new Date(),
          pauseReason: 'Temporary break',
        };

        jest.spyOn(service, 'updateSubscription').mockResolvedValue(pausedSubscription as any);

        const result = await service.pauseSubscription(TEST_USER_IDS.CLIENT, options);

        expect(result.status).toBe(SubscriptionStatus.PAUSED);
        expect(result.pauseUntil).toBeUndefined();
      });
    });

    describe('resumeSubscription', () => {
      it('should resume paused subscription', async () => {
        const pausedSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.PAUSED,
          pausedAt: new Date('2024-01-15'),
          pauseUntil: new Date('2024-03-01'),
        };

        const resumedSubscription = {
          ...pausedSubscription,
          status: SubscriptionStatus.ACTIVE,
          pausedAt: null,
          pauseUntil: null,
          pauseReason: null,
          resumedAt: new Date(),
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(pausedSubscription as any);
        jest.spyOn(service, 'updateSubscription').mockResolvedValue(resumedSubscription as any);

        const result = await service.resumeSubscription(TEST_USER_IDS.CLIENT);

        expect(result.status).toBe(SubscriptionStatus.ACTIVE);
        expect(result.resumedAt).toBeDefined();
        expect(service.updateSubscription).toHaveBeenCalledWith(TEST_USER_IDS.CLIENT, {
          status: SubscriptionStatus.ACTIVE,
          pausedAt: null,
          pauseUntil: null,
          pauseReason: null,
          resumedAt: expect.any(Date),
        });
      });

      it('should throw error when subscription is not paused', async () => {
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(mockSubscription as any);

        await expect(
          service.resumeSubscription(TEST_USER_IDS.CLIENT)
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('scheduleSubscriptionCancellation', () => {
      it('should schedule cancellation at period end', async () => {
        const scheduleData = {
          cancelAtPeriodEnd: true,
          reason: 'No longer needed',
        };

        const scheduledSubscription = {
          ...mockSubscription,
          cancelAtPeriodEnd: true,
          canceledAt: new Date(),
          cancellationReason: 'No longer needed',
          cancellationEffectiveDate: mockSubscription.currentPeriodEnd,
        };

        jest.spyOn(service, 'updateSubscription').mockResolvedValue(scheduledSubscription as any);

        const result = await service.scheduleSubscriptionCancellation(
          TEST_USER_IDS.CLIENT,
          scheduleData
        );

        expect(result.cancelAtPeriodEnd).toBe(true);
        expect(result.cancellationEffectiveDate).toEqual(mockSubscription.currentPeriodEnd);
      });

      it('should schedule immediate cancellation', async () => {
        const scheduleData = {
          cancelAtPeriodEnd: false,
          reason: 'Dissatisfied with service',
        };

        const canceledSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date(),
          cancellationReason: 'Dissatisfied with service',
          cancellationEffectiveDate: new Date(),
        };

        jest.spyOn(service, 'updateSubscription').mockResolvedValue(canceledSubscription as any);

        const result = await service.scheduleSubscriptionCancellation(
          TEST_USER_IDS.CLIENT,
          scheduleData
        );

        expect(result.status).toBe(SubscriptionStatus.CANCELED);
        expect(result.cancellationReason).toBe('Dissatisfied with service');
      });
    });

    describe('reactivateSubscription', () => {
      it('should reactivate canceled subscription with new payment method', async () => {
        const canceledSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.CANCELED,
          canceledAt: new Date('2024-01-15'),
        };

        const newPaymentMethod = {
          id: 'new-payment-method-id',
          type: PaymentMethodType.CARD,
          isDefault: true,
        };

        const reactivatedSubscription = {
          ...canceledSubscription,
          status: SubscriptionStatus.ACTIVE,
          canceledAt: null,
          cancellationReason: null,
          reactivatedAt: new Date(),
          defaultPaymentMethodId: 'new-payment-method-id',
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(canceledSubscription as any);
        (prismaService.paymentMethod.findUnique as jest.Mock).mockResolvedValue(newPaymentMethod);
        jest.spyOn(service, 'updateSubscription').mockResolvedValue(reactivatedSubscription as any);

        const result = await service.reactivateSubscription(
          TEST_USER_IDS.CLIENT,
          'new-payment-method-id'
        );

        expect(result.status).toBe(SubscriptionStatus.ACTIVE);
        expect(result.reactivatedAt).toBeDefined();
        expect(result.defaultPaymentMethodId).toBe('new-payment-method-id');
      });

      it('should reactivate subscription without changing payment method', async () => {
        const canceledSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.CANCELED,
          defaultPaymentMethodId: 'existing-payment-method',
        };

        const reactivatedSubscription = {
          ...canceledSubscription,
          status: SubscriptionStatus.ACTIVE,
          canceledAt: null,
          reactivatedAt: new Date(),
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(canceledSubscription as any);
        jest.spyOn(service, 'updateSubscription').mockResolvedValue(reactivatedSubscription as any);

        const result = await service.reactivateSubscription(TEST_USER_IDS.CLIENT);

        expect(result.status).toBe(SubscriptionStatus.ACTIVE);
        expect(result.defaultPaymentMethodId).toBe('existing-payment-method');
      });

      it('should throw error when subscription is not canceled', async () => {
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(mockSubscription as any);

        await expect(
          service.reactivateSubscription(TEST_USER_IDS.CLIENT)
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw error when payment method does not exist', async () => {
        const canceledSubscription = {
          ...mockSubscription,
          status: SubscriptionStatus.CANCELED,
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(canceledSubscription as any);
        (prismaService.paymentMethod.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.reactivateSubscription(TEST_USER_IDS.CLIENT, 'non-existent-payment-method')
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('applyDiscountToSubscription', () => {
      it('should apply discount to subscription', async () => {
        const mockDiscount = {
          id: 'discount-id',
          code: 'SAVE20',
          type: DiscountType.PERCENTAGE,
          percentOff: 20,
          isActive: true,
          validUntil: new Date('2024-12-31'),
          currentUses: 5,
          maxUses: 100,
        };

        const subscriptionWithDiscount = {
          ...mockSubscription,
          appliedDiscounts: [{
            id: 'applied-discount-id',
            discountId: 'discount-id',
            subscriptionId: mockSubscription.id,
            appliedAt: new Date(),
          }],
        };

        jest.spyOn(service, 'validateDiscount').mockResolvedValue(mockDiscount as any);
        (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
          const mockTxn = {
            subscriptionDiscount: {
              create: jest.fn().mockResolvedValue(subscriptionWithDiscount.appliedDiscounts[0]),
            },
            discount: {
              update: jest.fn(),
            },
            subscription: {
              findUnique: jest.fn().mockResolvedValue(subscriptionWithDiscount),
            },
          };
          return callback(mockTxn);
        });

        const result = await service.applyDiscountToSubscription(
          TEST_USER_IDS.CLIENT,
          'SAVE20'
        );

        expect(result.appliedDiscounts).toBeDefined();
        expect(result.appliedDiscounts).toHaveLength(1);
      });

      it('should throw error when discount is already applied', async () => {
        const mockDiscount = {
          id: 'discount-id',
          code: 'SAVE20',
        };

        const subscriptionWithDiscount = {
          ...mockSubscription,
          appliedDiscounts: [{
            discountId: 'discount-id',
          }],
        };

        jest.spyOn(service, 'validateDiscount').mockResolvedValue(mockDiscount as any);
        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(subscriptionWithDiscount as any);

        await expect(
          service.applyDiscountToSubscription(TEST_USER_IDS.CLIENT, 'SAVE20')
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('processSubscriptionRenewal', () => {
      it('should process successful renewal', async () => {
        const renewalDate = new Date('2024-02-01');
        const renewedSubscription = {
          ...mockSubscription,
          currentPeriodStart: renewalDate,
          currentPeriodEnd: new Date('2024-03-01'),
          renewalCount: 1,
        };

        const mockPayment = {
          id: 'renewal-payment-id',
          amount: mockSubscription.amount,
          status: PaymentStatus.SUCCEEDED,
        };

        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
        (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
          const mockTxn = {
            payment: {
              create: jest.fn().mockResolvedValue(mockPayment),
            },
            subscription: {
              update: jest.fn().mockResolvedValue(renewedSubscription),
            },
          };
          return callback(mockTxn);
        });

        const result = await service.processSubscriptionRenewal(mockSubscription.id);

        expect(result.renewalCount).toBe(1);
        expect(result.currentPeriodStart).toEqual(renewalDate);
      });

      it('should handle renewal payment failure', async () => {
        const mockPayment = {
          id: 'failed-payment-id',
          status: PaymentStatus.FAILED,
        };

        const subscriptionPastDue = {
          ...mockSubscription,
          status: SubscriptionStatus.PAST_DUE,
          pastDueDate: new Date(),
        };

        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);
        (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
          const mockTxn = {
            payment: {
              create: jest.fn().mockResolvedValue(mockPayment),
            },
            subscription: {
              update: jest.fn().mockResolvedValue(subscriptionPastDue),
            },
          };
          return callback(mockTxn);
        });

        const result = await service.processSubscriptionRenewal(mockSubscription.id);

        expect(result.status).toBe(SubscriptionStatus.PAST_DUE);
      });

      it('should throw error when subscription not found', async () => {
        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          service.processSubscriptionRenewal('non-existent-subscription')
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('getSubscriptionUsageAnalytics', () => {
      it('should return usage analytics for subscription', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');
        
        const mockUsageRecords = [
          { feature: 'api_calls', quantity: 1000, usageDate: new Date('2024-01-15') },
          { feature: 'storage', quantity: 50, usageDate: new Date('2024-01-20') },
          { feature: 'api_calls', quantity: 800, usageDate: new Date('2024-01-25') },
        ];

        const expectedAnalytics = {
          subscriptionId: mockSubscription.id,
          period: { start: startDate, end: endDate },
          totalUsage: {
            api_calls: 1800,
            storage: 50,
          },
          dailyUsage: [
            { date: '2024-01-15', api_calls: 1000 },
            { date: '2024-01-20', storage: 50 },
            { date: '2024-01-25', api_calls: 800 },
          ],
          trends: {
            api_calls: { growth: 0.2, trend: 'increasing' },
            storage: { growth: 0.0, trend: 'stable' },
          },
        };

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue(mockUsageRecords);
        (prismaService.usageRecord.groupBy as jest.Mock).mockResolvedValue([
          { feature: 'api_calls', _sum: { quantity: 1800 } },
          { feature: 'storage', _sum: { quantity: 50 } },
        ]);

        const result = await service.getSubscriptionUsageAnalytics(
          mockSubscription.id,
          startDate,
          endDate
        );

        expect(result.subscriptionId).toBe(mockSubscription.id);
        expect(result.totalUsage).toBeDefined();
        expect(result.totalUsage.api_calls).toBe(1800);
        expect(result.totalUsage.storage).toBe(50);
      });

      it('should return analytics for current month when no dates provided', async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue([]);
        (prismaService.usageRecord.groupBy as jest.Mock).mockResolvedValue([]);

        const result = await service.getSubscriptionUsageAnalytics(mockSubscription.id);

        expect(result.period.start.getMonth()).toBe(startOfMonth.getMonth());
        expect(result.period.end.getMonth()).toBe(endOfMonth.getMonth());
      });
    });
  });

  describe('Advanced Billing Features', () => {
    describe('Proration Calculations', () => {
      it('should calculate prorated amount for mid-cycle upgrade', async () => {
        const currentDate = new Date('2024-01-15');
        const periodStart = new Date('2024-01-01');
        const periodEnd = new Date('2024-02-01');
        const oldAmount = 10.00;
        const newAmount = 30.00;
        
        const result = (service as any).calculateProration(
          oldAmount,
          newAmount,
          periodStart,
          periodEnd,
          currentDate
        );

        expect(result.credit).toBeLessThan(0);
        expect(result.charge).toBeGreaterThan(0);
        expect(result.netAmount).toBe(result.credit + result.charge);
      });

      it('should calculate prorated amount for downgrade', async () => {
        const currentDate = new Date('2024-01-10');
        const periodStart = new Date('2024-01-01');
        const periodEnd = new Date('2024-02-01');
        const oldAmount = 30.00;
        const newAmount = 10.00;
        
        const result = (service as any).calculateProration(
          oldAmount,
          newAmount,
          periodStart,
          periodEnd,
          currentDate
        );

        expect(result.credit).toBeLessThan(0);
        expect(result.charge).toBeGreaterThan(0);
        expect(result.netAmount).toBeLessThan(0);
      });

      it('should handle end-of-period changes with no proration', async () => {
        const currentDate = new Date('2024-02-01');
        const periodStart = new Date('2024-01-01');
        const periodEnd = new Date('2024-02-01');
        const oldAmount = 10.00;
        const newAmount = 30.00;
        
        const result = (service as any).calculateProration(
          oldAmount,
          newAmount,
          periodStart,
          periodEnd,
          currentDate
        );

        expect(result.credit).toBe(0);
        expect(result.charge).toBe(0);
        expect(result.netAmount).toBe(0);
      });
    });

    describe('Usage-Based Billing', () => {
      it('should calculate usage charges for metered features', async () => {
        const mockUsageRecords = [
          { feature: 'api_calls', quantity: 1000, unitPrice: 0.01 },
          { feature: 'storage_gb', quantity: 25, unitPrice: 0.10 },
          { feature: 'bandwidth_gb', quantity: 100, unitPrice: 0.05 },
        ];

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-31');

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue(mockUsageRecords);

        const result = await service.calculateUsageCharges(
          'subscription-id',
          startDate,
          endDate
        );

        expect(result.totalCharges).toBe(17.50);
        expect(result.breakdown).toHaveLength(3);
        expect(result.breakdown[0]).toEqual({
          feature: 'api_calls',
          quantity: 1000,
          unitPrice: 0.01,
          totalCharge: 10.00,
        });
      });

      it('should apply usage tiers and discounts', async () => {
        const mockUsageRecords = [
          { feature: 'api_calls', quantity: 10000, unitPrice: 0.01 },
        ];

        const mockPricingTiers = [
          { min: 0, max: 1000, price: 0.01 },
          { min: 1001, max: 5000, price: 0.008 },
          { min: 5001, max: Infinity, price: 0.005 },
        ];

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue(mockUsageRecords);
        (prismaService.pricingTier.findMany as jest.Mock).mockResolvedValue(mockPricingTiers);

        const result = await service.calculateTieredUsageCharges(
          'subscription-id',
          'api_calls',
          new Date('2024-01-01'),
          new Date('2024-01-31')
        );

        expect(result.totalCharge).toBe(67);
        expect(result.tiers).toHaveLength(3);
      });
    });

    describe('Revenue Recognition', () => {
      it('should recognize revenue for monthly subscription', async () => {
        const subscription = {
          id: 'subscription-id',
          amount: 29.99,
          billingCycle: BillingCycle.MONTHLY,
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-02-01'),
        };

        const result = await service.calculateRevenueRecognition(subscription as any);

        expect(result.totalRevenue).toBe(29.99);
        expect(result.dailyRevenue).toBeCloseTo(0.97, 2);
        expect(result.recognitionSchedule).toHaveLength(31);
      });

      it('should handle deferred revenue for annual subscriptions', async () => {
        const subscription = {
          id: 'subscription-id',
          amount: 299.99,
          billingCycle: BillingCycle.YEARLY,
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2025-01-01'),
        };

        const result = await service.calculateRevenueRecognition(subscription as any);

        expect(result.totalRevenue).toBe(299.99);
        expect(result.monthlyRevenue).toBeCloseTo(25.00, 2);
        expect(result.recognitionSchedule).toHaveLength(12);
      });
    });

    describe('Tax Calculations', () => {
      it('should calculate tax for US customers', async () => {
        const billingAddress = {
          country: 'US',
          state: 'CA',
          city: 'San Francisco',
          postalCode: '94105',
        };

        const amount = 100.00;

        const result = await service.calculateTax(amount, billingAddress);

        expect(result.taxAmount).toBeGreaterThan(0);
        expect(result.taxRate).toBeGreaterThan(0);
        expect(result.taxJurisdiction).toBe('CA');
        expect(result.totalAmount).toBe(amount + result.taxAmount);
      });

      it('should handle VAT for EU customers', async () => {
        const billingAddress = {
          country: 'DE',
          vatNumber: 'DE123456789',
        };

        const amount = 100.00;

        const result = await service.calculateTax(amount, billingAddress);

        expect(result.taxType).toBe('VAT');
        expect(result.vatNumber).toBe('DE123456789');
      });

      it('should skip tax for tax-exempt customers', async () => {
        const billingAddress = {
          country: 'US',
          state: 'CA',
          taxExempt: true,
          exemptionCertificate: 'EXEMPT-123',
        };

        const amount = 100.00;

        const result = await service.calculateTax(amount, billingAddress);

        expect(result.taxAmount).toBe(0);
        expect(result.exemptionReason).toBe('Tax exempt customer');
      });
    });

    describe('Dunning Management', () => {
      it('should process failed payment with retry logic', async () => {
        const failedPayment = {
          id: 'payment-id',
          subscriptionId: 'subscription-id',
          amount: 29.99,
          status: PaymentStatus.FAILED,
          attemptCount: 1,
          failureCode: 'card_declined',
        };

        const mockSubscription = {
          id: 'subscription-id',
          status: SubscriptionStatus.ACTIVE,
          defaultPaymentMethodId: 'payment-method-id',
        };

        (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(failedPayment);
        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

        const result = await service.processDunning('payment-id');

        expect(result.retryScheduled).toBe(true);
        expect(result.nextRetryDate).toBeDefined();
        expect(result.dunningLevel).toBe(1);
      });

      it('should escalate dunning after multiple failures', async () => {
        const failedPayment = {
          id: 'payment-id',
          subscriptionId: 'subscription-id',
          status: PaymentStatus.FAILED,
          attemptCount: 3,
        };

        const mockSubscription = {
          id: 'subscription-id',
          status: SubscriptionStatus.PAST_DUE,
        };

        (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(failedPayment);
        (prismaService.subscription.findUnique as jest.Mock).mockResolvedValue(mockSubscription);

        const result = await service.processDunning('payment-id');

        expect(result.escalated).toBe(true);
        expect(result.dunningLevel).toBe(3);
        expect(result.actionRequired).toBe('update_payment_method');
      });

      it('should cancel subscription after maximum retries', async () => {
        const failedPayment = {
          id: 'payment-id',
          subscriptionId: 'subscription-id',
          status: PaymentStatus.FAILED,
          attemptCount: 5,
        };

        (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(failedPayment);
        jest.spyOn(service, 'cancelSubscription').mockResolvedValue({ status: SubscriptionStatus.CANCELED } as any);

        const result = await service.processDunning('payment-id');

        expect(result.subscriptionCanceled).toBe(true);
        expect(service.cancelSubscription).toHaveBeenCalled();
      });
    });

    describe('Subscription Analytics', () => {
      it('should calculate customer lifetime value', async () => {
        const mockPayments = [
          { amount: 29.99, createdAt: new Date('2024-01-01') },
          { amount: 29.99, createdAt: new Date('2024-02-01') },
          { amount: 29.99, createdAt: new Date('2024-03-01') },
        ];

        const mockSubscription = {
          createdAt: new Date('2024-01-01'),
          status: SubscriptionStatus.ACTIVE,
        };

        (prismaService.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

        const result = await service.calculateCustomerLifetimeValue(
          TEST_USER_IDS.CLIENT,
          mockSubscription as any
        );

        expect(result.totalRevenue).toBe(89.97);
        expect(result.averageMonthlyRevenue).toBeCloseTo(29.99, 2);
        expect(result.subscriptionMonths).toBe(3);
        expect(result.projectedLTV).toBeGreaterThan(89.97);
      });

      it('should calculate churn prediction', async () => {
        const mockUsageData = {
          lastLoginDate: new Date('2024-01-01'),
          averageSessionDuration: 300,
          featureUsage: {
            api_calls: 100,
            storage: 1,
          },
          supportTickets: 2,
        };

        const mockPaymentHistory = [
          { status: PaymentStatus.FAILED, createdAt: new Date('2024-01-15') },
          { status: PaymentStatus.SUCCEEDED, createdAt: new Date('2024-01-01') },
        ];

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue(mockUsageData.featureUsage);
        (prismaService.payment.findMany as jest.Mock).mockResolvedValue(mockPaymentHistory);

        const result = await service.calculateChurnPrediction(
          TEST_USER_IDS.CLIENT,
          mockUsageData
        );

        expect(result.churnRisk).toBeGreaterThan(0.5);
        expect(result.riskFactors).toContain('low_usage');
        expect(result.riskFactors).toContain('payment_failures');
        expect(result.recommendedActions).toContain('engagement_campaign');
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Complete Subscription Lifecycle', () => {
      it('should handle complete subscription flow from creation to cancellation', async () => {
        const mockPlan = {
          id: 'plan-id',
          tier: SubscriptionTier.PREMIUM,
          monthlyPrice: 29.99,
        };

        const mockPaymentMethod = {
          id: 'payment-method-id',
          type: PaymentMethodType.CARD,
          isDefault: true,
        };

        (prismaService.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
        (prismaService.subscription.create as jest.Mock).mockResolvedValue({
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          status: SubscriptionStatus.ACTIVE,
        });

        const subscription = await service.createSubscription({
          userId: TEST_USER_IDS.CLIENT,
          planId: 'plan-id',
          paymentMethodId: 'payment-method-id',
        });

        expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);

        (prismaService.payment.create as jest.Mock).mockResolvedValue({
          id: 'payment-id',
          status: PaymentStatus.SUCCEEDED,
          amount: 29.99,
        });

        const payment = await service.createPayment({
          amount: 29.99,
          subscriptionId: subscription.id,
          paymentMethodId: 'payment-method-id',
        });

        expect(payment.status).toBe(PaymentStatus.SUCCEEDED);

        (prismaService.usageRecord.create as jest.Mock).mockResolvedValue({
          id: 'usage-id',
          feature: 'api_calls',
          quantity: 1000,
        });

        const usage = await service.recordUsage({
          subscriptionId: subscription.id,
          feature: 'api_calls',
          quantity: 1000,
        });

        expect(usage.quantity).toBe(1000);

        jest.spyOn(service, 'updateSubscription').mockResolvedValue({
          ...subscription,
          status: SubscriptionStatus.CANCELED,
        } as any);

        const canceledSubscription = await service.cancelSubscription(TEST_USER_IDS.CLIENT);

        expect(canceledSubscription.status).toBe(SubscriptionStatus.CANCELED);
      });

      it('should handle subscription upgrade with proration', async () => {
        const basicPlan = {
          id: 'basic-plan',
          tier: SubscriptionTier.BASIC,
          monthlyPrice: 9.99,
        };

        const premiumPlan = {
          id: 'premium-plan',
          tier: SubscriptionTier.PREMIUM,
          monthlyPrice: 29.99,
        };

        const currentSubscription = {
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          planId: 'basic-plan',
          tier: SubscriptionTier.BASIC,
          amount: 9.99,
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-02-01'),
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(currentSubscription as any);
        (prismaService.subscriptionPlan.findUnique as jest.Mock).mockResolvedValue(premiumPlan);
        
        const upgradedSubscription = {
          ...currentSubscription,
          planId: 'premium-plan',
          tier: SubscriptionTier.PREMIUM,
          amount: 29.99,
        };

        (prismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
          const mockTxn = {
            subscription: {
              update: jest.fn().mockResolvedValue(upgradedSubscription),
            },
            invoice: {
              create: jest.fn().mockResolvedValue({
                id: 'proration-invoice',
                total: 15.00,
              }),
            },
            invoiceLineItem: {
              createMany: jest.fn(),
            },
          };
          return callback(mockTxn);
        });

        const result = await service.changeSubscriptionPlan(
          TEST_USER_IDS.CLIENT,
          'premium-plan',
          {
            billingCycle: BillingCycle.MONTHLY,
            prorationBehavior: 'create_prorations',
          }
        );

        expect(result.tier).toBe(SubscriptionTier.PREMIUM);
        expect(result.amount).toBe(29.99);
      });
    });

    describe('Error Recovery and Resilience', () => {
      it('should handle payment gateway timeouts gracefully', async () => {
        const paymentData = {
          amount: 29.99,
          paymentMethodId: 'payment-method-id',
          subscriptionId: 'subscription-id',
        };

        const timeoutError = new Error('Payment gateway timeout');
        timeoutError.name = 'TimeoutError';
        
        (prismaService.payment.create as jest.Mock).mockRejectedValue(timeoutError);

        await expect(
          service.createPayment(paymentData)
        ).rejects.toThrow('Payment gateway timeout');

        expect(prismaService.subscription.update).not.toHaveBeenCalled();
      });

      it('should handle concurrent subscription modifications', async () => {
        const subscription = {
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          version: 1,
        };

        jest.spyOn(service, 'findUserSubscription').mockResolvedValue(subscription as any);

        const conflictError = new Error('Subscription was modified by another process');
        conflictError.name = 'ConflictError';
        
        (prismaService.subscription.update as jest.Mock).mockRejectedValue(conflictError);

        await expect(
          service.updateSubscription(TEST_USER_IDS.CLIENT, {
            planId: 'new-plan-id',
          })
        ).rejects.toThrow('Subscription was modified by another process');
      });

      it('should handle database transaction rollbacks', async () => {
        const discountData = {
          code: 'SAVE20',
          type: DiscountType.PERCENTAGE,
          percentOff: 20,
        };

        (prismaService.$transaction as jest.Mock).mockRejectedValue(
          new Error('Database transaction failed')
        );

        await expect(
          service.redeemDiscount('discount-id', TEST_USER_IDS.CLIENT, 20)
        ).rejects.toThrow('Database transaction failed');

        expect(prismaService.discountRedemption.create).not.toHaveBeenCalled();
      });
    });

    describe('Performance and Scalability', () => {
      it('should handle high-volume billing operations efficiently', async () => {
        const operationCount = 1000;
        const batchOperations = Array.from({ length: operationCount }, (_, i) => {
          if (i % 3 === 0) {
            return service.recordUsage({
              subscriptionId: `subscription-${i}`,
              feature: 'api_calls',
              quantity: 100,
            });
          } else if (i % 3 === 1) {
            return service.createPayment({
              amount: 29.99,
              subscriptionId: `subscription-${i}`,
            });
          } else {
            return service.getBillingStatistics(
              new Date('2024-01-01'),
              new Date('2024-01-31')
            );
          }
        });

        (prismaService.usageRecord.create as jest.Mock).mockResolvedValue({ id: 'usage-id' });
        (prismaService.payment.create as jest.Mock).mockResolvedValue({ id: 'payment-id' });
        (prismaService.payment.aggregate as jest.Mock).mockResolvedValue({ _sum: { amount: 1000 } });
        (prismaService.subscription.count as jest.Mock).mockResolvedValue(10);
        (prismaService.subscription.groupBy as jest.Mock).mockResolvedValue([]);

        const startTime = Date.now();
        const results = await Promise.all(batchOperations);
        const endTime = Date.now();

        expect(results).toHaveLength(operationCount);
        expect(endTime - startTime).toBeLessThan(5000);
      });

      it('should optimize memory usage for large result sets', async () => {
        const largeUsageDataset = Array.from({ length: 50000 }, (_, i) => ({
          id: `usage-${i}`,
          feature: 'api_calls',
          quantity: Math.floor(Math.random() * 1000),
          usageDate: new Date(),
        }));

        (prismaService.usageRecord.findMany as jest.Mock).mockResolvedValue(largeUsageDataset);

        const initialMemory = process.memoryUsage().heapUsed;
        const result = await service.getUsageRecords(
          'subscription-id',
          'api_calls',
          new Date('2024-01-01'),
          new Date('2024-01-31')
        );
        const finalMemory = process.memoryUsage().heapUsed;

        expect(result).toHaveLength(50000);
        
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024);
      });
    });

    describe('Data Consistency and Integrity', () => {
      it('should maintain invoice number sequence integrity', async () => {
        const concurrentInvoiceCreations = Array.from({ length: 10 }, (_, i) => {
          (prismaService.invoice.findFirst as jest.Mock).mockResolvedValueOnce({
            number: `INV-2024-00000${i}`,
          });
          (prismaService.invoice.create as jest.Mock).mockResolvedValueOnce({
            id: `invoice-${i}`,
            number: `INV-2024-00000${i + 1}`,
          });

          return service.createInvoice({
            subscriptionId: `subscription-${i}`,
            subtotal: 100,
            dueDate: new Date(),
          });
        });

        const results = await Promise.all(concurrentInvoiceCreations);
        
        const invoiceNumbers = results.map(invoice => invoice.number);
        const uniqueNumbers = new Set(invoiceNumbers);
        expect(uniqueNumbers.size).toBe(invoiceNumbers.length);
      });

      it('should ensure subscription state consistency during transitions', async () => {
        const subscription = {
          id: 'subscription-id',
          userId: TEST_USER_IDS.CLIENT,
          status: SubscriptionStatus.ACTIVE,
        };

        const transitions = [
          { from: SubscriptionStatus.ACTIVE, to: SubscriptionStatus.PAUSED, valid: true },
          { from: SubscriptionStatus.PAUSED, to: SubscriptionStatus.ACTIVE, valid: true },
          { from: SubscriptionStatus.CANCELED, to: SubscriptionStatus.ACTIVE, valid: true },
          { from: SubscriptionStatus.TRIALING, to: SubscriptionStatus.ACTIVE, valid: true },
          { from: SubscriptionStatus.PAST_DUE, to: SubscriptionStatus.CANCELED, valid: true },
        ];

        for (const transition of transitions) {
          jest.spyOn(service, 'findUserSubscription').mockResolvedValue({
            ...subscription,
            status: transition.from,
          } as any);

          if (transition.valid) {
            jest.spyOn(service, 'updateSubscription').mockResolvedValue({
              ...subscription,
              status: transition.to,
            } as any);

            await expect(
              service.updateSubscription(TEST_USER_IDS.CLIENT, {
                status: transition.to,
              })
            ).resolves.toBeDefined();
          }
        }
      });
    });
  });
});
