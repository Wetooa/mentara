import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const MessageReactionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MessageReactionScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MessageReactionScalarWhereWithAggregatesInputSchema),z.lazy(() => MessageReactionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageReactionScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageReactionScalarWhereWithAggregatesInputSchema),z.lazy(() => MessageReactionScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  messageId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  emoji: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default MessageReactionScalarWhereWithAggregatesInputSchema;
