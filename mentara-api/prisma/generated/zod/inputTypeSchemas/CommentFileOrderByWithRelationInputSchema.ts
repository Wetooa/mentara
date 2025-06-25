import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CommentOrderByWithRelationInputSchema } from './CommentOrderByWithRelationInputSchema';

export const CommentFileOrderByWithRelationInputSchema: z.ZodType<Prisma.CommentFileOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  commentId: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  type: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  comment: z.lazy(() => CommentOrderByWithRelationInputSchema).optional()
}).strict();

export default CommentFileOrderByWithRelationInputSchema;
