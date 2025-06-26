import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostHeartPostIdUserIdCompoundUniqueInputSchema } from './PostHeartPostIdUserIdCompoundUniqueInputSchema';
import { PostHeartWhereInputSchema } from './PostHeartWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { PostScalarRelationFilterSchema } from './PostScalarRelationFilterSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const PostHeartWhereUniqueInputSchema: z.ZodType<Prisma.PostHeartWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    postId_userId: z.lazy(() => PostHeartPostIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    postId_userId: z.lazy(() => PostHeartPostIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  postId_userId: z.lazy(() => PostHeartPostIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => PostHeartWhereInputSchema),z.lazy(() => PostHeartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PostHeartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PostHeartWhereInputSchema),z.lazy(() => PostHeartWhereInputSchema).array() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  post: z.union([ z.lazy(() => PostScalarRelationFilterSchema),z.lazy(() => PostWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export default PostHeartWhereUniqueInputSchema;
