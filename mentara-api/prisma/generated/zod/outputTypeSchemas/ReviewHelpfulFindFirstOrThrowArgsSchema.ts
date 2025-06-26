import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ReviewHelpfulIncludeSchema } from '../inputTypeSchemas/ReviewHelpfulIncludeSchema'
import { ReviewHelpfulWhereInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereInputSchema'
import { ReviewHelpfulOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReviewHelpfulOrderByWithRelationInputSchema'
import { ReviewHelpfulWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewHelpfulWhereUniqueInputSchema'
import { ReviewHelpfulScalarFieldEnumSchema } from '../inputTypeSchemas/ReviewHelpfulScalarFieldEnumSchema'
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

export const ReviewHelpfulFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ReviewHelpfulFindFirstOrThrowArgs> = z.object({
  select: ReviewHelpfulSelectSchema.optional(),
  include: z.lazy(() => ReviewHelpfulIncludeSchema).optional(),
  where: ReviewHelpfulWhereInputSchema.optional(),
  orderBy: z.union([ ReviewHelpfulOrderByWithRelationInputSchema.array(),ReviewHelpfulOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewHelpfulWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewHelpfulScalarFieldEnumSchema,ReviewHelpfulScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ReviewHelpfulFindFirstOrThrowArgsSchema;
