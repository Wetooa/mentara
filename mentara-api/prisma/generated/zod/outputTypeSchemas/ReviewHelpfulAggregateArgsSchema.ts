import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulWhereInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereInputSchema'
import { ReviewHelpfulOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReviewHelpfulOrderByWithRelationInputSchema'
import { ReviewHelpfulWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereUniqueInputSchema'

export const ReviewHelpfulAggregateArgsSchema: z.ZodType<Prisma.ReviewHelpfulAggregateArgs> = z.object({
  where: ReviewHelpfulWhereInputSchema.optional(),
  orderBy: z.union([ ReviewHelpfulOrderByWithRelationInputSchema.array(),ReviewHelpfulOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewHelpfulWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default ReviewHelpfulAggregateArgsSchema;
