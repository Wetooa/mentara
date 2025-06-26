import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const TypingIndicatorWhereInputSchema: z.ZodType<Prisma.TypingIndicatorWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TypingIndicatorWhereInputSchema),z.lazy(() => TypingIndicatorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TypingIndicatorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TypingIndicatorWhereInputSchema),z.lazy(() => TypingIndicatorWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  conversationId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isTyping: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  lastTypingAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default TypingIndicatorWhereInputSchema;
