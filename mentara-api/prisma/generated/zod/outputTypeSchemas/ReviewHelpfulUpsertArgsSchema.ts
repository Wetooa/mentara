import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulIncludeSchema } from '../inputTypeSchemas/ReviewHelpfulIncludeSchema'
import { ReviewHelpfulWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereUniqueInputSchema'
import { ReviewHelpfulCreateInputSchema } from '../inputTypeSchemas/ReviewHelpfulCreateInputSchema'
import { ReviewHelpfulUncheckedCreateInputSchema } from '../inputTypeSchemas/ReviewHelpfulUncheckedCreateInputSchema'
import { ReviewHelpfulUpdateInputSchema } from '../inputTypeSchemas/ReviewHelpfulUpdateInputSchema'
import { ReviewHelpfulUncheckedUpdateInputSchema } from '../inputTypeSchemas/ReviewHelpfulUncheckedUpdateInputSchema'
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

export const ReviewHelpfulUpsertArgsSchema: z.ZodType<Prisma.ReviewHelpfulUpsertArgs> = z.object({
  select: ReviewHelpfulSelectSchema.optional(),
  include: z.lazy(() => ReviewHelpfulIncludeSchema).optional(),
  where: ReviewHelpfulWhereUniqueInputSchema,
  create: z.union([ ReviewHelpfulCreateInputSchema,ReviewHelpfulUncheckedCreateInputSchema ]),
  update: z.union([ ReviewHelpfulUpdateInputSchema,ReviewHelpfulUncheckedUpdateInputSchema ]),
}).strict() ;

export default ReviewHelpfulUpsertArgsSchema;
