import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const CommentFileOrderByRelationAggregateInputSchema: z.ZodType<Prisma.CommentFileOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default CommentFileOrderByRelationAggregateInputSchema;
