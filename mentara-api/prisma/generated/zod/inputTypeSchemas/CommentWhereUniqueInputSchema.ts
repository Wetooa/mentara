import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentWhereInputSchema } from './CommentWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { PostScalarRelationFilterSchema } from './PostScalarRelationFilterSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { CommentNullableScalarRelationFilterSchema } from './CommentNullableScalarRelationFilterSchema';
import { CommentListRelationFilterSchema } from './CommentListRelationFilterSchema';
import { CommentHeartListRelationFilterSchema } from './CommentHeartListRelationFilterSchema';
import { CommentFileListRelationFilterSchema } from './CommentFileListRelationFilterSchema';
import { ReplyListRelationFilterSchema } from './ReplyListRelationFilterSchema';

export const CommentWhereUniqueInputSchema: z.ZodType<Prisma.CommentWhereUniqueInput> = z.object({
  id: z.string().uuid()
})
.and(z.object({
  id: z.string().uuid().optional(),
  AND: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  heartCount: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  parentId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  post: z.union([ z.lazy(() => PostScalarRelationFilterSchema),z.lazy(() => PostWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  parent: z.union([ z.lazy(() => CommentNullableScalarRelationFilterSchema),z.lazy(() => CommentWhereInputSchema) ]).optional().nullable(),
  children: z.lazy(() => CommentListRelationFilterSchema).optional(),
  hearts: z.lazy(() => CommentHeartListRelationFilterSchema).optional(),
  files: z.lazy(() => CommentFileListRelationFilterSchema).optional(),
  replies: z.lazy(() => ReplyListRelationFilterSchema).optional()
}).strict());

export default CommentWhereUniqueInputSchema;
