import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema';
import { CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema } from './CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema';
import { ReplyUncheckedCreateNestedManyWithoutCommentInputSchema } from './ReplyUncheckedCreateNestedManyWithoutCommentInputSchema';

export const CommentUncheckedCreateWithoutChildrenInputSchema: z.ZodType<Prisma.CommentUncheckedCreateWithoutChildrenInput> = z.object({
  id: z.string().uuid().optional(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  heartCount: z.number().int().optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  hearts: z.lazy(() => CommentHeartUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  files: z.lazy(() => CommentFileUncheckedCreateNestedManyWithoutCommentInputSchema).optional(),
  replies: z.lazy(() => ReplyUncheckedCreateNestedManyWithoutCommentInputSchema).optional()
}).strict();

export default CommentUncheckedCreateWithoutChildrenInputSchema;
