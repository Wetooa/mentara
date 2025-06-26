import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MessageSumOrderByAggregateInputSchema: z.ZodType<Prisma.MessageSumOrderByAggregateInput> = z.object({
  attachmentSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MessageSumOrderByAggregateInputSchema;
