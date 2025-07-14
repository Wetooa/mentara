import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { validateSchema, formatValidationErrors } from 'mentara-commons';

// Body validation decorator that validates request body using Zod schemas
export const ValidatedBody = createParamDecorator(
  (schema: z.ZodSchema, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const body = request.body;

    if (!schema) {
      throw new Error('Schema is required for ValidatedBody decorator');
    }

    const result = validateSchema(schema, body);
    
    if (!result.success) {
      const errorMessage = formatValidationErrors(result.errors);
      throw new BadRequestException(`Validation failed: ${errorMessage}`);
    }
    
    return result.data;
  },
);

// Query validation decorator for query parameters
export const ValidatedQuery = createParamDecorator(
  (schema: z.ZodSchema, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    if (!schema) {
      throw new Error('Schema is required for ValidatedQuery decorator');
    }

    // Convert query parameters to appropriate types
    const processedQuery: Record<string, any> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Try to coerce string values
        if (value === 'true') {
          processedQuery[key] = true;
        } else if (value === 'false') {
          processedQuery[key] = false;
        } else if (value === 'null') {
          processedQuery[key] = null;
        } else if (value === 'undefined') {
          processedQuery[key] = undefined;
        } else if (!isNaN(Number(value)) && value !== '') {
          processedQuery[key] = Number(value);
        } else {
          processedQuery[key] = value;
        }
      } else {
        processedQuery[key] = value;
      }
    });

    const result = validateSchema(schema, processedQuery);
    
    if (!result.success) {
      const errorMessage = formatValidationErrors(result.errors);
      throw new BadRequestException(`Query validation failed: ${errorMessage}`);
    }
    
    return result.data;
  },
);

// Params validation decorator for path parameters
export const ValidatedParams = createParamDecorator(
  (schema: z.ZodSchema, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const params = request.params;

    if (!schema) {
      throw new Error('Schema is required for ValidatedParams decorator');
    }

    const result = validateSchema(schema, params);
    
    if (!result.success) {
      const errorMessage = formatValidationErrors(result.errors);
      throw new BadRequestException(`Path parameter validation failed: ${errorMessage}`);
    }
    
    return result.data;
  },
);