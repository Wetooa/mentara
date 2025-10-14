/**
 * Base Enricher
 * 
 * Common functionality for all table enrichers
 */

import { PrismaClient } from '@prisma/client';
import { createSeededRandom } from '../utils/deterministic-random';

export interface EnrichmentResult {
  table: string;
  itemsAdded: number;
  itemsUpdated: number;
  errors: number;
}

export abstract class BaseEnricher {
  protected prisma: PrismaClient;
  protected tableName: string;

  constructor(prisma: PrismaClient, tableName: string) {
    this.prisma = prisma;
    this.tableName = tableName;
  }

  /**
   * Main enrichment method - must be implemented by each enricher
   */
  abstract enrich(): Promise<EnrichmentResult>;

  /**
   * Helper: Random past date
   */
  protected randomPastDate(daysAgo: number): Date {
    const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
    return new Date(ms);
  }

  /**
   * Helper: Random date after another date
   */
  protected randomDateAfter(date: Date, daysAfter: number): Date {
    const ms = date.getTime() + Math.random() * daysAfter * 24 * 60 * 60 * 1000;
    return new Date(ms);
  }

  /**
   * Helper: Random future date
   */
  protected randomFutureDate(daysAhead: number): Date {
    const ms = Date.now() + Math.random() * daysAhead * 24 * 60 * 60 * 1000;
    return new Date(ms);
  }

  /**
   * Helper: Get seeded random for entity
   */
  protected getRandom(entityId: string, context: string) {
    return createSeededRandom(entityId, context);
  }
}

