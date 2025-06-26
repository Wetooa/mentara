import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReviewHelpfulUpdateManyMutationInputSchema'
import { ReviewHelpfulUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReviewHelpfulUncheckedUpdateManyInputSchema'
import { ReviewHelpfulWhereInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereInputSchema'

export const ReviewHelpfulUpdateManyArgsSchema: z.ZodType<Prisma.ReviewHelpfulUpdateManyArgs> = z.object({
  data: z.union([ ReviewHelpfulUpdateManyMutationInputSchema,ReviewHelpfulUncheckedUpdateManyInputSchema ]),
  where: ReviewHelpfulWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReviewHelpfulUpdateManyArgsSchema;
