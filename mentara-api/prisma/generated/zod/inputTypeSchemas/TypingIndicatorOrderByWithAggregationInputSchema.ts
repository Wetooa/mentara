import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { TypingIndicatorCountOrderByAggregateInputSchema } from './TypingIndicatorCountOrderByAggregateInputSchema';
import { TypingIndicatorMaxOrderByAggregateInputSchema } from './TypingIndicatorMaxOrderByAggregateInputSchema';
import { TypingIndicatorMinOrderByAggregateInputSchema } from './TypingIndicatorMinOrderByAggregateInputSchema';

export const TypingIndicatorOrderByWithAggregationInputSchema: z.ZodType<Prisma.TypingIndicatorOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  conversationId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isTyping: z.lazy(() => SortOrderSchema).optional(),
  lastTypingAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TypingIndicatorCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TypingIndicatorMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TypingIndicatorMinOrderByAggregateInputSchema).optional()
}).strict();

export default TypingIndicatorOrderByWithAggregationInputSchema;
