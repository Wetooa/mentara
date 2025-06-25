import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const CommentFileScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CommentFileScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => CommentFileScalarWhereWithAggregatesInputSchema),z.lazy(() => CommentFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentFileScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentFileScalarWhereWithAggregatesInputSchema),z.lazy(() => CommentFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default CommentFileScalarWhereWithAggregatesInputSchema;
