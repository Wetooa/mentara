import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const PostHeartScalarWhereInputSchema: z.ZodType<Prisma.PostHeartScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PostHeartScalarWhereInputSchema),z.lazy(() => PostHeartScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostHeartScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostHeartScalarWhereInputSchema),z.lazy(() => PostHeartScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default PostHeartScalarWhereInputSchema;
