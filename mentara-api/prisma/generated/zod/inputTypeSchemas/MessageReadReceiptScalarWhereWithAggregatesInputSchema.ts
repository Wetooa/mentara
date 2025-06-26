import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const MessageReadReceiptScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MessageReadReceiptScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MessageReadReceiptScalarWhereWithAggregatesInputSchema),z.lazy(() => MessageReadReceiptScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReadReceiptScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReadReceiptScalarWhereWithAggregatesInputSchema),z.lazy(() => MessageReadReceiptScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  messageId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  readAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MessageReadReceiptScalarWhereWithAggregatesInputSchema;
