import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentUncheckedCreateNestedManyWithoutParentInputSchema } from './CommentUncheckedCreateNestedManyWithoutParentInputSchema';
import { CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema';
import { ReplyUncheckedCreateNestedManyWithoutCommentInputSchema } from './ReplyUncheckedCreateNestedManyWithoutCommentInputSchema';

export const CommentUncheckedCreateWithoutFilesInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutFilesInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  children: z.lazy(() => CommentUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  hearts: z.lazy(() => CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentUncheckedCreateWithoutFilesInputSchema;
