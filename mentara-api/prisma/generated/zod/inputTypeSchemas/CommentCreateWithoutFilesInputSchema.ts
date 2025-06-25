import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { PostCreateNestedOneWithoutCommentsInputSchema } from './PostCreateNestedOneWithoutCommentsInputSchema';
import { UserCreateNestedOneWithoutCommentsInputSchema } from './UserCreateNestedOneWithoutCommentsInputSchema';
import { CommentHeartCreateNestedManyWithoutCommentInputSchema } from './CommentHeartCreateNestedManyWithoutCommentInputSchema';
import { ReplyCreateNestedManyWithoutCommentInputSchema } from './ReplyCreateNestedManyWithoutCommentInputSchema';

export const CommentCreateWithoutFilesInputSchema: z.ZodType<Prisma.CommentCreateWithoutFilesInput> = z.object({
  id: z.string().uuid().optional(),
  content: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  post: z.lazy(() => PostCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UserCreateNestedOneWithoutCommentsInputSchema),
  hearts: z.lazy(() => CommentHeartCreateNestedManyWithoutCommentInputSchema).optional(),
  replies: z.lazy(() => ReplyCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentCreateWithoutFilesInputSchema;
