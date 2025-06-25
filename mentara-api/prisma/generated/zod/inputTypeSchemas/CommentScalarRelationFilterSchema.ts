import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentScalarRelationFilterSchema: z.ZodType<Prisma.CommentScalarRelationFilter> = z.object({
  is: z.lazy(() => CommentWhereInputSchema).optional(),
  isNot: z.lazy(() => CommentWhereInputSchema).optional()
}).strict();

export default CommentScalarRelationFilterSchema;
