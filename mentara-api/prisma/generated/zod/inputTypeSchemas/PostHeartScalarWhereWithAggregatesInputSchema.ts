import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const PostHeartScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PostHeartScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PostHeartScalarWhereWithAggregatesInputSchema),z.lazy(() => PostHeartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostHeartScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostHeartScalarWhereWithAggregatesInputSchema),z.lazy(() => PostHeartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  postId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default PostHeartScalarWhereWithAggregatesInputSchema;
