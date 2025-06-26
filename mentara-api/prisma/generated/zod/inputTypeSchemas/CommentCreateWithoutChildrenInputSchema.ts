import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedOneWithoutCommentsInputSchema } from './PostCreateNestedOneWithoutCommentsInputSchema';
import { UserCreateNestedOneWithoutCommentsInputSchema } from './UserCreateNestedOneWithoutCommentsInputSchema';
import { CommentCreateNestedOneWithoutChildrenInputSchema } from './CommentCreateNestedOneWithoutChildrenInputSchema';
import { CommentHeartCreateNestedManyWithoutCommentInputSchema } from './CommentHeartCreateNestedManyWithoutCommentInputSchema';
import { CommentFileCreateNestedManyWithoutCommentInputSchema } from './CommentFileCreateNestedManyWithoutCommentInputSchema';
import { ReplyCreateNestedManyWithoutCommentInputSchema } from './ReplyCreateNestedManyWithoutCommentInputSchema';

export const CommentCreateWithoutChildrenInputSchema: z.ZodType<Prisma.CommentCreateWithoutChildrenInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  post: z.lazy(() => PostCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentsInputSchema),
  parent: z.lazy(() => CommentCreateNestedOneWithoutChildrenInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartCreateNestedManyWithoutCommentInputSchema).optional(),
  files: z.lazy(() => CommentFileCreateNestedManyWithoutCommentInputSchema).optional(),
  replies: z.lazy(() => ReplyCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentCreateWithoutChildrenInputSchema;
