/**
 * Payments Enricher
 * Placeholder for future payment seeding when billing is ready
 */

import { PrismaClient } from '@prisma/client';
import { BaseEnricher, EnrichmentResult } from './base-enricher';

export class PaymentsEnricher extends BaseEnricher {
  constructor(prisma: PrismaClient) {
    super(prisma, 'Payment');
  }

  async enrich(): Promise<EnrichmentResult> {
    // Skip for now - billing system not ready
    // Will implement when billing module is complete
    
    return {
      table: this.tableName,
      itemsAdded: 0,
      itemsUpdated: 0,
      errors: 0,
    };
  }

  // TODO: Implement when billing is ready
  // async ensureMeetingHasPayment(meetingId: string): Promise<number> {
  //   // Create payment for completed meeting
  // }
  
  // async ensureUserHasPaymentMethod(userId: string): Promise<number> {
  //   // Create payment method for user
  // }
}

