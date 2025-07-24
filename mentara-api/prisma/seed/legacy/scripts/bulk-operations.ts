// Bulk Operations Utilities for Database Seeding
// Performance-optimized functions for large-scale data insertion

import { PrismaClient } from '@prisma/client';

/**
 * Chunks an array into smaller arrays of specified size
 * @param array - Array to chunk
 * @param chunkSize - Size of each chunk (default: 1000)
 * @returns Array of chunks
 */
export function chunk<T>(array: T[], chunkSize: number = 1000): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Performs chunked bulk insert using createMany
 * @param prisma - Prisma client
 * @param model - Prisma model name
 * @param data - Array of data to insert
 * @param options - Options for createMany and chunking
 */
export async function chunkedBulkInsert<T extends Record<string, any>>(
  prisma: PrismaClient,
  model: keyof PrismaClient,
  data: T[],
  options: {
    chunkSize?: number;
    skipDuplicates?: boolean;
    logProgress?: boolean;
    operationName?: string;
  } = {}
): Promise<{ count: number; chunks: number }> {
  const {
    chunkSize = 1000,
    skipDuplicates = true,
    logProgress = true,
    operationName = model.toString()
  } = options;

  if (data.length === 0) {
    return { count: 0, chunks: 0 };
  }

  const chunks = chunk(data, chunkSize);
  let totalInserted = 0;

  if (logProgress) {
    console.log(`📦 Starting chunked bulk insert for ${operationName}: ${data.length} records in ${chunks.length} chunks`);
  }

  for (let i = 0; i < chunks.length; i++) {
    const chunkData = chunks[i];
    
    try {
      // Cast to any to handle dynamic model access
      const prismaModel = (prisma as any)[model];
      if (!prismaModel || !prismaModel.createMany) {
        throw new Error(`Model ${model.toString()} not found or doesn't support createMany`);
      }

      const result = await prismaModel.createMany({
        data: chunkData,
        skipDuplicates,
      });

      totalInserted += result.count;

      if (logProgress && chunks.length > 1) {
        console.log(`  ⚡ Chunk ${i + 1}/${chunks.length}: ${result.count} ${operationName} inserted`);
      }
    } catch (error) {
      console.error(`❌ Error inserting chunk ${i + 1}/${chunks.length} for ${operationName}:`, error);
      throw error;
    }
  }

  if (logProgress) {
    console.log(`✅ Bulk insert completed: ${totalInserted}/${data.length} ${operationName} inserted successfully`);
  }

  return { count: totalInserted, chunks: chunks.length };
}

/**
 * Performs batched operations within a transaction
 * @param prisma - Prisma client
 * @param operations - Array of Prisma operations to execute
 * @param options - Transaction and batching options
 */
export async function batchedTransaction<T>(
  prisma: PrismaClient,
  operations: (() => Promise<T>)[],
  options: {
    batchSize?: number;
    logProgress?: boolean;
    operationName?: string;
  } = {}
): Promise<T[]> {
  const {
    batchSize = 50,
    logProgress = true,
    operationName = 'operations'
  } = options;

  const batches = chunk(operations, batchSize);
  const results: T[] = [];

  if (logProgress) {
    console.log(`🔄 Starting batched transaction for ${operationName}: ${operations.length} operations in ${batches.length} batches`);
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    try {
      const batchResults = await prisma.$transaction(
        batch.map(op => op()),
        {
          maxWait: 30000, // 30 seconds
          timeout: 60000, // 60 seconds
        }
      );

      results.push(...batchResults);

      if (logProgress && batches.length > 1) {
        console.log(`  ⚡ Batch ${i + 1}/${batches.length}: ${batch.length} ${operationName} completed`);
      }
    } catch (error) {
      console.error(`❌ Error in batch ${i + 1}/${batches.length} for ${operationName}:`, error);
      throw error;
    }
  }

  if (logProgress) {
    console.log(`✅ Batched transaction completed: ${results.length} ${operationName} processed successfully`);
  }

  return results;
}

/**
 * Progress tracker for long-running operations
 */
export class BulkOperationProgress {
  private total: number;
  private current: number = 0;
  private startTime: number;
  private operationName: string;

  constructor(total: number, operationName: string) {
    this.total = total;
    this.operationName = operationName;
    this.startTime = Date.now();
  }

  update(count: number = 1) {
    this.current += count;
    const progress = (this.current / this.total * 100).toFixed(1);
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current / elapsed;
    const estimated = (this.total - this.current) / rate;

    console.log(`📊 ${this.operationName}: ${this.current}/${this.total} (${progress}%) | ${rate.toFixed(1)}/sec | ETA: ${estimated.toFixed(0)}s`);
  }

  complete() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current / elapsed;
    console.log(`✅ ${this.operationName} completed: ${this.current} items in ${elapsed.toFixed(1)}s (${rate.toFixed(1)}/sec)`);
  }
}