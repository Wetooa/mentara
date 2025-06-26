import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { ReviewScalarRelationFilterSchema } from './ReviewScalarRelationFilterSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const ReviewHelpfulWhereInputSchema: z.ZodType<Prisma.ReviewHelpfulWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewHelpfulWhereInputSchema),z.lazy(() => ReviewHelpfulWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewHelpfulWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewHelpfulWhereInputSchema),z.lazy(() => ReviewHelpfulWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  review: z.union([ z.lazy(() => ReviewScalarRelationFilterSchema),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
}).strict();

export default ReviewHelpfulWhereInputSchema;
