import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulCreateManyInputSchema } from '../inputTypeSchemas/ReviewHelpfulCreateManyInputSchema'

export const ReviewHelpfulCreateManyArgsSchema: z.ZodType<Prisma.ReviewHelpfulCreateManyArgs> = z.object({
  data: z.union([ ReviewHelpfulCreateManyInputSchema,ReviewHelpfulCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReviewHelpfulCreateManyArgsSchema;
