import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ReplyOrderByWithRelationInputSchema } from './ReplyOrderByWithRelationInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const ReplyHeartOrderByWithRelationInputSchema: z.ZodType<Prisma.ReplyHeartOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  replyId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  reply: z.lazy(() => ReplyOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export default ReplyHeartOrderByWithRelationInputSchema;
