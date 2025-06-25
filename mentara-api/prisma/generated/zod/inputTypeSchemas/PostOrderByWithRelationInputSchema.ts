import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { PostFileOrderByRelationAggregateInputSchema } from './PostFileOrderByRelationAggregateInputSchema';
import { CommentOrderByRelationAggregateInputSchema } from './CommentOrderByRelationAggregateInputSchema';
import { PostHeartOrderByRelationAggregateInputSchema } from './PostHeartOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { RoomOrderByWithRelationInputSchema } from './RoomOrderByWithRelationInputSchema';

export const PostOrderByWithRelationInputSchema: z.ZodType<Prisma.PostOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  roomId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  files: z.lazy(() => PostFileOrderByRelationAggregateInputSchema).optional(),
  comments: z.lazy(() => CommentOrderByRelationAggregateInputSchema).optional(),
  hearts: z.lazy(() => PostHeartOrderByRelationAggregateInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  room: z.lazy(() => RoomOrderByWithRelationInputSchema).optional()
}).strict();

export default PostOrderByWithRelationInputSchema;
