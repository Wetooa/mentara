import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentNullableScalarRelationFilterSchema: z.ZodType<Prisma.CommentNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => CommentWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => CommentWhereInputSchema).optional().nullable()
}).strict();

export default CommentNullableScalarRelationFilterSchema;
