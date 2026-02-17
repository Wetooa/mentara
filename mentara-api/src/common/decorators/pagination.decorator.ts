import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Decorator to extract and validate pagination parameters from query
 * Provides defaults: page=1, limit=20
 * Validates: page >= 1, limit between 1 and 100
 */
export const Pagination = createParamDecorator(
  (data: { defaultLimit?: number; maxLimit?: number } = {}, ctx: ExecutionContext): PaginationParams => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const defaultLimit = data.defaultLimit || 20;
    const maxLimit = data.maxLimit || 100;

    let page = parseInt(query.page, 10);
    let limit = parseInt(query.limit, 10);

    // Validate and set defaults
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1) {
      limit = defaultLimit;
    }

    // Enforce maximum limit
    if (limit > maxLimit) {
      limit = maxLimit;
    }

    const skip = (page - 1) * limit;

    return { page, limit, skip };
  },
);


