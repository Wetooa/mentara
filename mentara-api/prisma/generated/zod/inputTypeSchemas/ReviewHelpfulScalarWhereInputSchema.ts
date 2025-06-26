import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const ReviewHelpfulScalarWhereInputSchema: z.ZodType<Prisma.ReviewHelpfulScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewHelpfulScalarWhereInputSchema),z.lazy(() => ReviewHelpfulScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewHelpfulScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewHelpfulScalarWhereInputSchema),z.lazy(() => ReviewHelpfulScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ReviewHelpfulScalarWhereInputSchema;
