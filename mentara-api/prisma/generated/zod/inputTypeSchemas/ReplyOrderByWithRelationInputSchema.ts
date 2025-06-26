import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CommentOrderByWithRelationInputSchema } from './CommentOrderByWithRelationInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ReplyHeartOrderByRelationAggregateInputSchema } from './ReplyHeartOrderByRelationAggregateInputSchema';
import { ReplyFileOrderByRelationAggregateInputSchema } from './ReplyFileOrderByRelationAggregateInputSchema';

export const ReplyOrderByWithRelationInputSchema: z.ZodType<Prisma.ReplyOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  commentId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  comment: z.lazy(() => CommentOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  hearts: z.lazy(() => ReplyHeartOrderByRelationAggregateInputSchema).optional(),
  files: z.lazy(() => ReplyFileOrderByRelationAggregateInputSchema).optional()
}).strict();

export default ReplyOrderByWithRelationInputSchema;
