import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const ReplyHeartScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReplyHeartScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReplyHeartScalarWhereWithAggregatesInputSchema),z.lazy(() => ReplyHeartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReplyHeartScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReplyHeartScalarWhereWithAggregatesInputSchema),z.lazy(() => ReplyHeartScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  replyId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default ReplyHeartScalarWhereWithAggregatesInputSchema;
