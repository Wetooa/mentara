import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const ReviewHelpfulScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReviewHelpfulScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewHelpfulScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewHelpfulScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewHelpfulScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewHelpfulScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewHelpfulScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ReviewHelpfulScalarWhereWithAggregatesInputSchema;
