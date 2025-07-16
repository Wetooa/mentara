import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeService } from './services/stripe.service';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { PrismaService } from 'src/providers/prisma-client.provider';

@Module({
  imports: [ConfigModule],
  controllers: [BillingController, StripeWebhookController],
  providers: [BillingService, StripeService, PrismaService],
  exports: [BillingService, StripeService],
})
export class BillingModule {}
