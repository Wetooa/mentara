import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const CommentFileScalarWhereInputSchema: z.ZodType<Prisma.CommentFileScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CommentFileScalarWhereInputSchema),z.lazy(() => CommentFileScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentFileScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentFileScalarWhereInputSchema),z.lazy(() => CommentFileScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default CommentFileScalarWhereInputSchema;
