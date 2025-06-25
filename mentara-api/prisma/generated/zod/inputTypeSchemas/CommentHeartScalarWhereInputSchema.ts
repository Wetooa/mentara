import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const CommentHeartScalarWhereInputSchema: z.ZodType<Prisma.CommentHeartScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CommentHeartScalarWhereInputSchema),z.lazy(() => CommentHeartScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentHeartScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentHeartScalarWhereInputSchema),z.lazy(() => CommentHeartScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  commentId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default CommentHeartScalarWhereInputSchema;
