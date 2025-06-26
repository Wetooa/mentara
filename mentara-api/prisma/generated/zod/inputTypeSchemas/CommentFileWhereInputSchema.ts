import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { CommentScalarRelationFilterSchema } from './CommentScalarRelationFilterSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';

export const CommentFileWhereInputSchema: z.ZodType<Prisma.CommentFileWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CommentFileWhereInputSchema),z.lazy(() => CommentFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentFileWhereInputSchema),z.lazy(() => CommentFileWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => CommentScalarRelationFilterSchema),z.lazy(() => CommentWhereInputSchema) ]).optional(),
}).strict();

export default CommentFileWhereInputSchema;
