import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema } from './ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema';
import { ReviewHelpfulWhereInputSchema } from './ReviewHelpfulWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ReviewScalarRelationFilterSchema } from './ReviewScalarRelationFilterSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const ReviewHelpfulWhereUniqueInputSchema: z.ZodType<Prisma.ReviewHelpfulWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    reviewId_userId: z.lazy(() => ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    reviewId_userId: z.lazy(() => ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  reviewId_userId: z.lazy(() => ReviewHelpfulReviewIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ReviewHelpfulWhereInputSchema),z.lazy(() => ReviewHelpfulWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewHelpfulWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewHelpfulWhereInputSchema),z.lazy(() => ReviewHelpfulWhereInputSchema).array() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  review: z.union([ z.lazy(() => ReviewScalarRelationFilterSchema),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict());

export default ReviewHelpfulWhereUniqueInputSchema;
