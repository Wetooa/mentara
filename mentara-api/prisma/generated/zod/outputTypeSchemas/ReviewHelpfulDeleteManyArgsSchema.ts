import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulWhereInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereInputSchema'

export const ReviewHelpfulDeleteManyArgsSchema: z.ZodType<Prisma.ReviewHelpfulDeleteManyArgs> = z.object({
  where: ReviewHelpfulWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReviewHelpfulDeleteManyArgsSchema;
