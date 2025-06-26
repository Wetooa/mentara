import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulCreateManyInputSchema } from '../inputTypeSchemas/ReviewHelpfulCreateManyInputSchema'

export const ReviewHelpfulCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReviewHelpfulCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReviewHelpfulCreateManyInputSchema,ReviewHelpfulCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReviewHelpfulCreateManyAndReturnArgsSchema;
