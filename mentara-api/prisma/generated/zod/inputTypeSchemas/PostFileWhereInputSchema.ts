import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { PostScalarRelationFilterSchema } from './PostScalarRelationFilterSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostFileWhereInputSchema: z.ZodType<Prisma.PostFileWhereInput> = z.object({
  AND: z.union([ z.lazy(() => PostFileWhereInputSchema),z.lazy(() => PostFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostFileWhereInputSchema),z.lazy(() => PostFileWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  post: z.union([ z.lazy(() => PostScalarRelationFilterSchema),z.lazy(() => PostWhereInputSchema) ]).optional(),
}).strict();

export default PostFileWhereInputSchema;
