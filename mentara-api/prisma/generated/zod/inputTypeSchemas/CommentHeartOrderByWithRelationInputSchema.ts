import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CommentOrderByWithRelationInputSchema } from './CommentOrderByWithRelationInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const CommentHeartOrderByWithRelationInputSchema: z.ZodType<Prisma.CommentHeartOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  commentId: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  comment: z.lazy(() => CommentOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional()
}).strict();

export default CommentHeartOrderByWithRelationInputSchema;
