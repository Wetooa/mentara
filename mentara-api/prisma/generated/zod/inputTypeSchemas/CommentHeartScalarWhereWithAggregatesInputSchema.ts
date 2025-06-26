import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const CommentHeartScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CommentHeartScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CommentHeartScalarWhereWithAggregatesInputSchema),z.lazy(() => CommentHeartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentHeartScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentHeartScalarWhereWithAggregatesInputSchema),z.lazy(() => CommentHeartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default CommentHeartScalarWhereWithAggregatesInputSchema;
