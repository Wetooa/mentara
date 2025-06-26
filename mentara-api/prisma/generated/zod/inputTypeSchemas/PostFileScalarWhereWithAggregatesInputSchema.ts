import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const PostFileScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PostFileScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => PostFileScalarWhereWithAggregatesInputSchema),z.lazy(() => PostFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostFileScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostFileScalarWhereWithAggregatesInputSchema),z.lazy(() => PostFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  postId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default PostFileScalarWhereWithAggregatesInputSchema;
