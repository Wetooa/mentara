import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ReplyOrderByWithRelationInputSchema } from './ReplyOrderByWithRelationInputSchema';

export const ReplyFileOrderByWithRelationInputSchema: z.ZodType<Prisma.ReplyFileOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  replyId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reply: z.lazy(() => ReplyOrderByWithRelationInputSchema).optional()
}).strict();

export default ReplyFileOrderByWithRelationInputSchema;
