import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeService } from './stripe.service';
import { PrismaService } from '../../providers/prisma-client.provider';
import { BillingService } from '../billing.service';
import Stripe from 'stripe';
import {
  PaymentMethodType,
  PaymentStatus,
  SubscriptionStatus,
  BillingCycle,
} from '@prisma/client';

// Mock Stripe SDK
const mockStripe = {
  balance: {
    retrieve: jest.fn(),
  },
  customers: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
  },
  paymentMethods: {
    create: jest.fn(),
    attach: jest.fn(),
    detach: jest.fn(),
  },
  paymentIntents: {
    create: jest.fn(),
    confirm: jest.fn(),
  },
  subscriptions: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
  },
  invoices: {
    create: jest.fn(),
    finalizeInvoice: jest.fn(),
    pay: jest.fn(),
  },
  prices: {
    retrieve: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

// Mock Stripe constructor
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe('StripeService', () => {
  let service: StripeService;
  let prismaService: jest.Mocked<PrismaService>;
  let configService: jest.Mocked<ConfigService>;
  let billingService: jest.Mocked<BillingService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let loggerSpy: jest.SpyInstance;

  // Test data constants
  const mockUserId = 'user-123';
  const mockCustomerId = 'cus_test123';
  const mockPaymentMethodId = 'pm_test123';
  const mockSubscriptionId = 'sub_test123';
  const mockInvoiceId = 'in_test123';
  const mockPaymentIntentId = 'pi_test123';
  const mockPriceId = 'price_test123';

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            payment: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: BillingService,
          useValue: {
            createPaymentMethod: jest.fn(),
            createPayment: jest.fn(),
            updatePaymentStatus: jest.fn(),
            createSubscription: jest.fn(),
            updateSubscription: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    prismaService = module.get(PrismaService);
    configService = module.get(ConfigService);
    billingService = module.get(BillingService);
    eventEmitter = module.get(EventEmitter2);

    // Setup logger spy
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ===== INITIALIZATION TESTS =====

  describe('onModuleInit and initialization', () => {
    it('should initialize Stripe successfully with valid configuration', async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });

      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });

      await service.onModuleInit();

      expect(mockStripe.balance.retrieve).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Stripe initialized successfully');
    });

    it('should handle missing Stripe secret key gracefully', async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return null;
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });

      await service.onModuleInit();

      expect(mockStripe.balance.retrieve).not.toHaveBeenCalled();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Stripe secret key not configured. Payment processing will be disabled.',
      );
    });

    it('should handle Stripe initialization failure', async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_invalid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });

      const testError = new Error('Invalid API key');
      mockStripe.balance.retrieve.mockRejectedValue(testError);

      await service.onModuleInit();

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Failed to initialize Stripe:',
        testError,
      );
    });

    it('should handle missing webhook secret', async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return null;
          default:
            return null;
        }
      });

      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });

      await service.onModuleInit();

      expect(mockStripe.balance.retrieve).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Stripe initialized successfully');
    });
  });

  describe('ensureInitialized', () => {
    it('should throw BadRequestException when not initialized', async () => {
      // Don't initialize the service
      await expect(
        service.createOrGetCustomer(mockUserId, { email: 'test@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow operations when initialized', async () => {
      // Initialize the service
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });

      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();

      // Setup for customer creation
      prismaService.user.findUnique.mockResolvedValue(null);
      const mockCustomer = { id: mockCustomerId, email: 'test@example.com' };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await service.createOrGetCustomer(mockUserId, {
        email: 'test@example.com',
      });

      expect(result).toEqual(mockCustomer);
    });
  });

  // ===== CUSTOMER MANAGEMENT TESTS =====

  describe('createOrGetCustomer', () => {
    beforeEach(async () => {
      // Initialize service for these tests
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should create new customer when user has no Stripe customer ID', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        address: {
          line1: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US',
        },
        metadata: { source: 'web' },
      };

      prismaService.user.findUnique.mockResolvedValue(null);
      const mockCustomer = { id: mockCustomerId, ...customerData };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await service.createOrGetCustomer(mockUserId, customerData);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        metadata: {
          userId: mockUserId,
          source: 'web',
        },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { stripeCustomerId: mockCustomerId },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should return existing customer when valid customer ID exists', async () => {
      const existingCustomer = {
        id: mockCustomerId,
        email: 'test@example.com',
        deleted: false,
      };

      prismaService.user.findUnique.mockResolvedValue({
        stripeCustomerId: mockCustomerId,
      } as any);
      mockStripe.customers.retrieve.mockResolvedValue(existingCustomer);

      const result = await service.createOrGetCustomer(mockUserId, {
        email: 'test@example.com',
      });

      expect(mockStripe.customers.retrieve).toHaveBeenCalledWith(mockCustomerId);
      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingCustomer);
    });

    it('should create new customer when existing customer is deleted', async () => {
      const deletedCustomer = {
        id: mockCustomerId,
        deleted: true,
      };

      prismaService.user.findUnique.mockResolvedValue({
        stripeCustomerId: mockCustomerId,
      } as any);
      mockStripe.customers.retrieve.mockResolvedValue(deletedCustomer);

      const newCustomer = { id: 'cus_new123', email: 'test@example.com' };
      mockStripe.customers.create.mockResolvedValue(newCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await service.createOrGetCustomer(mockUserId, {
        email: 'test@example.com',
      });

      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(result).toEqual(newCustomer);
    });

    it('should handle error retrieving existing customer and create new one', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        stripeCustomerId: 'invalid_customer_id',
      } as any);
      mockStripe.customers.retrieve.mockRejectedValue(
        new Error('No such customer'),
      );

      const newCustomer = { id: mockCustomerId, email: 'test@example.com' };
      mockStripe.customers.create.mockResolvedValue(newCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await service.createOrGetCustomer(mockUserId, {
        email: 'test@example.com',
      });

      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to retrieve existing customer'),
        expect.any(Error),
      );
      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(result).toEqual(newCustomer);
    });

    it('should handle customer creation error', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      const testError = new Error('Credit card required');
      mockStripe.customers.create.mockRejectedValue(testError);

      await expect(
        service.createOrGetCustomer(mockUserId, { email: 'test@example.com' }),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating Stripe customer'),
        testError,
      );
    });

    it('should handle minimal customer data', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      const mockCustomer = { id: mockCustomerId, email: 'test@example.com' };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      const result = await service.createOrGetCustomer(mockUserId, {
        email: 'test@example.com',
      });

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: undefined,
        phone: undefined,
        address: undefined,
        metadata: {
          userId: mockUserId,
        },
      });
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('updateCustomer', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should update customer successfully', async () => {
      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com',
        phone: '+9876543210',
      };

      const updatedCustomer = { id: mockCustomerId, ...updateData };
      mockStripe.customers.update.mockResolvedValue(updatedCustomer);

      const result = await service.updateCustomer(mockCustomerId, updateData);

      expect(mockStripe.customers.update).toHaveBeenCalledWith(
        mockCustomerId,
        updateData,
      );
      expect(result).toEqual(updatedCustomer);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Updated Stripe customer ${mockCustomerId}`,
      );
    });

    it('should handle customer update error', async () => {
      const updateData = { name: 'Updated User' };
      const testError = new Error('Customer not found');
      mockStripe.customers.update.mockRejectedValue(testError);

      await expect(
        service.updateCustomer(mockCustomerId, updateData),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error updating Stripe customer'),
        testError,
      );
    });

    it('should handle partial update data', async () => {
      const updateData = { phone: '+1111111111' };
      const updatedCustomer = { id: mockCustomerId, phone: '+1111111111' };
      mockStripe.customers.update.mockResolvedValue(updatedCustomer);

      const result = await service.updateCustomer(mockCustomerId, updateData);

      expect(mockStripe.customers.update).toHaveBeenCalledWith(
        mockCustomerId,
        updateData,
      );
      expect(result).toEqual(updatedCustomer);
    });
  });

  // ===== PAYMENT METHODS TESTS =====

  describe('createPaymentMethod', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should create payment method successfully', async () => {
      const paymentMethodData = {
        type: 'card' as const,
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      };

      const mockPaymentMethod = {
        id: mockPaymentMethodId,
        type: 'card',
        card: {
          last4: '4242',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2025,
        },
      };

      mockStripe.paymentMethods.create.mockResolvedValue(mockPaymentMethod);
      billingService.createPaymentMethod.mockResolvedValue({} as any);

      const result = await service.createPaymentMethod(
        mockUserId,
        paymentMethodData,
      );

      expect(mockStripe.paymentMethods.create).toHaveBeenCalledWith(
        paymentMethodData,
      );
      expect(billingService.createPaymentMethod).toHaveBeenCalledWith({
        userId: mockUserId,
        type: PaymentMethodType.CARD,
        cardLast4: '4242',
        cardBrand: 'visa',
        cardExpMonth: 12,
        cardExpYear: 2025,
        stripePaymentMethodId: mockPaymentMethodId,
      });
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should handle payment method creation error', async () => {
      const paymentMethodData = {
        type: 'card' as const,
        card: {
          number: '4000000000000002',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      };

      const testError = new Error('Your card was declined');
      mockStripe.paymentMethods.create.mockRejectedValue(testError);

      await expect(
        service.createPaymentMethod(mockUserId, paymentMethodData),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating payment method'),
        testError,
      );
    });

    it('should handle missing card details in response', async () => {
      const paymentMethodData = {
        type: 'card' as const,
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      };

      const mockPaymentMethod = {
        id: mockPaymentMethodId,
        type: 'card',
        card: null, // Missing card details
      };

      mockStripe.paymentMethods.create.mockResolvedValue(mockPaymentMethod);
      billingService.createPaymentMethod.mockResolvedValue({} as any);

      const result = await service.createPaymentMethod(
        mockUserId,
        paymentMethodData,
      );

      expect(billingService.createPaymentMethod).toHaveBeenCalledWith({
        userId: mockUserId,
        type: PaymentMethodType.CARD,
        cardLast4: undefined,
        cardBrand: undefined,
        cardExpMonth: undefined,
        cardExpYear: undefined,
        stripePaymentMethodId: mockPaymentMethodId,
      });
      expect(result).toEqual(mockPaymentMethod);
    });
  });

  describe('attachPaymentMethod', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should attach payment method to customer successfully', async () => {
      const mockPaymentMethod = {
        id: mockPaymentMethodId,
        customer: mockCustomerId,
      };

      mockStripe.paymentMethods.attach.mockResolvedValue(mockPaymentMethod);

      const result = await service.attachPaymentMethod(
        mockPaymentMethodId,
        mockCustomerId,
      );

      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith(
        mockPaymentMethodId,
        { customer: mockCustomerId },
      );
      expect(result).toEqual(mockPaymentMethod);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Attached payment method ${mockPaymentMethodId} to customer ${mockCustomerId}`,
      );
    });

    it('should handle attach payment method error', async () => {
      const testError = new Error('Payment method already attached');
      mockStripe.paymentMethods.attach.mockRejectedValue(testError);

      await expect(
        service.attachPaymentMethod(mockPaymentMethodId, mockCustomerId),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error attaching payment method'),
        testError,
      );
    });
  });

  describe('detachPaymentMethod', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should detach payment method successfully', async () => {
      const mockPaymentMethod = {
        id: mockPaymentMethodId,
        customer: null,
      };

      mockStripe.paymentMethods.detach.mockResolvedValue(mockPaymentMethod);

      const result = await service.detachPaymentMethod(mockPaymentMethodId);

      expect(mockStripe.paymentMethods.detach).toHaveBeenCalledWith(
        mockPaymentMethodId,
      );
      expect(result).toEqual(mockPaymentMethod);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Detached payment method ${mockPaymentMethodId}`,
      );
    });

    it('should handle detach payment method error', async () => {
      const testError = new Error('Payment method not found');
      mockStripe.paymentMethods.detach.mockRejectedValue(testError);

      await expect(
        service.detachPaymentMethod(mockPaymentMethodId),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error detaching payment method'),
        testError,
      );
    });
  });

  // ===== PAYMENT PROCESSING TESTS =====

  describe('createPaymentIntent', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should create payment intent with automatic confirmation', async () => {
      const paymentData = {
        amount: 100.50,
        currency: 'usd',
        paymentMethodId: mockPaymentMethodId,
        customerId: mockCustomerId,
        description: 'Test payment',
        metadata: { orderId: 'order_123' },
        confirmationMethod: 'automatic' as const,
      };

      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 10050,
        currency: 'usd',
        status: 'succeeded',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(paymentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 10050, // Amount in cents
        currency: 'usd',
        customer: mockCustomerId,
        payment_method: mockPaymentMethodId,
        confirmation_method: 'automatic',
        confirm: true,
        description: 'Test payment',
        metadata: { orderId: 'order_123' },
      });
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should create payment intent with manual confirmation', async () => {
      const paymentData = {
        amount: 50.75,
        paymentMethodId: mockPaymentMethodId,
        confirmationMethod: 'manual' as const,
      };

      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 5075,
        status: 'requires_confirmation',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(paymentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5075,
        currency: 'usd', // Default currency
        customer: undefined,
        payment_method: mockPaymentMethodId,
        confirmation_method: 'manual',
        confirm: false,
        description: undefined,
        metadata: {},
      });
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle payment intent creation error', async () => {
      const paymentData = {
        amount: 100,
        paymentMethodId: 'invalid_pm',
      };

      const testError = new Error('Invalid payment method');
      mockStripe.paymentIntents.create.mockRejectedValue(testError);

      await expect(service.createPaymentIntent(paymentData)).rejects.toThrow(
        testError,
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error creating payment intent:',
        testError,
      );
    });

    it('should handle minimal payment data', async () => {
      const paymentData = {
        amount: 25.99,
      };

      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 2599,
        currency: 'usd',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(paymentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2599,
        currency: 'usd',
        customer: undefined,
        payment_method: undefined,
        confirmation_method: 'automatic',
        confirm: true,
        description: undefined,
        metadata: {},
      });
      expect(result).toEqual(mockPaymentIntent);
    });
  });

  describe('confirmPaymentIntent', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should confirm payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        status: 'succeeded',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(mockPaymentIntent);

      const result = await service.confirmPaymentIntent(
        mockPaymentIntentId,
        mockPaymentMethodId,
      );

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(
        mockPaymentIntentId,
        { payment_method: mockPaymentMethodId },
      );
      expect(result).toEqual(mockPaymentIntent);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Confirmed payment intent ${mockPaymentIntentId}`,
      );
    });

    it('should confirm payment intent without payment method', async () => {
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        status: 'succeeded',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(mockPaymentIntent);

      const result = await service.confirmPaymentIntent(mockPaymentIntentId);

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(
        mockPaymentIntentId,
        { payment_method: undefined },
      );
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle payment intent confirmation error', async () => {
      const testError = new Error('Your card was declined');
      mockStripe.paymentIntents.confirm.mockRejectedValue(testError);

      await expect(
        service.confirmPaymentIntent(mockPaymentIntentId, mockPaymentMethodId),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error confirming payment intent'),
        testError,
      );
    });
  });

  describe('processPayment', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should process payment successfully with succeeded status', async () => {
      const amount = 150.75;
      const description = 'Therapy session payment';
      const metadata = { sessionId: 'session_123' };

      // Mock user data
      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: null,
      };

      // Mock customer creation
      const mockCustomer = { id: mockCustomerId, email: 'test@example.com' };

      // Mock payment intent
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 15075,
        status: 'succeeded',
      };

      // Mock payment record
      const mockPayment = { id: 'payment_123' };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      billingService.createPayment.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      const result = await service.processPayment(
        mockUserId,
        amount,
        mockPaymentMethodId,
        description,
        metadata,
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          stripeCustomerId: true,
        },
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 15075,
        currency: 'usd',
        customer: mockCustomerId,
        payment_method: mockPaymentMethodId,
        confirmation_method: 'automatic',
        confirm: true,
        description,
        metadata: { userId: mockUserId, sessionId: 'session_123' },
      });

      expect(billingService.createPayment).toHaveBeenCalledWith({
        amount,
        paymentMethodId: mockPaymentMethodId,
        description,
        providerPaymentId: mockPaymentIntentId,
      });

      expect(billingService.updatePaymentStatus).toHaveBeenCalledWith(
        'payment_123',
        PaymentStatus.SUCCEEDED,
      );

      expect(result).toEqual({
        paymentIntent: mockPaymentIntent,
        payment: mockPayment,
      });
    });

    it('should process payment with requires_action status', async () => {
      const amount = 100;

      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: mockCustomerId,
      };

      const mockCustomer = { id: mockCustomerId, deleted: false };
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        status: 'requires_action',
      };
      const mockPayment = { id: 'payment_123' };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.customers.retrieve.mockResolvedValue(mockCustomer);
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      billingService.createPayment.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      const result = await service.processPayment(
        mockUserId,
        amount,
        mockPaymentMethodId,
      );

      expect(billingService.updatePaymentStatus).toHaveBeenCalledWith(
        'payment_123',
        PaymentStatus.REQUIRES_ACTION,
      );

      expect(result.paymentIntent).toEqual(mockPaymentIntent);
    });

    it('should handle user not found error', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.processPayment(mockUserId, 100, mockPaymentMethodId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle payment processing error', async () => {
      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: null,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      const testError = new Error('Card declined');
      mockStripe.customers.create.mockRejectedValue(testError);

      await expect(
        service.processPayment(mockUserId, 100, mockPaymentMethodId),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error processing payment'),
        testError,
      );
    });

    it('should handle user with incomplete name', async () => {
      const mockUser = {
        email: 'test@example.com',
        firstName: null,
        lastName: null,
        stripeCustomerId: null,
      };

      const mockCustomer = { id: mockCustomerId, email: 'test@example.com' };
      const mockPaymentIntent = { id: mockPaymentIntentId, status: 'pending' };
      const mockPayment = { id: 'payment_123' };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);
      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      billingService.createPayment.mockResolvedValue(mockPayment);

      const result = await service.processPayment(
        mockUserId,
        100,
        mockPaymentMethodId,
      );

      expect(mockStripe.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '', // Empty string when firstName and lastName are null
        }),
      );
    });
  });

  // ===== SUBSCRIPTION MANAGEMENT TESTS =====

  describe('createSubscription', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should create subscription successfully', async () => {
      const subscriptionData = {
        customerId: mockCustomerId,
        priceId: mockPriceId,
        defaultPaymentMethod: mockPaymentMethodId,
        trialPeriodDays: 7,
        billingCycle: BillingCycle.MONTHLY,
        metadata: { plan: 'premium' },
      };

      const mockSubscription = {
        id: mockSubscriptionId,
        customer: mockCustomerId,
        status: 'active',
        latest_invoice: {
          payment_intent: { id: mockPaymentIntentId },
        },
      };

      const mockPrice = {
        id: mockPriceId,
        product: { id: 'prod_123', name: 'Premium Plan' },
      };

      const mockLocalSubscription = { id: 'local_sub_123' };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);
      mockStripe.prices.retrieve.mockResolvedValue(mockPrice);
      billingService.createSubscription.mockResolvedValue(mockLocalSubscription);

      const result = await service.createSubscription(
        mockUserId,
        subscriptionData,
      );

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        items: [{ price: mockPriceId }],
        default_payment_method: mockPaymentMethodId,
        trial_period_days: 7,
        metadata: { userId: mockUserId, plan: 'premium' },
        expand: ['latest_invoice.payment_intent'],
      });

      expect(mockStripe.prices.retrieve).toHaveBeenCalledWith(mockPriceId, {
        expand: ['product'],
      });

      expect(billingService.createSubscription).toHaveBeenCalledWith({
        userId: mockUserId,
        planId: mockPriceId,
        billingCycle: BillingCycle.MONTHLY,
        defaultPaymentMethodId: mockPaymentMethodId,
        trialStart: expect.any(Date),
        trialEnd: expect.any(Date),
      });

      expect(result).toEqual({
        subscription: mockSubscription,
        localSubscription: mockLocalSubscription,
      });
    });

    it('should create subscription without trial period', async () => {
      const subscriptionData = {
        customerId: mockCustomerId,
        priceId: mockPriceId,
      };

      const mockSubscription = { id: mockSubscriptionId };
      const mockPrice = { id: mockPriceId, product: { id: 'prod_123' } };
      const mockLocalSubscription = { id: 'local_sub_123' };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);
      mockStripe.prices.retrieve.mockResolvedValue(mockPrice);
      billingService.createSubscription.mockResolvedValue(mockLocalSubscription);

      const result = await service.createSubscription(
        mockUserId,
        subscriptionData,
      );

      expect(billingService.createSubscription).toHaveBeenCalledWith({
        userId: mockUserId,
        planId: mockPriceId,
        billingCycle: BillingCycle.MONTHLY,
        defaultPaymentMethodId: undefined,
        trialStart: undefined,
        trialEnd: undefined,
      });
    });

    it('should handle subscription creation error', async () => {
      const subscriptionData = {
        customerId: 'invalid_customer',
        priceId: mockPriceId,
      };

      const testError = new Error('Customer not found');
      mockStripe.subscriptions.create.mockRejectedValue(testError);

      await expect(
        service.createSubscription(mockUserId, subscriptionData),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating subscription'),
        testError,
      );
    });
  });

  describe('updateSubscription', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should update subscription with new price', async () => {
      const updateData = {
        priceId: 'price_new_123',
        defaultPaymentMethod: 'pm_new_123',
        trialEnd: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        metadata: { updated: 'true' },
      };

      const existingSubscription = {
        id: mockSubscriptionId,
        items: {
          data: [{ id: 'si_existing_123' }],
        },
      };

      const updatedSubscription = {
        id: mockSubscriptionId,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 2592000,
      };

      mockStripe.subscriptions.retrieve.mockResolvedValue(existingSubscription);
      mockStripe.subscriptions.update.mockResolvedValue(updatedSubscription);

      const result = await service.updateSubscription(
        mockSubscriptionId,
        updateData,
      );

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        mockSubscriptionId,
        {
          items: [
            {
              id: 'si_existing_123',
              price: 'price_new_123',
            },
          ],
          default_payment_method: 'pm_new_123',
          trial_end: updateData.trialEnd,
          metadata: { updated: 'true' },
        },
      );

      expect(result).toEqual(updatedSubscription);
    });

    it('should update subscription with partial data', async () => {
      const updateData = {
        defaultPaymentMethod: 'pm_new_123',
      };

      const existingSubscription = {
        id: mockSubscriptionId,
        items: { data: [{ id: 'si_existing_123' }] },
      };

      const updatedSubscription = { id: mockSubscriptionId };

      mockStripe.subscriptions.retrieve.mockResolvedValue(existingSubscription);
      mockStripe.subscriptions.update.mockResolvedValue(updatedSubscription);

      const result = await service.updateSubscription(
        mockSubscriptionId,
        updateData,
      );

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        mockSubscriptionId,
        {
          default_payment_method: 'pm_new_123',
        },
      );

      expect(result).toEqual(updatedSubscription);
    });

    it('should handle subscription update error', async () => {
      const updateData = { priceId: 'invalid_price' };
      const testError = new Error('Price not found');

      mockStripe.subscriptions.retrieve.mockRejectedValue(testError);

      await expect(
        service.updateSubscription(mockSubscriptionId, updateData),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error updating subscription'),
        testError,
      );
    });
  });

  describe('cancelSubscription', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should cancel subscription at period end', async () => {
      const canceledSubscription = {
        id: mockSubscriptionId,
        cancel_at_period_end: true,
        status: 'active',
      };

      mockStripe.subscriptions.update.mockResolvedValue(canceledSubscription);

      const result = await service.cancelSubscription(mockSubscriptionId, true);

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        mockSubscriptionId,
        { cancel_at_period_end: true },
      );

      expect(result).toEqual(canceledSubscription);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Cancelled subscription ${mockSubscriptionId} (cancel_at_period_end: true)`,
      );
    });

    it('should cancel subscription immediately', async () => {
      const canceledSubscription = {
        id: mockSubscriptionId,
        cancel_at_period_end: false,
        status: 'canceled',
      };

      mockStripe.subscriptions.update.mockResolvedValue(canceledSubscription);

      const result = await service.cancelSubscription(
        mockSubscriptionId,
        false,
      );

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        mockSubscriptionId,
        { cancel_at_period_end: false },
      );

      expect(result).toEqual(canceledSubscription);
    });

    it('should handle subscription cancellation error', async () => {
      const testError = new Error('Subscription not found');
      mockStripe.subscriptions.update.mockRejectedValue(testError);

      await expect(
        service.cancelSubscription(mockSubscriptionId),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error cancelling subscription'),
        testError,
      );
    });
  });

  // ===== INVOICE MANAGEMENT TESTS =====

  describe('createInvoice', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should create invoice successfully', async () => {
      const invoiceData = {
        description: 'Monthly subscription',
        metadata: { planId: 'plan_123' },
        dueDate: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
      };

      const mockInvoice = {
        id: mockInvoiceId,
        customer: mockCustomerId,
        description: 'Monthly subscription',
      };

      mockStripe.invoices.create.mockResolvedValue(mockInvoice);

      const result = await service.createInvoice(mockCustomerId, invoiceData);

      expect(mockStripe.invoices.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        description: 'Monthly subscription',
        metadata: { planId: 'plan_123' },
        due_date: invoiceData.dueDate,
        auto_advance: false,
      });

      expect(result).toEqual(mockInvoice);
      expect(loggerSpy).toHaveBeenCalledWith(
        `Created invoice ${mockInvoiceId} for customer ${mockCustomerId}`,
      );
    });

    it('should create invoice with minimal data', async () => {
      const invoiceData = {};
      const mockInvoice = { id: mockInvoiceId, customer: mockCustomerId };

      mockStripe.invoices.create.mockResolvedValue(mockInvoice);

      const result = await service.createInvoice(mockCustomerId, invoiceData);

      expect(mockStripe.invoices.create).toHaveBeenCalledWith({
        customer: mockCustomerId,
        description: undefined,
        metadata: undefined,
        due_date: undefined,
        auto_advance: false,
      });

      expect(result).toEqual(mockInvoice);
    });

    it('should handle invoice creation error', async () => {
      const invoiceData = { description: 'Test invoice' };
      const testError = new Error('Customer not found');
      mockStripe.invoices.create.mockRejectedValue(testError);

      await expect(
        service.createInvoice('invalid_customer', invoiceData),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating invoice'),
        testError,
      );
    });
  });

  describe('finalizeInvoice', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should finalize invoice successfully', async () => {
      const finalizedInvoice = {
        id: mockInvoiceId,
        status: 'open',
        finalized_at: Math.floor(Date.now() / 1000),
      };

      mockStripe.invoices.finalizeInvoice.mockResolvedValue(finalizedInvoice);

      const result = await service.finalizeInvoice(mockInvoiceId);

      expect(mockStripe.invoices.finalizeInvoice).toHaveBeenCalledWith(
        mockInvoiceId,
        { auto_advance: true },
      );

      expect(result).toEqual(finalizedInvoice);
      expect(loggerSpy).toHaveBeenCalledWith(`Finalized invoice ${mockInvoiceId}`);
    });

    it('should handle invoice finalization error', async () => {
      const testError = new Error('Invoice already finalized');
      mockStripe.invoices.finalizeInvoice.mockRejectedValue(testError);

      await expect(service.finalizeInvoice(mockInvoiceId)).rejects.toThrow(
        testError,
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error finalizing invoice'),
        testError,
      );
    });
  });

  describe('payInvoice', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should pay invoice with payment method', async () => {
      const paidInvoice = {
        id: mockInvoiceId,
        status: 'paid',
        paid: true,
      };

      mockStripe.invoices.pay.mockResolvedValue(paidInvoice);

      const result = await service.payInvoice(
        mockInvoiceId,
        mockPaymentMethodId,
      );

      expect(mockStripe.invoices.pay).toHaveBeenCalledWith(mockInvoiceId, {
        payment_method: mockPaymentMethodId,
      });

      expect(result).toEqual(paidInvoice);
      expect(loggerSpy).toHaveBeenCalledWith(`Paid invoice ${mockInvoiceId}`);
    });

    it('should pay invoice without payment method', async () => {
      const paidInvoice = { id: mockInvoiceId, status: 'paid' };

      mockStripe.invoices.pay.mockResolvedValue(paidInvoice);

      const result = await service.payInvoice(mockInvoiceId);

      expect(mockStripe.invoices.pay).toHaveBeenCalledWith(mockInvoiceId, {
        payment_method: undefined,
      });

      expect(result).toEqual(paidInvoice);
    });

    it('should handle invoice payment error', async () => {
      const testError = new Error('Insufficient funds');
      mockStripe.invoices.pay.mockRejectedValue(testError);

      await expect(
        service.payInvoice(mockInvoiceId, mockPaymentMethodId),
      ).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error paying invoice'),
        testError,
      );
    });
  });

  // ===== WEBHOOK HANDLING TESTS =====

  describe('constructWebhookEvent', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should construct webhook event successfully', () => {
      const payload = Buffer.from('test payload');
      const signature = 'test_signature';
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: { object: { id: mockPaymentIntentId } },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = service.constructWebhookEvent(payload, signature);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_valid_secret',
      );
      expect(result).toEqual(mockEvent);
    });

    it('should handle webhook construction error', () => {
      const payload = Buffer.from('invalid payload');
      const signature = 'invalid_signature';
      const testError = new Error('Invalid signature');

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw testError;
      });

      expect(() =>
        service.constructWebhookEvent(payload, signature),
      ).toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error constructing webhook event:',
        testError,
      );
    });
  });

  describe('handleWebhookEvent', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should handle payment_intent.succeeded event', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: mockPaymentIntentId,
            amount: 10000,
            currency: 'usd',
            metadata: { userId: mockUserId },
          },
        },
      } as any;

      const mockPayment = { id: 'payment_123' };
      prismaService.payment.findFirst.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      await service.handleWebhookEvent(event);

      expect(billingService.updatePaymentStatus).toHaveBeenCalledWith(
        'payment_123',
        PaymentStatus.SUCCEEDED,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.succeeded', {
        userId: mockUserId,
        amount: 100,
        currency: 'usd',
        paymentIntentId: mockPaymentIntentId,
      });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: mockPaymentIntentId,
            amount: 5000,
            currency: 'usd',
            metadata: { userId: mockUserId },
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined.',
            },
          },
        },
      } as any;

      const mockPayment = { id: 'payment_123' };
      prismaService.payment.findFirst.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      await service.handleWebhookEvent(event);

      expect(billingService.updatePaymentStatus).toHaveBeenCalledWith(
        'payment_123',
        PaymentStatus.FAILED,
        {
          failureCode: 'card_declined',
          failureMessage: 'Your card was declined.',
        },
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.failed', {
        userId: mockUserId,
        amount: 50,
        currency: 'usd',
        paymentIntentId: mockPaymentIntentId,
        error: {
          code: 'card_declined',
          message: 'Your card was declined.',
        },
      });
    });

    it('should handle customer.subscription.created event', async () => {
      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: mockSubscriptionId,
            status: 'active',
            metadata: { userId: mockUserId },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.created', {
        userId: mockUserId,
        subscriptionId: mockSubscriptionId,
        status: 'active',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
      });
    });

    it('should handle customer.subscription.updated event', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: mockSubscriptionId,
            status: 'past_due',
            metadata: { userId: mockUserId },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          },
        },
      } as any;

      billingService.updateSubscription.mockResolvedValue({} as any);

      await service.handleWebhookEvent(event);

      expect(billingService.updateSubscription).toHaveBeenCalledWith(
        mockUserId,
        { status: SubscriptionStatus.PAST_DUE },
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.updated', {
        userId: mockUserId,
        subscriptionId: mockSubscriptionId,
        status: 'past_due',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
      });
    });

    it('should handle customer.subscription.deleted event', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: mockSubscriptionId,
            metadata: { userId: mockUserId },
            canceled_at: Math.floor(Date.now() / 1000),
          },
        },
      } as any;

      billingService.updateSubscription.mockResolvedValue({} as any);

      await service.handleWebhookEvent(event);

      expect(billingService.updateSubscription).toHaveBeenCalledWith(
        mockUserId,
        { status: SubscriptionStatus.CANCELED },
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith('subscription.cancelled', {
        userId: mockUserId,
        subscriptionId: mockSubscriptionId,
        canceledAt: expect.any(Number),
      });
    });

    it('should handle invoice.payment_succeeded event', async () => {
      const event = {
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: mockInvoiceId,
            amount_paid: 10000,
            currency: 'usd',
            metadata: { userId: mockUserId },
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.paid', {
        userId: mockUserId,
        invoiceId: mockInvoiceId,
        amount: 100,
        currency: 'usd',
      });
    });

    it('should handle invoice.payment_failed event', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: mockInvoiceId,
            amount_due: 10000,
            currency: 'usd',
            metadata: { userId: mockUserId },
            attempt_count: 3,
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith('invoice.payment_failed', {
        userId: mockUserId,
        invoiceId: mockInvoiceId,
        amount: 100,
        currency: 'usd',
        attemptCount: 3,
      });
    });

    it('should handle customer.subscription.trial_will_end event', async () => {
      const trialEndTimestamp = Math.floor(Date.now() / 1000) + 86400;
      const event = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            id: mockSubscriptionId,
            metadata: { userId: mockUserId },
            trial_end: trialEndTimestamp,
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.trial_will_end',
        {
          userId: mockUserId,
          subscriptionId: mockSubscriptionId,
          trialEnd: trialEndTimestamp,
        },
      );
    });

    it('should handle unhandled webhook event types', async () => {
      const event = {
        type: 'customer.created',
        data: { object: { id: 'cus_123' } },
      } as any;

      await service.handleWebhookEvent(event);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Unhandled webhook event type: customer.created',
      );
    });

    it('should handle webhook event without userId in metadata', async () => {
      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: mockSubscriptionId,
            status: 'active',
            metadata: {}, // No userId
          },
        },
      } as any;

      await service.handleWebhookEvent(event);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle webhook event processing error gracefully', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: mockPaymentIntentId,
            metadata: { userId: mockUserId },
          },
        },
      } as any;

      const testError = new Error('Database error');
      prismaService.payment.findFirst.mockRejectedValue(testError);

      await expect(service.handleWebhookEvent(event)).rejects.toThrow(testError);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error handling webhook event'),
        testError,
      );
    });
  });

  // ===== UTILITY METHODS TESTS =====

  describe('mapStripeSubscriptionStatus', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should map stripe subscription statuses correctly', async () => {
      // Access the private method through a test setup
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: mockSubscriptionId,
            status: 'active',
            metadata: { userId: mockUserId },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          },
        },
      } as any;

      billingService.updateSubscription.mockResolvedValue({} as any);
      await service.handleWebhookEvent(event);

      expect(billingService.updateSubscription).toHaveBeenCalledWith(
        mockUserId,
        { status: SubscriptionStatus.ACTIVE },
      );

      // Test different statuses through webhook events
      const testCases = [
        { stripe: 'active', expected: SubscriptionStatus.ACTIVE },
        { stripe: 'canceled', expected: SubscriptionStatus.CANCELED },
        { stripe: 'incomplete', expected: SubscriptionStatus.INCOMPLETE },
        {
          stripe: 'incomplete_expired',
          expected: SubscriptionStatus.INCOMPLETE_EXPIRED,
        },
        { stripe: 'past_due', expected: SubscriptionStatus.PAST_DUE },
        { stripe: 'trialing', expected: SubscriptionStatus.TRIALING },
        { stripe: 'unpaid', expected: SubscriptionStatus.UNPAID },
        { stripe: 'unknown_status', expected: SubscriptionStatus.ACTIVE }, // Default
      ];

      for (const testCase of testCases) {
        const testEvent = {
          ...event,
          data: {
            object: {
              ...event.data.object,
              status: testCase.stripe,
            },
          },
        };

        billingService.updateSubscription.mockClear();
        await service.handleWebhookEvent(testEvent);

        expect(billingService.updateSubscription).toHaveBeenCalledWith(
          mockUserId,
          { status: testCase.expected },
        );
      }
    });
  });

  describe('getStripeConfig', () => {
    it('should return stripe configuration', async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_test_secret';
          default:
            return null;
        }
      });

      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();

      const config = service.getStripeConfig();

      expect(config).toEqual({
        isInitialized: true,
        webhookSecret: 'whsec_test_secret',
      });
    });

    it('should return uninitialized state', () => {
      const config = service.getStripeConfig();

      expect(config).toEqual({
        isInitialized: false,
        webhookSecret: '',
      });
    });
  });

  // ===== INTEGRATION AND EDGE CASE TESTS =====

  describe('Integration scenarios', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should handle complete payment flow with webhooks', async () => {
      // 1. Create customer
      const mockUser = {
        email: 'integration@example.com',
        firstName: 'Integration',
        lastName: 'Test',
        stripeCustomerId: null,
      };

      const mockCustomer = { id: mockCustomerId, email: 'integration@example.com' };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      // 2. Process payment
      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 10000,
        status: 'succeeded',
        metadata: { userId: mockUserId },
      };

      const mockPayment = { id: 'payment_123' };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);
      billingService.createPayment.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      const paymentResult = await service.processPayment(
        mockUserId,
        100,
        mockPaymentMethodId,
        'Integration test payment',
      );

      expect(paymentResult.paymentIntent.status).toBe('succeeded');

      // 3. Simulate webhook event
      const webhookEvent = {
        type: 'payment_intent.succeeded',
        data: { object: mockPaymentIntent },
      } as any;

      prismaService.payment.findFirst.mockResolvedValue(mockPayment);

      await service.handleWebhookEvent(webhookEvent);

      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.succeeded', {
        userId: mockUserId,
        amount: 100,
        currency: 'usd',
        paymentIntentId: mockPaymentIntentId,
      });
    });

    it('should handle subscription lifecycle with multiple webhooks', async () => {
      // 1. Create subscription
      const subscriptionData = {
        customerId: mockCustomerId,
        priceId: mockPriceId,
        defaultPaymentMethod: mockPaymentMethodId,
        trialPeriodDays: 7,
        billingCycle: BillingCycle.MONTHLY,
      };

      const mockSubscription = {
        id: mockSubscriptionId,
        status: 'trialing',
        metadata: { userId: mockUserId },
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 604800, // 7 days
      };

      const mockPrice = { id: mockPriceId, product: { id: 'prod_123' } };
      const mockLocalSubscription = { id: 'local_sub_123' };

      mockStripe.subscriptions.create.mockResolvedValue(mockSubscription);
      mockStripe.prices.retrieve.mockResolvedValue(mockPrice);
      billingService.createSubscription.mockResolvedValue(mockLocalSubscription);

      const result = await service.createSubscription(mockUserId, subscriptionData);

      expect(result.subscription.status).toBe('trialing');

      // 2. Handle trial will end webhook
      const trialWillEndEvent = {
        type: 'customer.subscription.trial_will_end',
        data: {
          object: {
            id: mockSubscriptionId,
            metadata: { userId: mockUserId },
            trial_end: Math.floor(Date.now() / 1000) + 86400,
          },
        },
      } as any;

      await service.handleWebhookEvent(trialWillEndEvent);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.trial_will_end',
        expect.objectContaining({
          userId: mockUserId,
          subscriptionId: mockSubscriptionId,
        }),
      );

      // 3. Handle subscription updated to active
      const subscriptionUpdatedEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            ...mockSubscription,
            status: 'active',
          },
        },
      } as any;

      billingService.updateSubscription.mockResolvedValue({} as any);

      await service.handleWebhookEvent(subscriptionUpdatedEvent);

      expect(billingService.updateSubscription).toHaveBeenCalledWith(
        mockUserId,
        { status: SubscriptionStatus.ACTIVE },
      );
    });

    it('should handle payment failure and retry scenario', async () => {
      // 1. First payment attempt fails
      const failedPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 5000,
        status: 'requires_action',
        metadata: { userId: mockUserId },
        last_payment_error: {
          code: 'authentication_required',
          message: '3D Secure authentication required',
        },
      };

      const mockPayment = { id: 'payment_123' };

      mockStripe.paymentIntents.create.mockResolvedValue(failedPaymentIntent);
      billingService.createPayment.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      // Create initial payment
      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: mockCustomerId,
      };

      const mockCustomer = { id: mockCustomerId, deleted: false };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.customers.retrieve.mockResolvedValue(mockCustomer);

      const paymentResult = await service.processPayment(
        mockUserId,
        50,
        mockPaymentMethodId,
      );

      expect(paymentResult.paymentIntent.status).toBe('requires_action');
      expect(billingService.updatePaymentStatus).toHaveBeenCalledWith(
        'payment_123',
        PaymentStatus.REQUIRES_ACTION,
      );

      // 2. Confirm payment intent (after 3D Secure)
      const confirmedPaymentIntent = {
        ...failedPaymentIntent,
        status: 'succeeded',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(confirmedPaymentIntent);

      const confirmResult = await service.confirmPaymentIntent(
        mockPaymentIntentId,
        mockPaymentMethodId,
      );

      expect(confirmResult.status).toBe('succeeded');

      // 3. Handle success webhook
      const webhookEvent = {
        type: 'payment_intent.succeeded',
        data: { object: confirmedPaymentIntent },
      } as any;

      prismaService.payment.findFirst.mockResolvedValue(mockPayment);

      await service.handleWebhookEvent(webhookEvent);

      expect(eventEmitter.emit).toHaveBeenCalledWith('payment.succeeded', {
        userId: mockUserId,
        amount: 50,
        currency: 'usd',
        paymentIntentId: mockPaymentIntentId,
      });
    });
  });

  // ===== PERFORMANCE AND STRESS TESTS =====

  describe('Performance and concurrency tests', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should handle concurrent customer creation requests', async () => {
      const concurrentRequests = 10;
      const customerData = { email: 'concurrent@example.com' };

      // Mock responses for concurrent requests
      prismaService.user.findUnique.mockResolvedValue(null);
      const mockCustomer = { id: mockCustomerId, email: 'concurrent@example.com' };
      mockStripe.customers.create.mockResolvedValue(mockCustomer);
      prismaService.user.update.mockResolvedValue({} as any);

      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        service.createOrGetCustomer(`user-${i}`, customerData),
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(concurrentRequests);
      expect(mockStripe.customers.create).toHaveBeenCalledTimes(concurrentRequests);
      results.forEach((result) => {
        expect(result).toEqual(mockCustomer);
      });
    });

    it('should handle concurrent webhook processing', async () => {
      const concurrentWebhooks = 5;
      const mockPayment = { id: 'payment_123' };

      prismaService.payment.findFirst.mockResolvedValue(mockPayment);
      billingService.updatePaymentStatus.mockResolvedValue({} as any);

      const webhookEvents = Array.from({ length: concurrentWebhooks }, (_, i) => ({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_test_${i}`,
            amount: 10000,
            currency: 'usd',
            metadata: { userId: `user-${i}` },
          },
        },
      })) as any[];

      const webhookPromises = webhookEvents.map((event) =>
        service.handleWebhookEvent(event),
      );

      await Promise.all(webhookPromises);

      expect(billingService.updatePaymentStatus).toHaveBeenCalledTimes(
        concurrentWebhooks,
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(concurrentWebhooks);
    });

    it('should handle large metadata objects efficiently', async () => {
      const largeMetadata = Array.from({ length: 50 }, (_, i) => [
        `key${i}`,
        `value${i}`.repeat(10),
      ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      const paymentData = {
        amount: 100,
        metadata: largeMetadata,
      };

      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 10000,
        metadata: largeMetadata,
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const startTime = Date.now();
      const result = await service.createPaymentIntent(paymentData);
      const endTime = Date.now();

      expect(result).toEqual(mockPaymentIntent);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: largeMetadata,
        }),
      );
    });
  });

  // ===== ERROR HANDLING AND EDGE CASES =====

  describe('Error handling and edge cases', () => {
    beforeEach(async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();
    });

    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';

      mockStripe.customers.create.mockRejectedValue(timeoutError);
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrGetCustomer(mockUserId, { email: 'timeout@example.com' }),
      ).rejects.toThrow('Request timeout');

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating Stripe customer'),
        timeoutError,
      );
    });

    it('should handle malformed webhook payloads', async () => {
      const malformedEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: null, // Malformed data
        },
      } as any;

      // Should not throw but should log error
      await expect(service.handleWebhookEvent(malformedEvent)).rejects.toThrow();
    });

    it('should handle stripe API rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';

      mockStripe.paymentIntents.create.mockRejectedValue(rateLimitError);

      await expect(
        service.createPaymentIntent({ amount: 100 }),
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle invalid currency codes', async () => {
      const paymentData = {
        amount: 100,
        currency: 'INVALID',
      };

      const currencyError = new Error('Invalid currency');
      mockStripe.paymentIntents.create.mockRejectedValue(currencyError);

      await expect(service.createPaymentIntent(paymentData)).rejects.toThrow(
        'Invalid currency',
      );
    });

    it('should handle zero amount payments', async () => {
      const paymentData = {
        amount: 0,
      };

      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 0,
        currency: 'usd',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(paymentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 0,
        }),
      );
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle extremely large amounts', async () => {
      const paymentData = {
        amount: 999999999.99, // Very large amount
      };

      const mockPaymentIntent = {
        id: mockPaymentIntentId,
        amount: 99999999999, // Amount in cents
        currency: 'usd',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(paymentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99999999999,
        }),
      );
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle webhook events with missing required fields', async () => {
      const incompleteEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: mockPaymentIntentId,
            // Missing amount, currency, metadata
          },
        },
      } as any;

      prismaService.payment.findFirst.mockResolvedValue(null); // No payment found

      await service.handleWebhookEvent(incompleteEvent);

      // Should not emit events when payment is not found
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle database connection failures during webhook processing', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: mockPaymentIntentId,
            amount: 10000,
            currency: 'usd',
            metadata: { userId: mockUserId },
          },
        },
      } as any;

      const dbError = new Error('Database connection failed');
      prismaService.payment.findFirst.mockRejectedValue(dbError);

      await expect(service.handleWebhookEvent(event)).rejects.toThrow(
        'Database connection failed',
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error handling webhook event'),
        dbError,
      );
    });

    it('should handle service cleanup and resource management', async () => {
      // Test that service can handle being destroyed and recreated
      const newService = new StripeService(
        prismaService,
        configService,
        billingService,
        eventEmitter,
      );

      // Before initialization, should throw errors
      await expect(
        newService.createPaymentIntent({ amount: 100 }),
      ).rejects.toThrow(BadRequestException);

      // After initialization, should work
      await newService.onModuleInit();
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: mockPaymentIntentId,
        amount: 10000,
      });

      const result = await newService.createPaymentIntent({ amount: 100 });
      expect(result.amount).toBe(10000);
    });
  });

  // ===== MEMORY AND RESOURCE MANAGEMENT =====

  describe('Memory and resource management', () => {
    it('should not leak memory during webhook processing', async () => {
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'STRIPE_SECRET_KEY':
            return 'sk_test_valid_key';
          case 'STRIPE_WEBHOOK_SECRET':
            return 'whsec_valid_secret';
          default:
            return null;
        }
      });
      mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });
      await service.onModuleInit();

      const initialMemory = process.memoryUsage().heapUsed;
      const webhookCount = 100;

      // Process many webhook events
      for (let i = 0; i < webhookCount; i++) {
        const event = {
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: `pi_test_${i}`,
              amount: 10000,
              currency: 'usd',
              metadata: { userId: `user-${i}` },
            },
          },
        } as any;

        prismaService.payment.findFirst.mockResolvedValue({ id: `payment_${i}` });
        billingService.updatePaymentStatus.mockResolvedValue({} as any);

        await service.handleWebhookEvent(event);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB for 100 events)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should handle rapid initialization cycles', async () => {
      const initializationCount = 10;

      for (let i = 0; i < initializationCount; i++) {
        configService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'STRIPE_SECRET_KEY':
              return `sk_test_key_${i}`;
            case 'STRIPE_WEBHOOK_SECRET':
              return `whsec_secret_${i}`;
            default:
              return null;
          }
        });

        mockStripe.balance.retrieve.mockResolvedValue({ object: 'balance' });

        await service.onModuleInit();

        const config = service.getStripeConfig();
        expect(config.isInitialized).toBe(true);
        expect(config.webhookSecret).toBe(`whsec_secret_${i}`);
      }
    });
  });
});