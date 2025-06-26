import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const TypingIndicatorMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TypingIndicatorMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isTyping: z.lazy(() => SortOrderSchema).optional(),
  lastTypingAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default TypingIndicatorMaxOrderByAggregateInputSchema;
