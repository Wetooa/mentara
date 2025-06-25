import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const PostFileScalarWhereInputSchema: z.ZodType<Prisma.PostFileScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PostFileScalarWhereInputSchema),z.lazy(() => PostFileScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostFileScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostFileScalarWhereInputSchema),z.lazy(() => PostFileScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default PostFileScalarWhereInputSchema;
