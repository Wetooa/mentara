import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const ReplyScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReplyScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyScalarWhereWithAggregatesInputSchema),z.lazy(() => ReplyScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyScalarWhereWithAggregatesInputSchema),z.lazy(() => ReplyScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ReplyScalarWhereWithAggregatesInputSchema;
