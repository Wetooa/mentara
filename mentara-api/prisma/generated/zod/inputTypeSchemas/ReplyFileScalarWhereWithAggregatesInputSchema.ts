import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const ReplyFileScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReplyFileScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyFileScalarWhereWithAggregatesInputSchema),z.lazy(() => ReplyFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyFileScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyFileScalarWhereWithAggregatesInputSchema),z.lazy(() => ReplyFileScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  replyId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default ReplyFileScalarWhereWithAggregatesInputSchema;
