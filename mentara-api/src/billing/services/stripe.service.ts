import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { BillingService } from '../billing.service';
import {
  PaymentMethodType,
  PaymentStatus,
  SubscriptionStatus,
  BillingCycle,
  InvoiceStatus,
} from '@prisma/client';

interface StripeCustomerData {
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: { [key: string]: string };
}

interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  customerId?: string;
  description?: string;
  metadata?: { [key: string]: string };
  confirmationMethod?: 'automatic' | 'manual';
}

interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  defaultPaymentMethod?: string;
  trialPeriodDays?: number;
  billingCycle?: BillingCycle;
  metadata?: { [key: string]: string };
}

interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id?: string;
    idempotency_key?: string;
  };
}

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private stripe!: Stripe;
  private isInitialized = false;
  private webhookSecret!: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly billingService: BillingService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.initializeStripe();
  }

  /**
   * Initialize Stripe with API key
   */
  private async initializeStripe(): Promise<void> {
    try {
      const stripeSecretKey =
        this.configService.get<string>('STRIPE_SECRET_KEY');
      this.webhookSecret =
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

      if (!stripeSecretKey) {
        this.logger.warn(
          'Stripe secret key not configured. Payment processing will be disabled.',
        );
        return;
      }

      this.stripe = new Stripe(stripeSecretKey, {
        typescript: true,
      });

      // Test the connection
      await this.stripe.balance.retrieve();
      this.isInitialized = true;
      this.logger.log('Stripe initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Stripe:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Check if Stripe is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Please contact support.',
      );
    }
  }

  // ===== CUSTOMER MANAGEMENT =====

  /**
   * Create or retrieve Stripe customer
   */
  async createOrGetCustomer(
    userId: string,
    data: StripeCustomerData,
  ): Promise<Stripe.Customer> {
    this.ensureInitialized();

    try {
      // Check if customer already exists in our database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
      });

      if (user?.stripeCustomerId) {
        try {
          // Retrieve existing customer
          const customer = (await this.stripe.customers.retrieve(
            user.stripeCustomerId,
          )) as Stripe.Customer;
          if (!customer.deleted) {
            return customer;
          }
        } catch (error) {
          this.logger.warn(
            `Failed to retrieve existing customer ${user.stripeCustomerId}:`,
            error,
          );
        }
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        metadata: {
          userId,
          ...data.metadata,
        },
      });

      // Update user with Stripe customer ID
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      this.logger.log(
        `Created Stripe customer ${customer.id} for user ${userId}`,
      );
      return customer;
    } catch (error) {
      this.logger.error(
        `Error creating Stripe customer for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update Stripe customer
   */
  async updateCustomer(
    customerId: string,
    data: Partial<StripeCustomerData>,
  ): Promise<Stripe.Customer> {
    this.ensureInitialized();

    try {
      const customer = await this.stripe.customers.update(customerId, data);
      this.logger.log(`Updated Stripe customer ${customerId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Error updating Stripe customer ${customerId}:`, error);
      throw error;
    }
  }

  // ===== PAYMENT METHODS =====

  /**
   * Create payment method
   */
  async createPaymentMethod(
    userId: string,
    paymentMethodData: {
      type: 'card';
      card: {
        number: string;
        exp_month: number;
        exp_year: number;
        cvc: string;
      };
    },
  ): Promise<Stripe.PaymentMethod> {
    this.ensureInitialized();

    try {
      const paymentMethod =
        await this.stripe.paymentMethods.create(paymentMethodData);

      // Store payment method in database
      await this.billingService.createPaymentMethod({
        userId,
        type: PaymentMethodType.CARD,
        cardLast4: paymentMethod.card?.last4,
        cardBrand: paymentMethod.card?.brand,
        cardExpMonth: paymentMethod.card?.exp_month,
        cardExpYear: paymentMethod.card?.exp_year,
        stripePaymentMethodId: paymentMethod.id,
      });

      this.logger.log(
        `Created payment method ${paymentMethod.id} for user ${userId}`,
      );
      return paymentMethod;
    } catch (error) {
      this.logger.error(
        `Error creating payment method for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    this.ensureInitialized();

    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: customerId,
        },
      );

      this.logger.log(
        `Attached payment method ${paymentMethodId} to customer ${customerId}`,
      );
      return paymentMethod;
    } catch (error) {
      this.logger.error(
        `Error attaching payment method ${paymentMethodId} to customer ${customerId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Detach payment method from customer
   */
  async detachPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    this.ensureInitialized();

    try {
      const paymentMethod =
        await this.stripe.paymentMethods.detach(paymentMethodId);
      this.logger.log(`Detached payment method ${paymentMethodId}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error(
        `Error detaching payment method ${paymentMethodId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== PAYMENT PROCESSING =====

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    data: CreatePaymentIntentData,
  ): Promise<Stripe.PaymentIntent> {
    this.ensureInitialized();

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || 'usd',
        customer: data.customerId,
        payment_method: data.paymentMethodId,
        confirmation_method: data.confirmationMethod || 'automatic',
        confirm: data.confirmationMethod === 'automatic',
        description: data.description,
        metadata: data.metadata || {},
      });

      this.logger.log(
        `Created payment intent ${paymentIntent.id} for amount $${data.amount}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error creating payment intent:`, error);
      throw error;
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    this.ensureInitialized();

    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        },
      );

      this.logger.log(`Confirmed payment intent ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(
        `Error confirming payment intent ${paymentIntentId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Process one-time payment
   */
  async processPayment(
    userId: string,
    amount: number,
    paymentMethodId: string,
    description?: string,
    metadata?: { [key: string]: string },
  ): Promise<{
    paymentIntent: Stripe.PaymentIntent;
    payment: any;
  }> {
    this.ensureInitialized();

    try {
      // Get or create customer
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          stripeCustomerId: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      const customer = await this.createOrGetCustomer(userId, {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      });

      // Create payment intent
      const paymentIntent = await this.createPaymentIntent({
        amount,
        customerId: customer.id,
        paymentMethodId,
        description,
        metadata: { userId, ...metadata },
      });

      // Create payment record
      const payment = await this.billingService.createPayment({
        amount,
        paymentMethodId,
        description,
        providerPaymentId: paymentIntent.id,
      });

      // Update payment status based on payment intent status
      if (paymentIntent.status === 'succeeded') {
        await this.billingService.updatePaymentStatus(
          payment.id,
          PaymentStatus.SUCCEEDED,
        );
      } else if (paymentIntent.status === 'requires_action') {
        await this.billingService.updatePaymentStatus(
          payment.id,
          PaymentStatus.REQUIRES_ACTION,
        );
      }

      return { paymentIntent, payment };
    } catch (error) {
      this.logger.error(`Error processing payment for user ${userId}:`, error);
      throw error;
    }
  }

  // ===== SUBSCRIPTION MANAGEMENT =====

  /**
   * Create Stripe subscription
   */
  async createSubscription(
    userId: string,
    data: CreateSubscriptionData,
  ): Promise<{
    subscription: Stripe.Subscription;
    localSubscription: any;
  }> {
    this.ensureInitialized();

    try {
      // Create Stripe subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        default_payment_method: data.defaultPaymentMethod,
        trial_period_days: data.trialPeriodDays,
        metadata: { userId, ...data.metadata },
        expand: ['latest_invoice.payment_intent'],
      });

      // Get subscription plan details
      const price = await this.stripe.prices.retrieve(data.priceId, {
        expand: ['product'],
      });

      // Create local subscription record
      const localSubscription = await this.billingService.createSubscription({
        userId,
        planId: data.priceId,
        billingCycle: data.billingCycle || BillingCycle.MONTHLY,
        defaultPaymentMethodId: data.defaultPaymentMethod,
        trialStart: data.trialPeriodDays ? new Date() : undefined,
        trialEnd: data.trialPeriodDays
          ? new Date(Date.now() + data.trialPeriodDays * 24 * 60 * 60 * 1000)
          : undefined,
      });

      this.logger.log(
        `Created subscription ${subscription.id} for user ${userId}`,
      );
      return { subscription, localSubscription };
    } catch (error) {
      this.logger.error(
        `Error creating subscription for user ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    data: {
      priceId?: string;
      defaultPaymentMethod?: string;
      trialEnd?: number;
      metadata?: { [key: string]: string };
    },
  ): Promise<Stripe.Subscription> {
    this.ensureInitialized();

    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);

      const updateData: Stripe.SubscriptionUpdateParams = {};

      if (data.priceId) {
        updateData.items = [
          {
            id: subscription.items.data[0].id,
            price: data.priceId,
          },
        ];
      }

      if (data.defaultPaymentMethod) {
        updateData.default_payment_method = data.defaultPaymentMethod;
      }

      if (data.trialEnd) {
        updateData.trial_end = data.trialEnd;
      }

      if (data.metadata) {
        updateData.metadata = data.metadata;
      }

      const updatedSubscription = await this.stripe.subscriptions.update(
        subscriptionId,
        updateData,
      );
      this.logger.log(`Updated subscription ${subscriptionId}`);

      return updatedSubscription;
    } catch (error) {
      this.logger.error(
        `Error updating subscription ${subscriptionId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true,
  ): Promise<Stripe.Subscription> {
    this.ensureInitialized();

    try {
      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: cancelAtPeriodEnd,
        },
      );

      this.logger.log(
        `Cancelled subscription ${subscriptionId} (cancel_at_period_end: ${cancelAtPeriodEnd})`,
      );
      return subscription;
    } catch (error) {
      this.logger.error(
        `Error cancelling subscription ${subscriptionId}:`,
        error,
      );
      throw error;
    }
  }

  // ===== INVOICE MANAGEMENT =====

  /**
   * Create invoice
   */
  async createInvoice(
    customerId: string,
    data: {
      description?: string;
      metadata?: { [key: string]: string };
      dueDate?: number;
    },
  ): Promise<Stripe.Invoice> {
    this.ensureInitialized();

    try {
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        description: data.description,
        metadata: data.metadata,
        due_date: data.dueDate,
        auto_advance: false,
      });

      this.logger.log(
        `Created invoice ${invoice.id} for customer ${customerId}`,
      );
      return invoice;
    } catch (error) {
      this.logger.error(
        `Error creating invoice for customer ${customerId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Finalize and send invoice
   */
  async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    this.ensureInitialized();

    try {
      const invoice = await this.stripe.invoices.finalizeInvoice(invoiceId, {
        auto_advance: true,
      });

      this.logger.log(`Finalized invoice ${invoiceId}`);
      return invoice;
    } catch (error) {
      this.logger.error(`Error finalizing invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  /**
   * Pay invoice
   */
  async payInvoice(
    invoiceId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.Invoice> {
    this.ensureInitialized();

    try {
      const invoice = await this.stripe.invoices.pay(invoiceId, {
        payment_method: paymentMethodId,
      });

      this.logger.log(`Paid invoice ${invoiceId}`);
      return invoice;
    } catch (error) {
      this.logger.error(`Error paying invoice ${invoiceId}:`, error);
      throw error;
    }
  }

  // ===== WEBHOOK HANDLING =====

  /**
   * Construct webhook event from request
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    this.ensureInitialized();

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      this.logger.error('Error constructing webhook event:', error);
      throw error;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      this.logger.log(`Handling webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling webhook event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Handle payment intent succeeded
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { providerPaymentId: paymentIntent.id },
      });

      if (payment) {
        await this.billingService.updatePaymentStatus(
          payment.id,
          PaymentStatus.SUCCEEDED,
        );

        // Emit event for notifications
        this.eventEmitter.emit('payment.succeeded', {
          userId: paymentIntent.metadata.userId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (error) {
      this.logger.error('Error handling payment intent succeeded:', error);
    }
  }

  /**
   * Handle payment intent failed
   */
  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    try {
      const payment = await this.prisma.payment.findFirst({
        where: { providerPaymentId: paymentIntent.id },
      });

      if (payment) {
        await this.billingService.updatePaymentStatus(
          payment.id,
          PaymentStatus.FAILED,
          {
            failureCode: paymentIntent.last_payment_error?.code,
            failureMessage: paymentIntent.last_payment_error?.message,
          },
        );

        // Emit event for notifications
        this.eventEmitter.emit('payment.failed', {
          userId: paymentIntent.metadata.userId,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error,
        });
      }
    } catch (error) {
      this.logger.error('Error handling payment intent failed:', error);
    }
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      // Emit event for notifications
      this.eventEmitter.emit('subscription.created', {
        userId,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000,
        ),
      });
    } catch (error) {
      this.logger.error('Error handling subscription created:', error);
    }
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      // Update local subscription status
      await this.billingService.updateSubscription(userId, {
        status: this.mapStripeSubscriptionStatus(subscription.status),
      });

      // Emit event for notifications
      this.eventEmitter.emit('subscription.updated', {
        userId,
        subscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000,
        ),
      });
    } catch (error) {
      this.logger.error('Error handling subscription updated:', error);
    }
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      // Update local subscription status
      await this.billingService.updateSubscription(userId, {
        status: SubscriptionStatus.CANCELED,
      });

      // Emit event for notifications
      this.eventEmitter.emit('subscription.cancelled', {
        userId,
        subscriptionId: subscription.id,
        canceledAt: subscription.canceled_at,
      });
    } catch (error) {
      this.logger.error('Error handling subscription deleted:', error);
    }
  }

  /**
   * Handle invoice payment succeeded
   */
  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    try {
      const userId = invoice.metadata?.userId;
      if (!userId) return;

      // Emit event for notifications
      this.eventEmitter.emit('invoice.paid', {
        userId,
        invoiceId: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
      });
    } catch (error) {
      this.logger.error('Error handling invoice payment succeeded:', error);
    }
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    try {
      const userId = invoice.metadata?.userId;
      if (!userId) return;

      // Emit event for notifications
      this.eventEmitter.emit('invoice.payment_failed', {
        userId,
        invoiceId: invoice.id,
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        attemptCount: invoice.attempt_count,
      });
    } catch (error) {
      this.logger.error('Error handling invoice payment failed:', error);
    }
  }

  /**
   * Handle trial will end
   */
  private async handleTrialWillEnd(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const userId = subscription.metadata.userId;
      if (!userId) return;

      // Emit event for notifications
      this.eventEmitter.emit('subscription.trial_will_end', {
        userId,
        subscriptionId: subscription.id,
        trialEnd: subscription.trial_end,
      });
    } catch (error) {
      this.logger.error('Error handling trial will end:', error);
    }
  }

  /**
   * Map Stripe subscription status to local enum
   */
  private mapStripeSubscriptionStatus(
    stripeStatus: string,
  ): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'incomplete_expired':
        return SubscriptionStatus.INCOMPLETE_EXPIRED;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }

  /**
   * Get Stripe configuration info
   */
  getStripeConfig(): { isInitialized: boolean; webhookSecret: string } {
    return {
      isInitialized: this.isInitialized,
      webhookSecret: this.webhookSecret,
    };
  }
}
