import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MessageAvgOrderByAggregateInputSchema: z.ZodType<Prisma.MessageAvgOrderByAggregateInput> = z.object({
  attachmentSize: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MessageAvgOrderByAggregateInputSchema;
