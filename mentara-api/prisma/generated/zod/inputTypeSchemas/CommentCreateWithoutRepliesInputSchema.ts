import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedOneWithoutCommentsInputSchema } from './PostCreateNestedOneWithoutCommentsInputSchema';
import { UserCreateNestedOneWithoutCommentsInputSchema } from './UserCreateNestedOneWithoutCommentsInputSchema';
import { CommentCreateNestedOneWithoutChildrenInputSchema } from './CommentCreateNestedOneWithoutChildrenInputSchema';
import { CommentCreateNestedManyWithoutParentInputSchema } from './CommentCreateNestedManyWithoutParentInputSchema';
import { CommentHeartCreateNestedManyWithoutCommentInputSchema } from './CommentHeartCreateNestedManyWithoutCommentInputSchema';
import { CommentFileCreateNestedManyWithoutCommentInputSchema } from './CommentFileCreateNestedManyWithoutCommentInputSchema';

export const CommentCreateWithoutRepliesInputSchema: z.ZodType<Prisma.CommentCreateWithoutRepliesInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  post: z.lazy(() => PostCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentsInputSchema),
  parent: z.lazy(() => CommentCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => CommentCreateNestedManyWithoutParentInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartCreateNestedManyWithoutCommentInputSchema).optional(),
  files: z.lazy(() => CommentFileCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentCreateWithoutRepliesInputSchema;
