import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostFileWhereInputSchema } from './PostFileWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { PostScalarRelationFilterSchema } from './PostScalarRelationFilterSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';

export const PostFileWhereUniqueInputSchema: z.ZodType<Prisma.PostFileWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => PostFileWhereInputSchema),z.lazy(() => PostFileWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostFileWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostFileWhereInputSchema),z.lazy(() => PostFileWhereInputSchema).array() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  post: z.union([ z.lazy(() => PostScalarRelationFilterSchema),z.lazy(() => PostWhereInputSchema) ]).optional(),
}).strict());

export default PostFileWhereUniqueInputSchema;
