import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulIncludeSchema } from '../inputTypeSchemas/ReviewHelpfulIncludeSchema'
import { ReviewHelpfulCreateInputSchema } from '../inputTypeSchemas/ReviewHelpfulCreateInputSchema'
import { ReviewHelpfulUncheckedCreateInputSchema } from '../inputTypeSchemas/ReviewHelpfulUncheckedCreateInputSchema'
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

export const ReviewHelpfulCreateArgsSchema: z.ZodType<Prisma.ReviewHelpfulCreateArgs> = z.object({
  select: ReviewHelpfulSelectSchema.optional(),
  include: z.lazy(() => ReviewHelpfulIncludeSchema).optional(),
  data: z.union([ ReviewHelpfulCreateInputSchema,ReviewHelpfulUncheckedCreateInputSchema ]),
}).strict() ;

export default ReviewHelpfulCreateArgsSchema;
