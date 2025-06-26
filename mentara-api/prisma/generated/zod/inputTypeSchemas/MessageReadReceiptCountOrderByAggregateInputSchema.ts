import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MessageReadReceiptCountOrderByAggregateInputSchema: z.ZodType<Prisma.MessageReadReceiptCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  messageId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  readAt: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MessageReadReceiptCountOrderByAggregateInputSchema;
