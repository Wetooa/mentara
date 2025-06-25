import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartCommentIdUserIdCompoundUniqueInputSchema } from './CommentHeartCommentIdUserIdCompoundUniqueInputSchema';
import { CommentHeartWhereInputSchema } from './CommentHeartWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { CommentScalarRelationFilterSchema } from './CommentScalarRelationFilterSchema';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const CommentHeartWhereUniqueInputSchema: z.ZodType<Prisma.CommentHeartWhereUniqueInput> = z.union([
  z.object({
    id: z.string().uuid(),
    commentId_userId: z.lazy(() => CommentHeartCommentIdUserIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().uuid(),
  }),
  z.object({
    commentId_userId: z.lazy(() => CommentHeartCommentIdUserIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().uuid().optional(),
  commentId_userId: z.lazy(() => CommentHeartCommentIdUserIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => CommentHeartWhereInputSchema),z.lazy(() => CommentHeartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentHeartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentHeartWhereInputSchema),z.lazy(() => CommentHeartWhereInputSchema).array() ]).optional(),
  commentId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  comment: z.union([ z.lazy(() => CommentScalarRelationFilterSchema),z.lazy(() => CommentWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
}).strict());

export default CommentHeartWhereUniqueInputSchema;
