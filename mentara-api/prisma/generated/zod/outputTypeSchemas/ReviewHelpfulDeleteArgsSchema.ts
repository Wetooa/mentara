import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulIncludeSchema } from '../inputTypeSchemas/ReviewHelpfulIncludeSchema'
import { ReviewHelpfulWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereUniqueInputSchema'
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReviewHelpfulSelectSchema: z.ZodType<Prisma.ReviewHelpfulSelect> = z.object({
  id: z.boolean().optional(),
  reviewId: z.boolean().optional(),
  userId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const ReviewHelpfulDeleteArgsSchema: z.ZodType<Prisma.ReviewHelpfulDeleteArgs> = z.object({
  select: ReviewHelpfulSelectSchema.optional(),
  include: z.lazy(() => ReviewHelpfulIncludeSchema).optional(),
  where: ReviewHelpfulWhereUniqueInputSchema,
}).strict() ;

export default ReviewHelpfulDeleteArgsSchema;
