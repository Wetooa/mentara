import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const TypingIndicatorScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TypingIndicatorScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => TypingIndicatorScalarWhereWithAggregatesInputSchema),z.lazy(() => TypingIndicatorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TypingIndicatorScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TypingIndicatorScalarWhereWithAggregatesInputSchema),z.lazy(() => TypingIndicatorScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  conversationId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isTyping: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  lastTypingAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TypingIndicatorScalarWhereWithAggregatesInputSchema;
