import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulWhereInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereInputSchema'
import { ReviewHelpfulOrderByWithAggregationInputSchema } from '../inputTypeSchemas/ReviewHelpfulOrderByWithAggregationInputSchema'
import { ReviewHelpfulScalarFieldEnumSchema } from '../inputTypeSchemas/ReviewHelpfulScalarFieldEnumSchema'
import { ReviewHelpfulScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/ReviewHelpfulScalarWhereWithAggregatesInputSchema'

export const ReviewHelpfulGroupByArgsSchema: z.ZodType<Prisma.ReviewHelpfulGroupByArgs> = z.object({
  where: ReviewHelpfulWhereInputSchema.optional(),
  orderBy: z.union([ ReviewHelpfulOrderByWithAggregationInputSchema.array(),ReviewHelpfulOrderByWithAggregationInputSchema ]).optional(),
  by: ReviewHelpfulScalarFieldEnumSchema.array(),
  having: ReviewHelpfulScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReviewHelpfulGroupByArgsSchema;
