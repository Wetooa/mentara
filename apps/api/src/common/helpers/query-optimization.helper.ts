import { Prisma } from '@prisma/client';

/**
 * Query optimization helpers
 * Provides utilities to optimize Prisma queries and prevent N+1 problems
 */
export class QueryOptimizationHelper {
  /**
   * Create optimized include object to prevent N+1 queries
   * Only includes necessary relations
   */
  static createOptimizedInclude<T extends Record<string, unknown>>(
    relations: (keyof T)[],
  ): Record<string, boolean> {
    return relations.reduce((acc, relation) => {
      acc[relation as string] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  /**
   * Create select object to limit fields returned
   * Reduces data transfer and improves performance
   */
  static createSelect<T extends Record<string, unknown>>(
    fields: (keyof T)[],
  ): Record<string, boolean> {
    return fields.reduce((acc, field) => {
      acc[field as string] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  /**
   * Batch load related data to prevent N+1 queries
   */
  static async batchLoad<T, K extends keyof T>(
    items: T[],
    key: K,
    loaderFn: (ids: T[K][]) => Promise<Map<T[K], unknown>>,
  ): Promise<Map<T[K], unknown>> {
    const ids = items.map((item) => item[key]).filter((id) => id != null);
    const uniqueIds = Array.from(new Set(ids));
    return loaderFn(uniqueIds);
  }

  /**
   * Create optimized where clause with proper indexing hints
   */
  static createIndexedWhere<T>(
    indexedFields: Record<string, unknown>,
    additionalWhere?: Prisma.Args<T, 'findMany'>['where'],
  ): Prisma.Args<T, 'findMany'>['where'] {
    return {
      ...indexedFields,
      ...additionalWhere,
    } as Prisma.Args<T, 'findMany'>['where'];
  }
}


