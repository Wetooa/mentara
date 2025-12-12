import { Prisma } from '@prisma/client';
import { PaginationParams } from '../decorators/pagination.decorator';
import { PaginationMeta, createPaginationMeta } from '../dto/api-response.dto';

/**
 * Pagination helper utilities
 */
export class PaginationHelper {
  /**
   * Create Prisma findMany arguments with pagination
   */
  static createFindManyArgs<T>(
    pagination: PaginationParams,
    where?: Prisma.Args<T, 'findMany'>['where'],
    orderBy?: Prisma.Args<T, 'findMany'>['orderBy'],
  ): {
    where?: Prisma.Args<T, 'findMany'>['where'];
    orderBy?: Prisma.Args<T, 'findMany'>['orderBy'];
    skip: number;
    take: number;
  } {
    return {
      where,
      orderBy,
      skip: pagination.skip,
      take: pagination.limit,
    };
  }

  /**
   * Create pagination meta from results
   */
  static createMeta(
    total: number,
    pagination: PaginationParams,
  ): PaginationMeta {
    return createPaginationMeta(total, pagination.page, pagination.limit);
  }

  /**
   * Execute paginated query with count
   */
  static async executePaginatedQuery<T>(
    findManyFn: (args: { skip: number; take: number; where?: unknown; orderBy?: unknown }) => Promise<T[]>,
    countFn: (args?: { where?: unknown }) => Promise<number>,
    pagination: PaginationParams,
    where?: unknown,
    orderBy?: unknown,
  ): Promise<{ data: T[]; meta: PaginationMeta }> {
    const [data, total] = await Promise.all([
      findManyFn({
        skip: pagination.skip,
        take: pagination.limit,
        where,
        orderBy,
      }),
      countFn(where ? { where } : undefined),
    ]);

    return {
      data,
      meta: this.createMeta(total, pagination),
    };
  }
}


