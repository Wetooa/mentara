import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const MessageReactionOrderByRelationAggregateInputSchema: z.ZodType<Prisma.MessageReactionOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default MessageReactionOrderByRelationAggregateInputSchema;
