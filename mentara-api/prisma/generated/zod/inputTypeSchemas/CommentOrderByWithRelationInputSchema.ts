import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { PostOrderByWithRelationInputSchema } from './PostOrderByWithRelationInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { CommentOrderByRelationAggregateInputSchema } from './CommentOrderByRelationAggregateInputSchema';
import { CommentHeartOrderByRelationAggregateInputSchema } from './CommentHeartOrderByRelationAggregateInputSchema';
import { CommentFileOrderByRelationAggregateInputSchema } from './CommentFileOrderByRelationAggregateInputSchema';
import { ReplyOrderByRelationAggregateInputSchema } from './ReplyOrderByRelationAggregateInputSchema';

export const CommentOrderByWithRelationInputSchema: z.ZodType<Prisma.CommentOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  postId: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  heartCount: z.lazy(() => SortOrderSchema).optional(),
  parentId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  post: z.lazy(() => PostOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  parent: z.lazy(() => CommentOrderByWithRelationInputSchema).optional(),
  children: z.lazy(() => CommentOrderByRelationAggregateInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartOrderByRelationAggregateInputSchema).optional(),
  files: z.lazy(() => CommentFileOrderByRelationAggregateInputSchema).optional(),
  replies: z.lazy(() => ReplyOrderByRelationAggregateInputSchema).optional()
}).strict();

export default CommentOrderByWithRelationInputSchema;
