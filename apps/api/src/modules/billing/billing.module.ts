import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PrismaService } from 'src/core/prisma/prisma.service';

/**
 * Educational Billing Module for Mental Health Platform
 * 
 * Simplified payment processing module suitable for a school project.
 * Removed complex subscription and Stripe integrations in favor of
 * educational mock payment processing.
 */
@Module({
  controllers: [BillingController],
  providers: [BillingService, PrismaService],
  exports: [BillingService],
})
export class BillingModule {}