import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { PostScalarRelationFilterSchema } from './PostScalarRelationFilterSchema';
import { PostWhereInputSchema } from './PostWhereInputSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { CommentHeartListRelationFilterSchema } from './CommentHeartListRelationFilterSchema';
import { CommentFileListRelationFilterSchema } from './CommentFileListRelationFilterSchema';
import { ReplyListRelationFilterSchema } from './ReplyListRelationFilterSchema';

export const CommentWhereInputSchema: z.ZodType<Prisma.CommentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CommentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CommentWhereInputSchema),z.lazy(() => CommentWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  postId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  post: z.union([ z.lazy(() => PostScalarRelationFilterSchema),z.lazy(() => PostWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  hearts: z.lazy(() => CommentHeartListRelationFilterSchema).optional(),
  files: z.lazy(() => CommentFileListRelationFilterSchema).optional(),
  replies: z.lazy(() => ReplyListRelationFilterSchema).optional()
}).strict();

export default CommentWhereInputSchema;
