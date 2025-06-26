import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MessageReadReceiptOrderByRelationAggregateInputSchema: z.ZodType<Prisma.MessageReadReceiptOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MessageReadReceiptOrderByRelationAggregateInputSchema;
